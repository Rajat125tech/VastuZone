const { GoogleGenerativeAI } = require("@google/generative-ai");
const pdf = require("pdf-img-convert");
const logger = require("./logger");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

/**
 * Extracts room directions from a PDF floor plan using Gemini 1.5 Flash (Free Tier)
 * @param {Buffer} pdfBuffer - The buffer of the uploaded PDF
 * @returns {Promise<Object>} - Extracted directions
 */
async function extractDirectionsFromPDF(pdfBuffer) {
  try {
    if (!process.env.GEMINI_API_KEY) {
      logger.warn("GEMINI_API_KEY not found. Skipping AI analysis.");
      return null;
    }

    // 1. Convert the first page of PDF to an image buffer
    const outputImages = await pdf.convert(pdfBuffer, { width: 1024 });
    const imageBase64 = outputImages[0].toString("base64");

    // 2. Initialize Gemini 1.5 Flash (Optimized for speed and free usage)
    const model = genAI.getGenerativeModel({ 
      model: "gemini-1.5-flash",
      generationConfig: {
        responseMimeType: "application/json",
      }
    });

    const prompt = `
      You are a professional Vastu Architect. 
      Analyze the attached floor plan image and identify the locations (directions) of the following rooms.
      Assume the top of the image is North unless a North arrow is clearly visible.
      
      Identify directions for:
      - Living Room
      - Kitchen
      - Master Bedroom
      - Kids Bedroom
      - Bathroom
      - Pooja Room

      The directions MUST be one of these exact strings: "North", "South", "East", "West", "North-East", "North-West", "South-East", "South-West".

      Return the results as a JSON object with these exact keys:
      "livingRoomDirection", "kitchenDirection", "masterBedroomDirection", "kidsBedroomDirection", "bathroomDirection", "poojaRoomDirection".
    `;

    const result = await model.generateContent([
      prompt,
      {
        inlineData: {
          data: imageBase64,
          mimeType: "image/png",
        },
      },
    ]);

    const response = await result.response;
    const text = response.text();
    
    // Gemini with responseMimeType: "application/json" returns a clean string
    const extractedData = JSON.parse(text);
    logger.info("Gemini AI successfully extracted directions from floor plan");
    return extractedData;

  } catch (error) {
    logger.error("Gemini Vision extraction failed:", error);
    return null; // Fallback to manual data
  }
}

module.exports = { extractDirectionsFromPDF };
