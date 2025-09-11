const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');
require('dotenv').config();
const { generateGeminiImage } = require('./gemini');
const { onRequest } = require("firebase-functions/v2/https");

const app = express();
app.use(cors());
app.use(express.json({ limit: '25mb' }));

// POST /gemini-image
app.post('/gemini-image', async (req, res) => {
    console.log("Log:Received /gemini-image request");
  const { base64Data, mimeType } = req.body;
  try {
    const result = await generateGeminiImage(base64Data, mimeType);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

exports.api = onRequest(app);
