const {
    DEFAULT_ENDPOINT,
    DEFAULT_MODEL,
    RESPONSE_FORMAT
} = require('./config');

async function sendGeminiImageRequest({ base64Data, imageSize, mimeType, prompt }) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) throw new Error('Missing Gemini API key in environment variables.');

    const endpoint = process.env.GEMINI_ENDPOINT || DEFAULT_ENDPOINT;
    const model = process.env.GEMINI_IMAGE_MODEL || DEFAULT_MODEL;
    const requestBody = buildRequestBody({ base64Data, imageSize, mimeType, model, prompt });

    const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
            'x-goog-api-key': apiKey,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestBody)
    });

    console.log('[Gemini] Response status:', response.status);

    const responseText = await response.text();
    const result = parseJsonResponse(responseText, response.status);

    if (!response.ok) {
        const message = result?.error?.message || responseText.slice(0, 500);
        throw new Error(`Gemini request failed (${response.status}): ${message}`);
    }

    console.log('[Gemini] Response summary:', JSON.stringify({
        hasOutputImage: Boolean(result.output_image),
        candidates: result.candidates?.length || 0,
        steps: result.steps?.length || 0
    }));

    return extractImage(result);
}

function buildRequestBody({ base64Data, imageSize, mimeType, model, prompt }) {
    return {
        model,
        input: [
            { type: 'text', text: prompt },
            {
                type: 'image',
                mime_type: mimeType,
                data: base64Data
            }
        ],
        response_format: {
            ...RESPONSE_FORMAT,
            image_size: imageSize || RESPONSE_FORMAT.image_size
        }
    };
}

function parseJsonResponse(responseText, status) {
    try {
        return JSON.parse(responseText);
    } catch {
        throw new Error(`Gemini returned non-JSON response (${status}).`);
    }
}

function extractImage(result) {
    const inlineData = result.output_image || findImagePart(result);
    const outputMimeType = inlineData?.mime_type || inlineData?.mimeType;

    if (inlineData && inlineData.data && outputMimeType) {
        console.log('[Gemini] Image returned:', outputMimeType, 'length:', inlineData.data.length);
        return {
            mimeType: outputMimeType,
            data: inlineData.data
        };
    }

    console.error('[Gemini] No image returned from Gemini.');
    throw new Error('No image returned from Gemini.');
}

function findImagePart(value) {
    if (!value || typeof value !== 'object') return null;
    if (value.type === 'image' && value.data) return value;
    if (value.inlineData?.data) return value.inlineData;

    for (const child of Object.values(value)) {
        if (Array.isArray(child)) {
            for (const item of child) {
                const found = findImagePart(item);
                if (found) return found;
            }
        } else if (child && typeof child === 'object') {
            const found = findImagePart(child);
            if (found) return found;
        }
    }

    return null;
}

async function checkGeminiHealth() {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
        throw new Error('Missing Gemini API key in environment variables.');
    }

    const endpoint = process.env.GEMINI_ENDPOINT || DEFAULT_ENDPOINT;
    const model = process.env.GEMINI_IMAGE_MODEL || DEFAULT_MODEL;

    const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
            'x-goog-api-key': apiKey,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            model,
            input: 'ping'
        })
    });

    if (!response.ok) {
        const text = await response.text();
        throw new Error(`Gemini API healthcheck failed (${response.status}): ${text.slice(0, 200)}`);
    }

    return { available: true };
}

module.exports = {
    checkGeminiHealth,
    sendGeminiImageRequest
};
