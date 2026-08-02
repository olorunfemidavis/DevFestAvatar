const express = require('express');
const cors = require('cors');
require('dotenv').config({ override: true });
const { generateGeminiImage, checkGeminiHealth } = require('./gemini');
const { onRequest } = require("firebase-functions/v2/https");

const app = express();
const corsOptions = {
    origin: function (origin, callback) {
        const whitelist = [
            'https://devfestavatar.web.app',
            'https://devfestavatar.firebaseapp.com'
        ];
        if (whitelist.indexOf(origin) !== -1 || !origin) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    }
};

app.use(cors(corsOptions));
app.use(express.json({ limit: '25mb' }));

// GET /gemini-status (Real API Health Check to Gemini Interactions)
app.get('/gemini-status', async (req, res) => {
    console.log("Log:Received /gemini-status request");
    try {
        const result = await checkGeminiHealth();
        res.json(result);
    } catch (err) {
        console.warn("[Gemini Status] Healthcheck failed:", err.message);
        res.json({ available: false, reason: err.message });
    }
});

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
