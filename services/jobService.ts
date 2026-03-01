
import { Batch, ImportFile, Thread, Message } from "../types";
import { analyzeThread, transcribeDocumentPage } from "./geminiService";

const OCR_CONCURRENCY = 2;
const PARSE_CONCURRENCY = 4;

class JobService {
  private activeJobs = new Set<string>();

  constructor() {
    this.startWorker();
  }

  private validateTransition(current: string, next: string): boolean {
    const rules: Record<string, string[]> = {
      "queued": ["running", "error"],
      "running": ["done", "error", "queued"], // queued for watchdog requeue
      "error": ["queued"],
      "done": [] // final state
    };
    return rules[current]?.includes(next) ?? false;
  }

  private getBatches(userId: string): Batch[] {
    return JSON.parse(localStorage.getItem(`batches_${userId}`) || "[]");
  }

  private saveBatches(userId: string, batches: Batch[]) {
    localStorage.setItem(`batches_${userId}`, JSON.stringify(batches));
  }

  private getBatchFiles(batchId: string): ImportFile[] {
    return JSON.parse(localStorage.getItem(`batch_files_${batchId}`) || "[]");
  }

  private saveBatchFiles(batchId: string, files: ImportFile[]) {
    localStorage.setItem(`batch_files_${batchId}`, JSON.stringify(files));
  }

  async createBatch(user: { uid: string }, files: File[]): Promise<string> {
    const batchId = `batch-${Date.now()}`;
    const newBatch: Batch = {
      id: batchId,
      userId: user.uid,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      status: "queued",
      totalFiles: files.length,
      queuedFiles: files.length,
      runningFiles: 0,
      doneFiles: 0,
      failedFiles: 0,
    };

    const importFiles: ImportFile[] = await Promise.all(
      files.map(async (f, idx) => {
        const isPdf = f.name.toLowerCase().endsWith(".pdf");
        const fileContent = isPdf ? "" : await f.text();
        const fileId = `${batchId}-${idx}`;
        
        if (!isPdf) {
          localStorage.setItem(`file_raw_${fileId}`, fileContent);
        } else {
          const buffer = await f.arrayBuffer();
          (window as any)[`pdf_data_${fileId}`] = buffer; 
        }

        return {
          id: fileId,
          batchId,
          userId: user.uid,
          fileName: f.name,
          fileType: isPdf ? "pdf" : "txt",
          jobType: isPdf ? "OCR_PDF" : "PARSE_TEXT",
          priority: isPdf ? 10 : 100,
          status: "queued",
          stage: "upload",
          progressPct: 0,
          threadId: null,
          errorMessage: null,
          updatedAt: new Date().toISOString(),
        };
      })
    );

    const batches = this.getBatches(user.uid);
    this.saveBatches(user.uid, [newBatch, ...batches]);
    this.saveBatchFiles(batchId, importFiles);

    return batchId;
  }

  private async updateBatchStatus(userId: string, batchId: string) {
    const files = this.getBatchFiles(batchId);
    const batches = this.getBatches(userId);
    const bIdx = batches.findIndex(b => b.id === batchId);
    if (bIdx === -1) return;

    const b = batches[bIdx];
    b.queuedFiles = files.filter(f => f.status === "queued").length;
    b.runningFiles = files.filter(f => f.status === "running").length;
    b.doneFiles = files.filter(f => f.status === "done").length;
    b.failedFiles = files.filter(f => f.status === "error").length;

    if (b.doneFiles + b.failedFiles === b.totalFiles) {
      b.status = "complete";
    } else if (b.runningFiles > 0) {
      b.status = "running";
    } else {
      b.status = "queued";
    }
    b.updatedAt = new Date().toISOString();
    this.saveBatches(userId, batches);
  }

  private startWorker() {
    setInterval(() => this.workerTick(), 1500);
  }

  private async workerTick() {
    const user = JSON.parse(localStorage.getItem("vault_user") || "null");
    if (!user) return;

    const batches = this.getBatches(user.uid);
    for (const batch of batches) {
      if (batch.status === "complete") continue;

      const files = this.getBatchFiles(batch.id);
      const currentOcr = files.filter(f => f.status === "running" && f.jobType === "OCR_PDF").length;
      const currentParse = files.filter(f => f.status === "running" && f.jobType === "PARSE_TEXT").length;

      const queued = files
        .filter(f => f.status === "queued")
        .sort((a, b) => b.priority - a.priority || new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime());

      for (const file of queued) {
        if (this.activeJobs.has(file.id)) continue;
        
        const canRunOcr = file.jobType === "OCR_PDF" && currentOcr < OCR_CONCURRENCY;
        const canRunParse = file.jobType === "PARSE_TEXT" && currentParse < PARSE_CONCURRENCY;

        if (canRunOcr || canRunParse) {
          this.processFile(user.uid, batch.id, file.id);
        }
      }
    }
  }

