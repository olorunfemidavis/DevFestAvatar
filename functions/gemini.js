// gemini.js (Node version for Firebase function)
const { getRandomBackgroundDescription } = require('./gemini/backgrounds');
const { sendGeminiImageRequest } = require('./gemini/client');
const { buildAvatarPrompt } = require('./gemini/prompt');
const { validateImage } = require('./gemini/validation');

async function generateGeminiImage(base64Data, mimeType) {
    console.log('[Gemini] Starting image generation');
    console.log('[Gemini] base64Data length:', base64Data ? base64Data.length : 'undefined');
    console.log('[Gemini] mimeType:', mimeType);

    const normalizedMimeType = validateImage(base64Data, mimeType);
    const backgroundDescription = getRandomBackgroundDescription();
    const prompt = buildAvatarPrompt(backgroundDescription);

    return sendGeminiImageRequest({
        base64Data,
        mimeType: normalizedMimeType,
        prompt
    });
}

module.exports = { generateGeminiImage };
