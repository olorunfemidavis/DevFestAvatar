const {
    DEFAULT_IMAGE_SIZE,
    IMAGE_SIZE_PRESETS,
    MAX_AUTO_IMAGE_SIZE
} = require('./config');

function getImageDimensions(base64Data, mimeType) {
    const buffer = Buffer.from(base64Data, 'base64');
    switch (mimeType) {
        case 'image/jpeg':
            return readJpegDimensions(buffer);
        case 'image/png':
            return readPngDimensions(buffer);
        case 'image/webp':
            return readWebpDimensions(buffer);
        default:
            return null;
    }
}

function getClosestGeminiImageSize(dimensions) {
    if (!dimensions) return DEFAULT_IMAGE_SIZE;

    const maxPreset = IMAGE_SIZE_PRESETS.find((preset) => preset.label === MAX_AUTO_IMAGE_SIZE);
    const availablePresets = maxPreset
        ? IMAGE_SIZE_PRESETS.filter((preset) => preset.pixels <= maxPreset.pixels)
        : IMAGE_SIZE_PRESETS;

    const longestSide = Math.max(dimensions.width, dimensions.height);
    const closest = availablePresets.reduce((best, preset) => {
        const distance = Math.abs(preset.pixels - longestSide);
        return distance < best.distance ? { preset, distance } : best;
    }, { preset: availablePresets[0], distance: Number.POSITIVE_INFINITY });

    return closest.preset.label;
}

function readJpegDimensions(buffer) {
    if (buffer.length < 4 || buffer[0] !== 0xff || buffer[1] !== 0xd8) return null;

    let offset = 2;
    while (offset < buffer.length) {
        if (buffer[offset] !== 0xff) {
            offset += 1;
            continue;
        }

        while (buffer[offset] === 0xff) offset += 1;
        const marker = buffer[offset];
        offset += 1;

        if (marker === 0xd9 || marker === 0xda) break;
        if (marker >= 0xd0 && marker <= 0xd7) continue;
        if (offset + 2 > buffer.length) return null;

        const segmentLength = buffer.readUInt16BE(offset);
        if (segmentLength < 2 || offset + segmentLength > buffer.length) return null;

        if (isJpegStartOfFrame(marker)) {
            return {
                height: buffer.readUInt16BE(offset + 3),
                width: buffer.readUInt16BE(offset + 5)
            };
        }

        offset += segmentLength;
    }

    return null;
}

function isJpegStartOfFrame(marker) {
    return (
        (marker >= 0xc0 && marker <= 0xc3) ||
        (marker >= 0xc5 && marker <= 0xc7) ||
        (marker >= 0xc9 && marker <= 0xcb) ||
        (marker >= 0xcd && marker <= 0xcf)
    );
}

function readPngDimensions(buffer) {
    const pngSignature = '89504e470d0a1a0a';
    if (buffer.length < 24 || buffer.subarray(0, 8).toString('hex') !== pngSignature) return null;

    return {
        width: buffer.readUInt32BE(16),
        height: buffer.readUInt32BE(20)
    };
}

function readWebpDimensions(buffer) {
    if (buffer.length < 30 || buffer.toString('ascii', 0, 4) !== 'RIFF' || buffer.toString('ascii', 8, 12) !== 'WEBP') {
        return null;
    }

    const chunkType = buffer.toString('ascii', 12, 16);
    if (chunkType === 'VP8X' && buffer.length >= 30) {
        return {
            width: readUint24LE(buffer, 24) + 1,
            height: readUint24LE(buffer, 27) + 1
        };
    }

    if (chunkType === 'VP8 ' && buffer.length >= 30) {
        return {
            width: buffer.readUInt16LE(26) & 0x3fff,
            height: buffer.readUInt16LE(28) & 0x3fff
        };
    }

    if (chunkType === 'VP8L' && buffer.length >= 25 && buffer[20] === 0x2f) {
        const bits = buffer.readUInt32LE(21);
        return {
            width: (bits & 0x3fff) + 1,
            height: ((bits >> 14) & 0x3fff) + 1
        };
    }

    return null;
}

function readUint24LE(buffer, offset) {
    return buffer[offset] | (buffer[offset + 1] << 8) | (buffer[offset + 2] << 16);
}

module.exports = {
    getClosestGeminiImageSize,
    getImageDimensions
};
