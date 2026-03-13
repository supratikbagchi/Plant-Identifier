import { GoogleGenAI } from "@google/genai";

// Use a type cast to avoid TS errors with import.meta.env
const API_KEY = (import.meta as any).env?.VITE_GEMINI_API_KEY || process.env.GEMINI_API_KEY;

export async function identifyPlant(base64Image: string) {
  // Relaxed check: only throw if it's truly empty or the literal placeholder
  if (!API_KEY || API_KEY === "MY_GEMINI_API_KEY" || API_KEY === "") {
    // In AI Studio, we want to be helpful but not block execution if the key is actually there but the check is too strict
    console.warn("API Key might be missing or using placeholder.");
  }

  const ai = new GoogleGenAI({ apiKey: API_KEY || "" });

  try {
    const model = "gemini-3-flash-preview";
    const prompt = `Identify this plant. Provide the following details in a structured format:
    1. Common Name
    2. Scientific Name
    3. Care Level (Easy, Moderate, Hard)
    4. Watering Needs
    5. Sunlight Needs
    6. A brief, interesting fact.
    
    Keep the response concise and aesthetic.`;

    const imagePart = {
      inlineData: {
        mimeType: "image/jpeg",
        data: base64Image.split(",")[1],
      },
    };

    const response = await ai.models.generateContent({
      model,
      contents: [{ parts: [{ text: prompt }, imagePart] }],
    });

    return response.text;
  } catch (error: any) {
    console.error("Gemini API Error:", error);
    if (error.message?.includes("API key not valid")) {
      throw new Error("The API Key provided is invalid. Please check your key settings.");
    }
    throw new Error("Failed to identify plant. Please try again.");
  }
}
