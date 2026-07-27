const fs = require('fs');
const path = require('path');

const backgroundPath = path.join(__dirname, '..', 'background.json');
let cachedBackgrounds = null;

function getRandomBackgroundDescription() {
    try {
        const backgrounds = loadBackgrounds();
        if (Array.isArray(backgrounds) && backgrounds.length > 0) {
            const idx = Math.floor(Math.random() * backgrounds.length);
            return backgrounds[idx];
        }
    } catch (err) {
        console.error('[Gemini] Failed to load background.json', err);
    }
    return '';
}

function loadBackgrounds() {
    if (cachedBackgrounds) return cachedBackgrounds;

    const backgrounds = JSON.parse(fs.readFileSync(backgroundPath, 'utf8'));
    if (!Array.isArray(backgrounds)) {
        throw new Error('background.json must contain an array.');
    }

    cachedBackgrounds = backgrounds
        .map(normalizeBackgroundDescription)
        .filter(Boolean);

    return cachedBackgrounds;
}

function normalizeBackgroundDescription(description) {
    return String(description || '')
        .replace(/\s+/g, ' ')
        .trim();
}

module.exports = {
    getRandomBackgroundDescription
};
