import axios from "axios";
import cloudinary from "../config/cloudinary.js";

/**
 * Generate comic strip using AI provider
 * Supports Gemini and OpenRouter providers
 * Generates multiple panels based on panel count
 */
export const generateComic = async (req, res) => {
  try {
    const { prompt, provider = "gemini", panels = 1 } = req.body;

    // Validate input
    if (!prompt || typeof prompt !== "string" || prompt.trim().length === 0) {
      return res
        .status(400)
        .json({ error: "Prompt is required and must be a non-empty string" });
    }

    if (!["gemini", "openrouter"].includes(provider)) {
      return res
        .status(400)
        .json({ error: "Provider must be either 'gemini' or 'openrouter'" });
    }

    if (!Number.isInteger(panels) || panels < 1 || panels > 6) {
      return res
        .status(400)
        .json({ error: "Panels must be an integer between 1 and 6" });
    }

    console.log(
      `User ${req.user?.id} requested comic generation: ${panels} panel(s) using ${provider}`
    );

    // Verify Cloudinary config
    if (
      !process.env.CLOUDINARY_CLOUD_NAME ||
      !process.env.CLOUDINARY_API_KEY ||
      !process.env.CLOUDINARY_API_SECRET
    ) {
      console.error("Cloudinary credentials missing");
      return res.status(500).json({ error: "Cloudinary configuration error" });
    }

    // Generate images based on provider
    let imageUrls = [];

    if (provider === "gemini") {
      imageUrls = await generateWithGemini(prompt, panels);
    } else if (provider === "openrouter") {
      imageUrls = await generateWithOpenRouter(prompt, panels);
    }

    // Upload all images to Cloudinary
    console.log(`Uploading ${imageUrls.length} images to Cloudinary...`);
    const uploadedImages = await Promise.all(
      imageUrls.map(async (imageDataUrl, index) => {
        const cloudinaryResult = await cloudinary.uploader.upload(
          imageDataUrl,
          {
            folder: "comic-images",
            resource_type: "image",
            timeout: 60000,
          }
        );
        return {
          url: cloudinaryResult.secure_url,
          sequenceIndex: index,
        };
      })
    );

    console.log(
      `Successfully uploaded ${uploadedImages.length} images to Cloudinary`
    );

    res.json({
      success: true,
      images: uploadedImages,
      provider,
      panels,
    });
  } catch (error) {
    // Log detailed error for debugging
    console.error("Error in generateComic:", {
      message: error.message,
      stack: error.stack,
      response: error.response?.data,
      status: error.response?.status,
      user: req.user?.id,
    });

    // Return user-friendly error messages
    let errorMessage = "Failed to generate comic strip";
    let statusCode = 500;

    if (
      error.message.includes("API key") ||
      error.message.includes("not configured")
    ) {
      errorMessage = "AI service configuration error. Please contact support.";
      statusCode = 500;
    } else if (
      error.message.includes("rate limit") ||
      error.response?.status === 429
    ) {
      errorMessage = "Too many requests. Please try again later.";
      statusCode = 429;
    } else if (
      error.message.includes("timeout") ||
      error.code === "ECONNABORTED"
    ) {
      errorMessage = "Request timed out. Please try again.";
      statusCode = 504;
    } else if (
      error.response?.status === 401 ||
      error.response?.status === 403
    ) {
      errorMessage =
        "AI service authentication failed. Please contact support.";
      statusCode = 500;
    } else if (error.response?.status === 400) {
      errorMessage =
        "Invalid request to AI service. Please try a different prompt.";
      statusCode = 400;
    } else if (
      error.response?.status === 503 ||
      error.response?.status === 502
    ) {
      errorMessage =
        "AI service is temporarily unavailable. Please try again later.";
      statusCode = 503;
    } else if (error.message.includes("Cloudinary")) {
      errorMessage = "Failed to upload images. Please try again.";
      statusCode = 500;
    } else if (error.message.includes("No image found")) {
      errorMessage =
        "AI service did not generate an image. Please try a different prompt.";
      statusCode = 500;
    }

    res.status(statusCode).json({
      error: errorMessage,
      details:
        process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

/**
 * Generate comic panels using OpenRouter's default image model
 */
async function generateWithOpenRouter(prompt, panels) {
  if (!process.env.OPENROUTER_API_KEY) {
    throw new Error("OpenRouter API key not configured");
  }

  const imageUrls = [];

  for (let i = 0; i < panels; i++) {
    const panelPrompt =
      panels > 1
        ? `Panel ${
            i + 1
          } of ${panels}: ${prompt}. Create a detailed comic panel that is part of a ${panels}-panel sequence. Comic book style, vibrant colors, expressive characters.`
        : `Create a detailed comic strip: ${prompt}. Comic book style with vibrant colors, expressive characters, and clear storytelling. Suitable for all ages.`;

    console.log(`Generating panel ${i + 1}/${panels} with OpenRouter...`);

    try {
      const response = await axios.post(
        "https://openrouter.ai/api/v1/chat/completions",
        {
          model: "google/gemini-2.5-flash-image",
          messages: [
            {
              role: "user",
              content: panelPrompt,
            },
          ],
          modalities: ["image", "text"],
          image_config: {
            aspect_ratio: "16:9",
          },
        },
        {
          headers: {
            Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
            "Content-Type": "application/json",
          },
          timeout: 60000,
        }
      );

      if (
        !response.data.choices ||
        !response.data.choices[0]?.message?.images
      ) {
        console.error(
          `OpenRouter response missing image data for panel ${i + 1}:`,
          response.data
        );
        throw new Error(
          `No image found in OpenRouter response for panel ${i + 1}`
        );
      }

      const imageDataUrl =
        response.data.choices[0].message.images[0].image_url.url;
      imageUrls.push(imageDataUrl);
    } catch (error) {
      console.error(
        `Error generating panel ${i + 1} with OpenRouter:`,
        error.message
      );
      throw error;
    }
  }

  return imageUrls;
}

/**
 * Generate AI story text using OpenRouter with Gemini 2.5 Flash
 * Max 250 words
 */
export const generateStoryText = async (req, res) => {
  try {
    const { prompt, maxWords = 250 } = req.body;

    // Validate input
    if (!prompt || typeof prompt !== "string" || prompt.trim().length === 0) {
      return res
        .status(400)
        .json({ error: "Prompt is required and must be a non-empty string" });
    }

    if (maxWords < 50 || maxWords > 500) {
      return res
        .status(400)
        .json({ error: "Max words must be between 50 and 500" });
    }

    console.log(
      `User ${
        req.user?.id
      } requested story generation with prompt: "${prompt.substring(0, 50)}..."`
    );

    // Verify OpenRouter API key
    if (!process.env.OPENROUTER_API_KEY) {
      console.error("OpenRouter API key not configured");
      return res.status(500).json({ error: "AI service configuration error" });
    }

    // Generate story using OpenRouter with Gemini 2.5 Flash
    const storyPrompt = `Write a creative short story based on this prompt: "${prompt}". 
        
Requirements:
- Maximum ${maxWords} words
- Engaging narrative with clear beginning, middle, and end
- Age-appropriate content
- Creative and entertaining
- No explicit content

Write ONLY the story text, no title or additional formatting.`;

    console.log("Generating story with OpenRouter (Gemini 2.5 Flash)...");

    const response = await axios.post(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        model: "google/gemini-2.5-flash",
        messages: [
          {
            role: "user",
            content: storyPrompt,
          },
        ],
        max_tokens: maxWords * 2, // Rough estimate for tokens
        temperature: 0.8, // More creative
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
          "Content-Type": "application/json",
        },
        timeout: 30000,
      }
    );

    if (!response.data.choices || !response.data.choices[0]?.message?.content) {
      console.error("OpenRouter response missing content:", response.data);
      throw new Error("No story generated from AI service");
    }

    const generatedStory = response.data.choices[0].message.content.trim();

    // Count words (approximate)
    const wordCount = generatedStory.split(/\s+/).length;

    console.log(`Successfully generated story with ${wordCount} words`);

    res.json({
      success: true,
      story: generatedStory,
      wordCount,
      model: "google/gemini-2.5-flash",
    });
  } catch (error) {
    // Log detailed error for debugging
    console.error("Error in generateStoryText:", {
      message: error.message,
      stack: error.stack,
      response: error.response?.data,
      status: error.response?.status,
      user: req.user?.id,
    });

    // Return user-friendly error messages
    let errorMessage = "Failed to generate story";
    let statusCode = 500;

    if (
      error.message.includes("API key") ||
      error.message.includes("not configured")
    ) {
      errorMessage = "AI service configuration error. Please contact support.";
      statusCode = 500;
    } else if (
      error.message.includes("rate limit") ||
      error.response?.status === 429
    ) {
      errorMessage = "Too many requests. Please try again later.";
      statusCode = 429;
    } else if (
      error.message.includes("timeout") ||
      error.code === "ECONNABORTED"
    ) {
      errorMessage = "Request timed out. Please try again.";
      statusCode = 504;
    } else if (
      error.response?.status === 401 ||
      error.response?.status === 403
    ) {
      errorMessage =
        "AI service authentication failed. Please contact support.";
      statusCode = 500;
    } else if (error.response?.status === 400) {
      errorMessage =
        "Invalid request to AI service. Please try a different prompt.";
      statusCode = 400;
    } else if (
      error.response?.status === 503 ||
      error.response?.status === 502
    ) {
      errorMessage =
        "AI service is temporarily unavailable. Please try again later.";
      statusCode = 503;
    }

    res.status(statusCode).json({
      error: errorMessage,
      details:
        process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};
