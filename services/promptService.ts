
import { FiveBoxStructure, PromptConfig, EnhancedPromptResult } from "../types";
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const HIDDEN_SYSTEM_PROMPT = `You are a high-level prompt engineering specialist. 
Your task is to rewrite the user's raw input into a professional, structured, and highly effective instruction for advanced AI models (like Gemini 3).
Maintain precision, factual accuracy, and follow the specified parameters for creativity and precision.
If context or constraints are provided, weave them seamlessly into the core logic.
Avoid generic fluff. Prioritize logical flow and unambiguous phrasing.`;

export async function enhancePrompt(
  rawInput: string,
  config: PromptConfig,
  fiveBox?: FiveBoxStructure
): Promise<string> {
  const model = "gemini-3-flash-preview";
  
  // Construct the construction meta-prompt
  let constructionPrompt = `[SYSTEM_INSTRUCTION]\n${HIDDEN_SYSTEM_PROMPT}\n\n`;
  constructionPrompt += `[CONFIG_PARAMETERS]\n- Creativity Level: ${config.creativity}%\n- Precision Level: ${config.precision}%\n- Reasoning Budget: ${config.thinkingBudget} tokens\n\n`;

  if (config.useFiveBox && fiveBox) {
    constructionPrompt += `[STRUCTURED_FRAMEWORK: FIVE_BOX]\n`;
    constructionPrompt += `BOX 1 (PERSONA): ${fiveBox.role}\n`;
    constructionPrompt += `BOX 2 (TASK): ${fiveBox.task}\n`;
    constructionPrompt += `BOX 3 (CONTEXT): ${fiveBox.context}\n`;
    constructionPrompt += `BOX 4 (OUTPUT_SHAPE): ${fiveBox.outputShape}\n`;
    constructionPrompt += `BOX 5 (EVALUATION): ${fiveBox.criteria}\n\n`;
  }

  constructionPrompt += `[RAW_USER_QUERY]\n${rawInput}\n\n`;
  constructionPrompt += `[FINAL_DIRECTIVE]\nCombine all the above into a single, cohesive, optimized prompt output only. Ensure the tone is direct and the objective is unmistakable. Do not include your own thoughts or meta-commentary.`;

  const response = await ai.models.generateContent({
    model,
    contents: constructionPrompt,
    config: {
      temperature: 1 - (config.precision / 100),
      thinkingConfig: config.thinkingBudget > 0 ? { thinkingBudget: config.thinkingBudget } : undefined
    }
  });

  return response.text || "";
}

export function saveToHistory(userId: string, result: EnhancedPromptResult) {
  const key = `prompt_history_${userId}`;
  const history = JSON.parse(localStorage.getItem(key) || "[]");
  localStorage.setItem(key, JSON.stringify([result, ...history]));
}

export function getHistory(userId: string): EnhancedPromptResult[] {
  const key = `prompt_history_${userId}`;
  return JSON.parse(localStorage.getItem(key) || "[]");
}
