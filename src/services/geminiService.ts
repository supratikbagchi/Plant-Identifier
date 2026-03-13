import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export async function identifyPlant(base64Image: string) {
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
        data: base64Image.split(",")[1], // Remove the data:image/jpeg;base64, prefix
      },
    };

    const response = await ai.models.generateContent({
      model,
      contents: [{ parts: [{ text: prompt }, imagePart] }],
    });

    return response.text;
  } catch (error) {
    console.error("Error identifying plant:", error);
    throw error;
  }
}
