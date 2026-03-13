import { GoogleGenAI, Type } from "@google/genai";

// Use a type cast to avoid TS errors with import.meta.env
const API_KEY = (import.meta as any).env?.VITE_GEMINI_API_KEY || process.env.GEMINI_API_KEY;

export async function identifyPlant(base64Image: string) {
  if (!API_KEY || API_KEY === "MY_GEMINI_API_KEY" || API_KEY === "") {
    console.warn("API Key might be missing or using placeholder.");
  }

  const ai = new GoogleGenAI({ apiKey: API_KEY || "" });

  try {
    const model = "gemini-3-flash-preview";
    const prompt = `Identify this plant from the image. Provide the details in JSON format. 
    IMPORTANT: Do not use any markdown formatting (like asterisks or bolding) inside the JSON values.`;

    const imagePart = {
      inlineData: {
        mimeType: "image/jpeg",
        data: base64Image.split(",")[1],
      },
    };

    const response = await ai.models.generateContent({
      model,
      contents: [{ parts: [{ text: prompt }, imagePart] }],
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            commonName: { type: Type.STRING },
            scientificName: { type: Type.STRING },
            careLevel: { type: Type.STRING },
            watering: { type: Type.STRING },
            sunlight: { type: Type.STRING },
            fact: { type: Type.STRING },
            description: { type: Type.STRING }
          },
          required: ["commonName", "scientificName", "careLevel", "watering", "sunlight", "fact"]
        }
      }
    });

    return JSON.parse(response.text);
  } catch (error: any) {
    console.error("Gemini API Error:", error);
    if (error.message?.includes("API key not valid")) {
      throw new Error("The API Key provided is invalid. Please check your key settings.");
    }
    throw new Error("Failed to identify plant. Please try again.");
  }
}
