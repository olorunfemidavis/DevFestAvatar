const DEFAULT_MODEL = 'gemini-3.1-flash-image';
const DEFAULT_ENDPOINT = 'https://generativelanguage.googleapis.com/v1beta/interactions';
const DEFAULT_IMAGE_SIZE = '512';
const MAX_AUTO_IMAGE_SIZE = '1K';

const IMAGE_SIZE_PRESETS = [
    { label: '512', pixels: 512 },
    { label: '1K', pixels: 1024 },
    { label: '2K', pixels: 2048 },
    { label: '4K', pixels: 4096 }
];

const RESPONSE_FORMAT = {
    type: 'image',
    mime_type: 'image/jpeg',
    image_size: DEFAULT_IMAGE_SIZE
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
    DEFAULT_IMAGE_SIZE,
    DEFAULT_MODEL,
    IMAGE_SIZE_PRESETS,
    MAX_AUTO_IMAGE_SIZE,
    RESPONSE_FORMAT,
    SUPPORTED_MIME_TYPES
};
