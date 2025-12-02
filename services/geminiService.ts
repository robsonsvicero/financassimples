import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const getFinancialTip = async (): Promise<string> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: "Forneça uma dica financeira curta, moderna e prática para um aplicativo de finanças pessoais (max 20 palavras). Foque em economia, investimentos ou controle de gastos. Em Português do Brasil.",
    });

    return response.text || "Economize sempre que possível!";
  } catch (error) {
    console.error("Failed to fetch tip:", error);
    return "Mantenha o foco nos seus objetivos financeiros!";
  }
};