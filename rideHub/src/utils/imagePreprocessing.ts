// Client-side image preprocessing utility for RideHub AI Inspection
// Resizes images, strips EXIF data by re-drawing on HTML5 Canvas, and checks basic quality (blur & dark).

export interface QualityCheckResult {
  isDark: boolean;
  isBlurred: boolean;
  brightness: number;
  score: number;
}

export async function processAndResizeImage(
  file: File,
  maxWidth = 1600,
  maxHeight = 1600,
  quality = 0.8
): Promise<{ processedFile: File; dataUrl: string; qualityCheck: QualityCheckResult }> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        if (width > maxWidth || height > maxHeight) {
          if (width / height > maxWidth / maxHeight) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          } else {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext("2d");
        if (!ctx) {
          reject(new Error("Could not get canvas context"));
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);

        // Perform basic image quality checks
        const imageData = ctx.getImageData(0, 0, width, height);
        const qualityCheck = evaluateImageQuality(imageData);

        canvas.toBlob(
          (blob) => {
            if (!blob) {
              reject(new Error("Canvas blob creation failed"));
              return;
            }
            const processedFile = new File([blob], file.name.replace(/\.[^/.]+$/, ".jpg"), {
              type: "image/jpeg",
              lastModified: Date.now(),
            });
            const dataUrl = canvas.toDataURL("image/jpeg", quality);
            resolve({ processedFile, dataUrl, qualityCheck });
          },
          "image/jpeg",
          quality
        );
      };
      img.onerror = () => reject(new Error("Failed to load image into element"));
      img.src = e.target?.result as string;
    };
    reader.onerror = () => reject(new Error("Failed to read file"));
    reader.readAsDataURL(file);
  });
}

function evaluateImageQuality(imageData: ImageData): QualityCheckResult {
  const data = imageData.data;
  let totalBrightness = 0;
  const pixelCount = data.length / 4;

  // Compute average brightness
  for (let i = 0; i < data.length; i += 4) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    totalBrightness += 0.299 * r + 0.587 * g + 0.114 * b;
  }
  const brightness = Math.round(totalBrightness / pixelCount);

  // Simplified Variance of Laplacian for blur detection
  let sumDiff = 0;
  const width = imageData.width;
  const height = imageData.height;

  // Sample horizontal variance on green channel
  for (let y = 0; y < height; y += 4) {
    for (let x = 1; x < width - 1; x += 4) {
      const idx = (y * width + x) * 4 + 1; // Green channel
      const left = data[idx - 4];
      const right = data[idx + 4];
      const center = data[idx];
      const lap = Math.abs(2 * center - left - right);
      sumDiff += lap;
    }
  }

  const sampleCount = (height / 4) * (width / 4);
  const blurScore = sumDiff / (sampleCount || 1);

  const isDark = brightness < 45;
  const isBlurred = blurScore < 8; // Low variance threshold

  return {
    isDark,
    isBlurred,
    brightness,
    score: Math.min(100, Math.round(blurScore * 5)),
  };
}
