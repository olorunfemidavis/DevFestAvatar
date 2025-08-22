// cloudinary.js
// Removed Cloudinary upload logic as requested

export function getCloudinaryConfig() {
  return null;
}

// Helper: Convert Blob to base64
export function blobToBase64(blob) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result.split(",")[1]); // strip "data:image/png;base64,"
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

// Upload image to Cloudinary
export async function uploadImageToCloudinary(blob) {
  return null;
}
