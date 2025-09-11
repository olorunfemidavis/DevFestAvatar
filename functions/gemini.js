// gemini.js (Node version for Firebase function)
const fetch = require('node-fetch');
const fs = require('fs');
const path = require('path');

// Supported MIME types
const supportedMimeTypes = [
    "image/png",
    "image/jpeg",
    "image/webp",
    "image/heic",
    "image/heif"
];

// Helper to fetch and pick a random background description
function getRandomBackgroundDescription() {
    try {
        const backgrounds = JSON.parse(fs.readFileSync(path.join(__dirname, 'background.json'), 'utf8'));
        if (Array.isArray(backgrounds) && backgrounds.length > 0) {
            const idx = Math.floor(Math.random() * backgrounds.length);
            return backgrounds[idx];
        }
    } catch (err) {
        console.error('[Gemini] Failed to load background.json', err);
    }
    return '';
}

function validateImage(base64Data, mimeType) {
    if (!base64Data || !mimeType) throw new Error('Missing image data or mime type.');
    if (!supportedMimeTypes.includes(mimeType)) throw new Error('Unsupported image format for Gemini.');
    // Estimate size in bytes
    const sizeBytes = Math.ceil(base64Data.length * 3 / 4);
    if (sizeBytes > 20 * 1024 * 1024) throw new Error('Image exceeds 20MB limit for Gemini.');
}

async function generateGeminiImage(base64Data, mimeType) {
    console.log('[Gemini] Starting image generation');
    console.log('[Gemini] base64Data length:', base64Data ? base64Data.length : 'undefined');
    console.log('[Gemini] mimeType:', mimeType);
    validateImage(base64Data, mimeType);
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) throw new Error('Missing Gemini API key in environment variables.');
    const endpoint = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-image-preview:generateContent';

    const backgroundDescription = getRandomBackgroundDescription();

    // Comprehensive prompt for Gemini image creation
    const prompt = `Step 1)
Analyze this image and derive a detailed description of its content, style, and any notable features.

Step 2)
Create a masterpiece digital painting in the iconic and nostalgic art style of Studio Ghibli based on the image attached and based on the following:

Background:
${backgroundDescription}

Atmosphere:
Primary Lighting: The scene is bathed in the soft, ethereal light of an overcast sky, a signature of Ghibli films. This creates gentle shadows and prevents any harshness, lending a nostalgic and slightly melancholic feel to the image.
DevFest Thematic Lighting: Weaving through this gentle ambiance are magical, luminous projections of light, representing the innovative spirit of DevFest. These are soft, glowing, translucent waves of color that drift like spirits through the air. A wide, gentle arc of Halftone Yellow (#ffd427) settles on the stone path, while a soft, ethereal glow of Halftone Red (#ff7daf) kisses the side of a building. These lights interact with the environment, casting soft, colorful reflections on the wet stones and creating a beautiful and dreamlike contrast between the old world and new technology.
Color Palette: The overall color scheme is rich and harmonious. The DevFest brand colors are seamlessly integrated into the Ghibli palette. The primary blues, greens, yellows, and reds are present but are saturated in a way that feels organic and painterly, not digital. The OFF White (#f0f0f0) of the building trims and the deep Black 02 (#1e1e1e) of the character's shirt provide grounding and contrast.
Atmosphere: The mood is one of peaceful engagement and wonder. It's a snapshot of a person fully present, absorbing the knowledge and community around them. It combines the cozy, everyday magic of Studio Ghibli with the forward-thinking optimism of a developer conference, suggesting that technology, at its best, is a humanistic and creative endeavor.

DevFest 2025 Branding Guidelines:
- Modern, clean, professional aesthetic
- Use Google's core colors visually (do not render color codes, names, or hex values as text anywhere in the image): Blue 500 (#4285f4), Green 500 (#34a853), Yellow 600 (#f9ab00), Red 500 (#ea4335)
- Halftones, pastels, and grayscale as accents
- Do NOT generate any Google logo, branding, DevFest wordmark, or year in the image
- Incorporate up to 4 randomly selected bold glyphs (abstract shapes with solid fill) and up to 4 randomly selected monoline glyphs (simple, single-line shapes with no fill) as design elements
- Glyphs and monolines should appear only in the background, not on the characters or main subject
- Do not render any color codes, names, or hex values as text in the image. Use the colors visually only for graphical elements, backgrounds, and accents.
- The avatar should reflect a unified, professional, and modern DevFest identity
- Use graphical elements for patterns or accents
- The final image should be suitable for social media and event branding

Glyphs (choose up to 4, random each image):
A collection of glyphs and symbols with thick, rounded outlines and distinct, flat colors. Examples include:
a pair of separated #ffe7a5 square brackets;
a #ffd427 semicolon;
a pair of #ccf6cf curly brackets;
a #ff7daf parenthesis;
a curved, rotated #f9ab00 parenthesis;
a connected pair of #ff7daf heart shapes forming less-than and greater-than signs;
a pair of floating #34a853 quotation marks (second one rotated 180 degrees);
a thick, right-pointing #f9ab00 arrow;
two parallel #4285f4 diagonal lines;
a thick #57caff equals sign;
a single #ea4335 dot;
a thick #ea4335 plus sign;
a thick #34a853 hash symbol;
a #4285f4 colon made of two dots;
a thick #ff7daf 'X' or multiplication sign;
a thick #4285f4 plus sign with equal height and width;
a rounded #f8d8d8 shape resembling three interconnected ovals;
a series of three #5cdb6d circles that form an ellipsis;
a small #c3ecf6 rectangle like a minus sign.

Monolines (choose up to 4, random each image):
A collection of glyphs and symbols, all rendered with a thin/hairline, single black line. Examples include:
a right-pointing arrow (wings curved inwards);
a pair of long vertical, wavy brackets with 4 waves;
a less-than and greater-than sign;
a pair of square brackets (width:height ratio 1:4);
an equals sign;
an asterisk made of 4 straight lines;
a globe symbol;
a hash or number sign;
a pair of curly brackets;
two parallel diagonal lines;
a semicolon;
a colon;
a heart symbol comprising of less than and 3;
an at sign;
a pair of parentheses.
`;

    const requestBody = {
        contents: [
            {
                parts: [
                    {
                        inline_data: {
                            mime_type: mimeType,
                            data: base64Data
                        }
                    },
                    { text: prompt }
                ]
            }
        ]
    };

    const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
            'x-goog-api-key': apiKey,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestBody)
    });
    console.log('[Gemini] Response status:', response.status);
    const result = await response.json();
    console.log('[Gemini] Response body:', JSON.stringify(result).slice(0, 1000)); // Truncate for readability
    let inlineData = null;
    const parts = result.candidates?.[0]?.content?.parts || [];
    console.log('[Gemini] Parts:', JSON.stringify(parts));
    for (const part of parts) {
        if (part.inlineData) {
            inlineData = part.inlineData;
            break;
        }
    }
    if (inlineData && inlineData.data && inlineData.mimeType) {
        console.log('[Gemini] Image returned:', inlineData.mimeType, 'length:', inlineData.data.length);
        return {
            mimeType: inlineData.mimeType,
            data: inlineData.data
        };
    } else {
        console.error('[Gemini] No image returned from Gemini.');
        throw new Error('No image returned from Gemini.');
    }
}

module.exports = { generateGeminiImage };
