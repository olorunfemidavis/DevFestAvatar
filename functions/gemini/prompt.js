function buildAvatarPrompt(backgroundDescription) {
    return `Step 1:
Analyze the uploaded photo and derive a detailed internal description of the person's face, expression, pose, clothing, accessories, framing, lighting, and any notable features. Use that analysis only to preserve the person accurately in the generated image.

Step 2:
Transform the uploaded photo into one square DevFest Avatar Creator preview image.

Keep the person's recognizable identity, face shape, skin tone, expression, pose, clothing silhouette, accessories, and original framing. Create a polished full-bleed 1:1 illustrated portrait that reads clearly at social-avatar size. Use a warm nostalgic hand-painted animation look with soft watercolor texture, careful linework, gentle light, and modern editorial polish. Do not imitate any named artist, studio, or copyrighted character style.

Use this background as inspiration, but keep it secondary to the person:
${backgroundDescription}

Atmosphere:
- Primary lighting should feel soft, bright, and human: gentle overcast daylight, tender shadows, and a calm event-day glow rather than harsh contrast.
- Add subtle DevFest thematic light as translucent painterly arcs, ribbons, or soft reflections in blue, green, yellow, and red. These accents should feel woven into the environment, not pasted on top.
- Let the colors interact naturally with nearby surfaces: faint glow on walls, soft reflections on paths, glass, leaves, or clothing edges where appropriate.
- The mood should communicate peaceful engagement, community, curiosity, and wonder: a person present in a creative developer gathering, surrounded by thoughtful visual energy.
- Keep the image rich and vibrant, but avoid visual noise. The face must remain the clearest and most important element.

DevFest 2026 Branding Guidelines:
- Modern, clean, professional aesthetic
- Use Google's core colors visually (do not render color codes, names, or hex values as text anywhere in the image): Blue 500 (#4285f4), Green 500 (#34a853), Yellow 600 (#f9ab00), Red 500 (#ea4335)
- Use Halftone Blue (#57caff), Halftone Green (#5cdb6d), Halftone Yellow (#ffd427), Halftone Red (#ff7daf), pastels, Off White (#f0f0f0), and Black 02 (#1e1e1e) as supporting accents
- Do NOT generate any Google logo, branding, DevFest wordmark, or year in the image
- Use at most two bold rounded DevFest glyph accents near background edges: braces, brackets, hash, plus, equals, colon dots, semicolon, arrow, diagonal slashes, or the heart-like less-than/greater-than mark
- Use at most one faint monoline cluster in the far background: thin single-line arrows, wavy brackets, globe, hash, braces, at sign, parentheses, or parallel slashes
- Keep glyphs and monolines away from the face, hair, hands, badge, and clothing details
- Do not create a repeated wallpaper of symbols
- Keep the face clear, the crop centered, the mood welcoming, and the result suitable for social media and event branding
`;
}

module.exports = { buildAvatarPrompt };
