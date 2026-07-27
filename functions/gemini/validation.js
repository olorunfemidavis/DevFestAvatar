const { SUPPORTED_MIME_TYPES } = require('./config');

function validateImage(base64Data, mimeType) {
    const normalizedMimeType = String(mimeType || '').toLowerCase();
    if (!base64Data || !normalizedMimeType) throw new Error('Missing image data or mime type.');
    if (!SUPPORTED_MIME_TYPES.includes(normalizedMimeType)) throw new Error('Unsupported image format for Gemini.');

    const sizeBytes = Math.ceil(base64Data.length * 3 / 4);
    if (sizeBytes > 20 * 1024 * 1024) throw new Error('Image exceeds 20MB limit for Gemini.');

    return normalizedMimeType;
}

module.exports = { validateImage };
