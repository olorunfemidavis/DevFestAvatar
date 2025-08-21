// gemini.js
// Gemini-based processing for DevFest Avatar
console.log("[Gemini] gemini.js loaded");

// Step 1: Send current image to Gemini for analysis (using gemini-2.5-flash)
async function analyzeImageWithGemini(currentImage, callback) {
  console.log("[Gemini] analyzeImageWithGemini called", { currentImage });
  const apiKey = "AIzaSyCJM01Qa8s2Jqe35kc7zkr5TVkadep6GTo";
  const endpoint = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent";
  const prompt = `Analyze this image and return a detailed description of its content, style, and any notable features.`;

  // Helper to send request once we have base64
  async function sendGeminiRequest(base64Data) {
    const requestBody = {
      contents: [
        {
          parts: [
            {
              inline_data: {
                mime_type: "image/jpeg",
                data: base64Data
              }
            },
            { text: prompt }
          ]
        }
      ]
    };
    console.log("[Gemini] Sending image analysis request", { endpoint, requestBody });
    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "x-goog-api-key": apiKey,
          "Content-Type": "application/json"
        },
        body: JSON.stringify(requestBody)
      });
      console.log("[Gemini] Image analysis response status", response.status);
      const result = await response.json();
      console.log("[Gemini] Image analysis result", result);
      const description = result.candidates?.[0]?.content?.parts?.[0]?.text || "No description returned.";
      callback(description);
    } catch (err) {
      console.error("[Gemini] Image analysis error", err);
      toastr.error("Gemini image analysis failed.");
      callback("");
    }
  }

  // If currentImage is a data URL, extract base64 and send
  if (typeof currentImage === "string" && currentImage.startsWith("data:")) {
    const base64Data = currentImage.split(',')[1];
    await sendGeminiRequest(base64Data);
  } else if (typeof currentImage === "string") {
    // Assume it's a relative path, fetch and convert to base64
    try {
      const response = await fetch(currentImage);
      const blob = await response.blob();
      const reader = new FileReader();
      reader.onloadend = function () {
        const dataUrl = reader.result;
        const base64Data = dataUrl.split(',')[1];
        sendGeminiRequest(base64Data);
      };
      reader.readAsDataURL(blob);
    } catch (err) {
      console.error("[Gemini] Failed to fetch image from path", err);
      toastr.error("Failed to load image for Gemini analysis.");
      callback("");
    }
  } else {
    toastr.error("Invalid image format for Gemini analysis.");
    callback("");
  }
}

// Step 2: Generate DevFest-themed image using Gemini
async function generateDevFestImageWithGemini(description, callback) {
  console.log("[Gemini] generateDevFestImageWithGemini called", { description });
  const apiKey = "AIzaSyCJM01Qa8s2Jqe35kc7zkr5TVkadep6GTo";
  const endpoint = "https://generativelanguage.googleapis.com/v1beta/models/gemini-pro-vision:generateContent?key=" + apiKey;
  const devfestPrompt = `Create an avatar image based on the following description: ${description}.\n\nDevFest 2025 Branding Guidelines:\n- Modern, clean, professional aesthetic\n- Use Google's core colors: Blue 500 (#4285f4), Green 500 (#34a853), Yellow 600 (#f9ab00), Red 500 (#ea4335)\n- Halftones: Blue (#57caff), Green (#5cdb6d), Yellow (#ffd427), Red (#ff7daf)\n- Pastels: Blue (#c3ecf6), Green (#ccf6c5), Yellow (#ffe7a5), Red (#f8d8d8)\n- Grayscale: OFF White (#f0f0f0), Black 02 (#1e1e1e)\n- Incorporate bold glyphs (abstract shapes with solid fill) and monoline glyphs (simple, single-line shapes with no fill) as design elements\n- Include the DevFest wordmark and year '2025'\n- Optionally use the secondary logo: DevFest wordmark within brackets {}\n- The avatar should reflect a unified, professional, and modern DevFest identity\n- Use graphical elements for patterns or accents\n- The final image should be suitable for social media and event branding\n`;
  const requestBody = {
    contents: [
      { parts: [ { text: devfestPrompt } ] }
    ]
  };
  console.log("[Gemini] Sending image generation request", { endpoint, requestBody });
  try {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(requestBody)
    });
    console.log("[Gemini] Image generation response status", response.status);
    const result = await response.json();
    console.log("[Gemini] Image generation result", result);
    // Gemini returns base64 image data in inline_data
    const imageData = result.candidates?.[0]?.content?.parts?.find(p => p.inline_data)?.inline_data?.data;
    if (imageData) {
      const generatedImageUrl = "data:image/png;base64," + imageData;
      callback(generatedImageUrl);
    } else {
      console.error("[Gemini] No image returned from Gemini", result);
      toastr.error("Gemini did not return an image.");
      callback("");
    }
  } catch (err) {
    console.error("[Gemini] Image generation error", err);
    toastr.error("Gemini image generation failed.");
    callback("");
  }
}

