// gemini.js (Node version for Firebase function)
const { getRandomBackgroundDescription } = require('./gemini/backgrounds');
const { sendGeminiImageRequest, checkGeminiHealth } = require('./gemini/client');
const { getClosestGeminiImageSize, getImageDimensions } = require('./gemini/image-size');
const { buildAvatarPrompt } = require('./gemini/prompt');
const { validateImage } = require('./gemini/validation');

async function generateGeminiImage(base64Data, mimeType) {
    console.log('[Gemini] Starting image generation');
    console.log('[Gemini] base64Data length:', base64Data ? base64Data.length : 'undefined');
    console.log('[Gemini] mimeType:', mimeType);

    const normalizedMimeType = validateImage(base64Data, mimeType);
    const dimensions = getImageDimensions(base64Data, normalizedMimeType);
    const imageSize = getClosestGeminiImageSize(dimensions);
    console.log('[Gemini] input dimensions:', dimensions || 'unknown');
    console.log('[Gemini] response image size:', imageSize);

    const backgroundDescription = getRandomBackgroundDescription();
    const prompt = buildAvatarPrompt(backgroundDescription);

    return sendGeminiImageRequest({
        base64Data,
        imageSize,
        mimeType: normalizedMimeType,
        prompt
    });
}

module.exports = { generateGeminiImage, checkGeminiHealth };
