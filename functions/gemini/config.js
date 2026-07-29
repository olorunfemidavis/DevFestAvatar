const DEFAULT_MODEL = 'gemini-3.1-flash-image';
const DEFAULT_ENDPOINT = 'https://generativelanguage.googleapis.com/v1beta/interactions';

const RESPONSE_FORMAT = {
    type: 'image',
    mime_type: 'image/jpeg',
    image_size: '512'
};

const SUPPORTED_MIME_TYPES = [
    'image/png',
    'image/jpeg',
    'image/webp',
    'image/heic',
    'image/heif'
];

module.exports = {
    DEFAULT_ENDPOINT,
    DEFAULT_MODEL,
    RESPONSE_FORMAT,
    SUPPORTED_MIME_TYPES
};