// Step 3: Generate DevFest-themed square image using Imagen
async function generateDevFestImageWithImagen(description, callback) {
  console.log("[Imagen] generateDevFestImageWithImagen called", { description });
  const apiKey = "AIzaSyCJM01Qa8s2Jqe35kc7zkr5TVkadep6GTo";
  const modelId = "models/imagen-4.0-generate-001";
  const endpoint = `https://generativelanguage.googleapis.com/v1beta/${modelId}:predict?key=${apiKey}`;
  const devfestPrompt = `Create a square avatar image (1:1 aspect ratio, 512x512) based on the following description: ${description}.\n\nDevFest 2025 Branding Guidelines:\n- Modern, clean, professional aesthetic\n- Use Google's core colors: Blue 500 (#4285f4), Green 500 (#34a853), Yellow 600 (#f9ab00), Red 500 (#ea4335)\n- Halftones: Blue (#57caff), Green (#5cdb6d), Yellow (#ffd427), Red (#ff7daf)\n- Pastels: Blue (#c3ecf6), Green (#ccf6c5), Yellow (#ffe7a5), Red (#f8d8d8)\n- Grayscale: OFF White (#f0f0f0), Black 02 (#1e1e1e)\n- Incorporate bold glyphs (abstract shapes with solid fill) and monoline glyphs (simple, single-line shapes with no fill) as design elements\n- Include the DevFest wordmark and year '2025'\n- Optionally use the secondary logo: DevFest wordmark within brackets {}\n- The avatar should reflect a unified, professional, and modern DevFest identity\n- Use graphical elements for patterns or accents\n- The final image should be suitable for social media and event branding\n`;
  const requestBody = {
    prompt: devfestPrompt,
    aspect_ratio: "1:1",
    size: "512x512"
  };
  console.log("[Imagen] Sending image generation request", { endpoint, requestBody });
  try {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(requestBody)
    });
    console.log("[Imagen] Image generation response status", response.status);
    const result = await response.json();
    console.log("[Imagen] Image generation result", result);
    // Imagen returns base64 image data in predictions[0].data
    const imageData = result.predictions?.[0]?.data;
    if (imageData) {
      const generatedImageUrl = "data:image/png;base64," + imageData;
      callback(generatedImageUrl);
    } else {
      console.error("[Imagen] No image returned from Imagen", result);
      toastr.error("Imagen did not return an image.");
      callback("");
    }
  } catch (err) {
    console.error("[Imagen] Image generation error", err);
    toastr.error("Imagen image generation failed.");
    callback("");
  }
}

// Main Gemini processing function
function processWithGemini(currentImage) {
  console.log("[Gemini] processWithGemini called", { currentImage });
  analyzeImageWithGemini(currentImage, function(description) {
    console.log("[Gemini] Image description received", { description });
    if (!description || description === "No description returned.") {
      toastr.error("Image analysis failed. Cannot generate avatar.");
      console.error("[Gemini] Image description missing, terminating process.");
      return;
    }
    generateDevFestImageWithGemini(description, function(generatedImageUrl) {
      console.log("[Gemini] Generated image URL received", { generatedImageUrl });
      // Use the generated image as the current image and display it
      if (window.general_to_crop) {
        window.general_to_crop.cropme("bind", {
          url: generatedImageUrl,
          position: { scale: 1 },
        });
        window.rawImg = generatedImageUrl;
        window.ImageLength = 500; // Or set based on actual image size
        toastr.success("Gemini-generated DevFest avatar is now ready!");
      }
    });
  });
}

// Main Imagen processing function
function processWithImagen(currentImage) {
  console.log("[Imagen] processWithImagen called", { currentImage });
  analyzeImageWithGemini(currentImage, function(description) {
    console.log("[Imagen] Image description received", { description });
    if (!description || description === "No description returned.") {
      toastr.error("Image analysis failed. Cannot generate avatar.");
      console.error("[Imagen] Image description missing, terminating process.");
      return;
    }
    generateDevFestImageWithImagen(description, function(generatedImageUrl) {
      console.log("[Imagen] Generated image URL received", { generatedImageUrl });
      // Use the generated image as the current image and display it
      if (window.general_to_crop) {
        window.general_to_crop.cropme("bind", {
          url: generatedImageUrl,
          position: { scale: 1 },
        });
        window.rawImg = generatedImageUrl;
        window.ImageLength = 512; // Square image size
        toastr.success("Imagen-generated DevFest avatar is now ready!");
      }
    });
  });
}

// Expose for use in site.js
console.log("[Gemini] Exposing processWithGemini and processWithImagen to window");
window.processWithGemini = processWithGemini;
window.processWithImagen = processWithImagen;
