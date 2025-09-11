// Combined Gemini call: analyze and generate in one request
async function processWithGemini(currentImage, callback) {
  // Supported MIME types
  const supportedMimeTypes = [
    "image/png",
    "image/jpeg",
    "image/webp",
    "image/heic",
    "image/heif"
  ];

  // Helper to check file size and mime type
  function validateImage(fileOrDataUrl) {
    return new Promise((resolve, reject) => {
      if (typeof fileOrDataUrl === "string" && fileOrDataUrl.startsWith("data:")) {
        // Data URL: extract mime type and base64
        const matches = fileOrDataUrl.match(/^data:([^;]+);base64,(.*)$/);
        if (!matches) return reject("Invalid data URL format.");
        const mimeType = matches[1];
        if (!supportedMimeTypes.includes(mimeType)) return reject("Unsupported image format for Gemini.");
        // Estimate size in bytes
        const base64Data = matches[2];
        const sizeBytes = Math.ceil(base64Data.length * 3 / 4);
        if (sizeBytes > 20 * 1024 * 1024) return reject("Image exceeds 20MB limit for Gemini.");
        resolve({ base64Data, mimeType });
      } else if (typeof fileOrDataUrl === "string") {
        // Relative path: fetch and convert to base64
        fetch(fileOrDataUrl)
          .then(response => {
            const mimeType = response.headers.get("Content-Type");
            if (!supportedMimeTypes.includes(mimeType)) throw "Unsupported image format for Gemini.";
            return response.blob().then(blob => {
              if (blob.size > 20 * 1024 * 1024) throw "Image exceeds 20MB limit for Gemini.";
              const reader = new FileReader();
              reader.onloadend = function () {
                const dataUrl = reader.result;
                const matches = dataUrl.match(/^data:([^;]+);base64,(.*)$/);
                if (!matches) return reject("Invalid data URL format.");
                resolve({ base64Data: matches[2], mimeType: matches[1] });
              };
              reader.readAsDataURL(blob);
            });
          })
          .catch(err => reject(err));
      } else {
        reject("Invalid image format for Gemini analysis.");
      }
    });
  }

  // Validate and process image
  validateImage(currentImage)
    .then(async ({ base64Data, mimeType }) => {
      // Call backend Firebase Function
      try {
        const response = await fetch("https://api-uylfn4ivta-uc.a.run.app/gemini-image", {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({ base64Data, mimeType })
        });
        const result = await response.json();
        if (result && result.data && result.mimeType) {
          callback({
            mimeType: result.mimeType,
            data: result.data,
            imageUrl: `data:${result.mimeType};base64,${result.data}`
          });
        } else {
          toastr.error("Gemini did not return an image.");
          if (typeof callback === "function") {
            callback("");
          }
        }
      } catch (err) {
        toastr.error("Error calling Gemini backend.");
        if (typeof callback === "function") {
          callback("");
        }
      }
    })
    .catch(err => {
      toastr.error(err);
      if (typeof callback === "function") {
        callback("");
      }
    });
}

window.processWithGemini = processWithGemini;