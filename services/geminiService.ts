import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const getFinancialTip = async (): Promise<string> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: "Forneça UMA ÚNICA dica financeira curta, moderna e prática para um aplicativo de finanças pessoais (max 20 palavras). Foque em economia, investimentos ou controle de gastos. Em Português do Brasil. Responda APENAS com a dica, sem numeração, sem pontos, sem quebras de linha.",
    });

    // Remove quebras de linha extras e espaços desnecessários
    const cleanedText = response.text?.replace(/\n+/g, ' ').trim() || "Economize sempre que possível!";
    
    // Se houver múltiplas frases, pega apenas a primeira
    const firstSentence = cleanedText.split(/[.!?]/)[0].trim();
    
    return firstSentence || "Economize sempre que possível!";
  } catch (error) {
    console.error("Failed to fetch tip:", error);
    return "Mantenha o foco nos seus objetivos financeiros!";
  }
};