
import { GoogleGenAI, Type } from "@google/genai";
import { Message, Analysis, ConsoleMessage } from "../types";

// Always use named parameter for apiKey and source it from process.env.API_KEY
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

/**
 * Uses Vision to transcribe a document page image.
 * This acts as a robust OCR replacement.
 */
export async function transcribeDocumentPage(base64Image: string): Promise<string> {
  const model = "gemini-3-flash-preview";
  
  const response = await ai.models.generateContent({
    model,
    contents: {
      parts: [
        {
          inlineData: {
            mimeType: "image/jpeg",
            data: base64Image,
          },
        },
        {
          text: "Transcribe the text in this document image exactly as it appears. Preserve the logical structure and hierarchy of information. If it is a chat transcript, identify the speakers.",
        },
      ],
    },
    config: {
      temperature: 0.1, // Low temperature for factual transcription
    }
  });

  return response.text || "";
}

export async function analyzeThread(messages: Message[]): Promise<Analysis> {
  const model = "gemini-3-flash-preview";
  
  const threadContext = messages.map(m => `[${m.role.toUpperCase()}]: ${m.contentText}`).join('\n\n');
  
  const response = await ai.models.generateContent({
    model,
    contents: `Analyze this chat history:\n\n${threadContext}`,
    config: {
      systemInstruction: "You are an intelligence analyst. Summarize this thread and extract structured entities and items (tasks, decisions, requirements). Be concise, serious, and objective.",
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          summaryShort: { type: Type.STRING },
          summaryLong: { type: Type.STRING },
          overallConfidence: { type: Type.NUMBER },
          entities: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                canonicalName: { type: Type.STRING },
                entityType: { type: Type.STRING },
                aliases: { type: Type.ARRAY, items: { type: Type.STRING } },
                confidence: { type: Type.NUMBER }
              },
              required: ["canonicalName", "entityType", "confidence"]
            }
          },
          items: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                domain: { type: Type.STRING },
                projectName: { type: Type.STRING, nullable: true },
                itemType: { type: Type.STRING },
                title: { type: Type.STRING },
                body: { type: Type.STRING },
                status: { type: Type.STRING },
                priority: { type: Type.STRING },
                confidence: { type: Type.NUMBER },
                evidence: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      messageIndex: { type: Type.NUMBER },
                      excerpt: { type: Type.STRING }
                    }
                  }
                }
              },
              required: ["domain", "itemType", "title", "body", "status", "priority", "confidence"]
            }
          }
        },
        required: ["summaryShort", "summaryLong", "overallConfidence", "entities", "items"]
      }
    }
  });

  const parsed = JSON.parse(response.text || '{}');
  return {
    id: `analysis-${Date.now()}`,
    runVersion: "2.0.0",
    analyzedAt: new Date().toISOString(),
    ...parsed
  };
}

export async function queryAnalyst(
  question: string, 
  contextExcerpts: { threadId: string; threadTitle: string; index: number; content: string }[]
): Promise<Partial<ConsoleMessage>> {
  const model = "gemini-3-flash-preview";
  
  const contextBlock = contextExcerpts.length > 0 
    ? contextExcerpts.map((c, i) => `REFERENCE [${i}]: (Thread: ${c.threadTitle}, Msg: ${c.index})\n${c.content}`).join('\n\n')
    : "NO DIRECT DATA FOUND IN VAULT.";

  const prompt = `User Question: ${question}\n\nEvidence from Vault:\n${contextBlock}`;

  const response = await ai.models.generateContent({
    model,
    contents: prompt,
    config: {
      systemInstruction: "You are the Chat Vault Analyst. Answer based ONLY on the provided evidence. If the evidence doesn't contain the answer, say you don't know based on current records. Every claim must list which REFERENCE index it came from. Return JSON format with 'answer' and 'citedReferenceIndices'.",
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          answer: { type: Type.STRING },
          citedReferenceIndices: { type: Type.ARRAY, items: { type: Type.INTEGER } }
        },
        required: ["answer", "citedReferenceIndices"]
      }
    }
  });

  const parsed = JSON.parse(response.text || '{}');
  
  const citations = (parsed.citedReferenceIndices || [])
    .filter((idx: number) => contextExcerpts[idx])
    .map((idx: number) => ({
      threadId: contextExcerpts[idx].threadId,
      messageIndex: contextExcerpts[idx].index,
      excerpt: contextExcerpts[idx].content,
      threadTitle: contextExcerpts[idx].threadTitle
    }));

  return {
    contentText: parsed.answer,
    citations: citations
  };
}