  private async processFile(userId: string, batchId: string, fileId: string) {
    this.activeJobs.add(fileId);
    
    let files = this.getBatchFiles(batchId);
    let fIdx = files.findIndex(f => f.id === fileId);
    if (fIdx === -1 || !this.validateTransition(files[fIdx].status, "running")) {
      this.activeJobs.delete(fileId);
      return;
    }

    files[fIdx].status = "running";
    files[fIdx].updatedAt = new Date().toISOString();
    this.saveBatchFiles(batchId, files);
    this.updateBatchStatus(userId, batchId);

    try {
      const file = files[fIdx];
      let messages: Message[] = [];
      let source = "other";

      if (file.jobType === "PARSE_TEXT") {
        file.stage = "parse";
        file.progressPct = 20;
        this.saveBatchFiles(batchId, files);

        const text = localStorage.getItem(`file_raw_${fileId}`) || "";
        if (file.fileName.endsWith(".json")) {
          const json = JSON.parse(text);
          messages = (json.messages || []).map((m: any, idx: number) => ({
            id: `m-${idx}`,
            role: m.role || "unknown",
            sentAt: m.sentAt || null,
            index: idx,
            contentText: m.contentText || m.content || "",
          }));
          source = json.sourcePlatform || "other";
        } else {
          messages = text.split("\n\n").filter(s => s.trim()).map((s, idx) => ({
            id: `m-${idx}`,
            role: "unknown",
            sentAt: null,
            index: idx,
            contentText: s.trim(),
          }));
          source = "text/import";
        }
      } else if (file.jobType === "OCR_PDF") {
        file.stage = "ocr";
        file.progressPct = 10;
        this.saveBatchFiles(batchId, files);
        
        const buffer = (window as any)[`pdf_data_${fileId}`];
        if (!buffer) throw new Error("CRITICAL_ERR: PDF binary not found in cache.");

        const pdf = await (window as any).pdfjsLib.getDocument({ data: buffer }).promise;
        let fullText = "";
        for (let i = 1; i <= pdf.numPages; i++) {
          const page = await pdf.getPage(i);
          const viewport = page.getViewport({ scale: 2.0 });
          const canvas = document.createElement("canvas");
          const context = canvas.getContext("2d")!;
          canvas.height = viewport.height;
          canvas.width = viewport.width;
          await page.render({ canvasContext: context, viewport }).promise;
          const base64Image = canvas.toDataURL("image/jpeg", 0.75).split(",")[1];
          const pageText = await transcribeDocumentPage(base64Image);
          fullText += `\n--- PAGE ${i} ---\n` + pageText;
          
          files[fIdx].progressPct = Math.round(10 + (i / pdf.numPages) * 60);
          this.saveBatchFiles(batchId, files);
        }
        
        messages = fullText.split("--- PAGE").filter(s => s.trim()).map((s, idx) => ({
          id: `m-${idx}`,
          role: "system",
          sentAt: null,
          index: idx,
          contentText: s.trim(),
        }));
        source = "document/pdf";
      }

      file.stage = "analyze";
      file.progressPct = 85;
      this.saveBatchFiles(batchId, files);

      const threadId = `t-${Date.now()}-${fIdx}`;
      const analysis = await analyzeThread(messages);

      const newThread: Thread = {
        id: threadId,
        userId,
        importId: batchId,
        title: file.fileName.replace(/\.[^/.]+$/, ""),
        sourcePlatform: source,
        createdAt: new Date().toISOString(),
        messageCount: messages.length,
        hasMedia: false,
      };

      const savedThreads = JSON.parse(localStorage.getItem(`threads_${userId}`) || "[]");
      localStorage.setItem(`threads_${userId}`, JSON.stringify([...savedThreads, newThread]));
      localStorage.setItem(`messages_${threadId}`, JSON.stringify(messages));
      localStorage.setItem(`analysis_${threadId}`, JSON.stringify(analysis));

      file.status = "done";
      file.progressPct = 100;
      file.threadId = threadId;

    } catch (err: any) {
      console.error(`ScopeX Job Error [${fileId}]:`, err);
      files[fIdx].status = "error";
      files[fIdx].errorMessage = err.message || "Unknown Failure";
    } finally {
      this.activeJobs.delete(fileId);
      files[fIdx].updatedAt = new Date().toISOString();
      this.saveBatchFiles(batchId, files);
      this.updateBatchStatus(userId, batchId);
    }
  }

  async retryFailed(userId: string, batchId: string) {
    const files = this.getBatchFiles(batchId);
    const updated = files.map(f => {
      if (f.status === "error") {
        return { ...f, status: "queued" as const, errorMessage: null, progressPct: 0, updatedAt: new Date().toISOString() };
      }
      return f;
    });
    this.saveBatchFiles(batchId, updated);
    this.updateBatchStatus(userId, batchId);
  }

  // Added resumeStalled method to fix error in BatchDetail.tsx
  async resumeStalled(userId: string, batchId: string) {
    const files = this.getBatchFiles(batchId);
    const updated = files.map(f => {
      if (f.status === "running") {
        // Move stuck jobs back to queued state so the worker can retry them
        return { ...f, status: "queued" as const, updatedAt: new Date().toISOString() };
      }
      return f;
    });
    this.saveBatchFiles(batchId, updated);
    this.updateBatchStatus(userId, batchId);
  }
}

export const jobService = new JobService();
