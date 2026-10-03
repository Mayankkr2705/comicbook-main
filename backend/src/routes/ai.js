import express from "express";
import { checkJwt, addUserInfo } from "../middleware/auth.js";
import { generateComic, generateStoryText } from "../controllers/aiController.js";

const router = express.Router();

// Validation middleware for generate endpoint
const validateGenerateRequest = (req, res, next) => {
  const { prompt, provider, panels } = req.body;

  // Validate prompt
  if (!prompt || typeof prompt !== "string" || prompt.trim().length === 0) {
    return res.status(400).json({
      error: "Validation failed",
      message: "Prompt is required and must be a non-empty string"
    });
  }

  if (prompt.length > 1000) {
    return res.status(400).json({
      error: "Validation failed",
      message: "Prompt must be less than 1000 characters"
    });
  }

  // Validate provider (optional, defaults to 'gemini')
  if (provider && !["gemini", "openrouter"].includes(provider)) {
    return res.status(400).json({
      error: "Validation failed",
      message: "Provider must be either 'gemini' or 'openrouter'"
    });
  }

  // Validate panels (optional, defaults to 1)
  if (panels !== undefined) {
    if (!Number.isInteger(panels) || panels < 1 || panels > 6) {
      return res.status(400).json({
        error: "Validation failed",
        message: "Panels must be an integer between 1 and 6"
      });
    }
  }

  next();
};

// Validation middleware for story text generation endpoint
const validateStoryTextRequest = (req, res, next) => {
  const { prompt, maxWords } = req.body;

  // Validate prompt
  if (!prompt || typeof prompt !== "string" || prompt.trim().length === 0) {
    return res.status(400).json({
      error: "Validation failed",
      message: "Prompt is required and must be a non-empty string"
    });
  }

  if (prompt.length > 1000) {
    return res.status(400).json({
      error: "Validation failed",
      message: "Prompt must be less than 1000 characters"
    });
  }

  // Validate maxWords (optional, defaults to 250)
  if (maxWords !== undefined) {
    if (!Number.isInteger(maxWords) || maxWords < 50 || maxWords > 500) {
      return res.status(400).json({
        error: "Validation failed",
        message: "Max words must be an integer between 50 and 500"
      });
    }
  }

  next();
};

// Generate comic endpoint - changed from GET to POST
router.post("/generate", checkJwt, addUserInfo, validateGenerateRequest, generateComic);

// Generate story text endpoint
router.post("/generate-story", checkJwt, addUserInfo, validateStoryTextRequest, generateStoryText);

export default router;
