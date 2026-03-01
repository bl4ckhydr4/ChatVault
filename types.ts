
export type Role = "user" | "assistant" | "system" | "tool" | "other" | "unknown";

export interface Message {
  id?: string;
  role: Role;
  sentAt: string | null;
  index: number;
  contentText: string;
}

export interface Thread {
  id: string;
  userId: string;
  importId: string;
  title: string | null;
  sourcePlatform: string | null;
  createdAt: string;
  messageCount: number;
  hasMedia: boolean;
}

export interface FiveBoxStructure {
  role: string;
  task: string;
  context: string;
  outputShape: string;
  criteria: string;
}

export interface PromptConfig {
  creativity: number;
  precision: number;
  thinkingBudget: number;
  useFiveBox: boolean;
}

export interface EnhancedPromptResult {
  id: string;
  timestamp: string;
  rawInput: string;
  enhancedOutput: string;
  config: PromptConfig;
  fiveBox?: FiveBoxStructure;
}

export type JobStatus = "queued" | "running" | "done" | "error";
export type JobStage = "upload" | "parse" | "ocr" | "analyze";
export type FileType = "pdf" | "json" | "txt" | "md" | "other";

export interface Batch {
  id: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
  status: "queued" | "running" | "complete" | "error";
  totalFiles: number;
  queuedFiles: number;
  runningFiles: number;
  doneFiles: number;
  failedFiles: number;
}

export interface ImportFile {
  id: string;
  batchId: string;
  userId: string;
  fileName: string;
  fileType: FileType;
  jobType: "PARSE_TEXT" | "OCR_PDF";
  priority: number;
  status: JobStatus;
  stage: JobStage;
  progressPct: number;
  threadId: string | null;
  errorMessage: string | null;
  updatedAt: string;
}

export interface Entity {
  canonicalName: string;
  entityType: string;
  aliases: string[];
  confidence: number;
}

export interface ExtractedItem {
  domain: string;
  projectName: string | null;
  itemType: string;
  title: string;
  body: string;
  status: string;
  priority: string;
  confidence: number;
  evidence: { messageIndex: number; excerpt: string }[];
}

export interface Analysis {
  id: string;
  runVersion: string;
  analyzedAt: string;
  summaryShort: string;
  summaryLong: string;
  overallConfidence: number;
  entities: Entity[];
  items: ExtractedItem[];
}

export interface ConsoleMessage {
  id: string;
  role: "user" | "assistant" | "system";
  createdAt: string;
  contentText: string;
  citations?: { threadId: string; messageIndex: number; excerpt: string; threadTitle?: string }[];
}

export interface User {
  uid: string;
  email: string | null;
  displayName: string | null;
  createdAt: string;
}

// Added missing Project interface to fix error in Projects.tsx
export interface Project {
  id: string;
  userId: string;
  canonicalName: string;
  description: string | null;
  status: string;
  createdAt: string;
  lastActivityAt: string;
}

// Added missing ProjectItem interface to fix error in Projects.tsx
export interface ProjectItem {
  id?: string;
  threadId: string;
  itemType: string;
  title: string;
  body: string;
  status: string;
  priority: string;
}
