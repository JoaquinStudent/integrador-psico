// Image loading utilities for the image element plugin
//
// Provides file picking (camera/gallery) and image resizing.

export interface LoadedImage {
  dataUrl: string;
  width: number;
  height: number;
}

const MAX_FILE_SIZE = 20 * 1024 * 1024; // 20MB

/**
 * Pick an image from camera or gallery via a hidden file input.
 */
export function pickImage(mode: 'camera' | 'gallery'): Promise<LoadedImage | null> {
  return new Promise((resolve) => {
    let settled = false;
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    if (mode === 'camera') {
      input.capture = 'environment';
    }
    input.style.display = 'none';
    document.body.appendChild(input);

    function cleanup() {
      window.removeEventListener('focus', handleFocusFallback);
      if (document.body.contains(input)) {
        document.body.removeChild(input);
      }
    }

    function settleNull() {
      if (settled) return;
      settled = true;
      cleanup();
      resolve(null);
    }

    input.addEventListener('change', async () => {
      if (settled) return;
      const file = input.files?.[0];
      cleanup();

      if (!file) {
        settled = true;
        resolve(null);
        return;
      }

      if (file.size > MAX_FILE_SIZE) {
        console.warn('Image file too large, max 20MB:', file.size);
        settled = true;
        resolve(null);
        return;
      }

      try {
        const dataUrl = await readFileAsDataUrl(file);
        const dimensions = await getImageDimensions(dataUrl);
        if (dimensions.width <= 0 || dimensions.height <= 0) {
          console.warn('Failed to decode image dimensions');
          settled = true;
          resolve(null);
          return;
        }
        const resized = await resizeIfNeeded(dataUrl, dimensions.width, dimensions.height);
        settled = true;
        resolve(resized);
      } catch (err) {
        console.warn('Failed to load image:', err);
        settled = true;
        resolve(null);
      }
    });

    input.addEventListener('cancel', () => {
      settleNull();
    });

    /*
     * Fallback for browsers that don't fire 'cancel' on file input dismiss.
     * When the window regains focus after the dialog closes, check if a file
     * was selected. If not, resolve null to avoid a hanging promise.
     */
    const handleFocusFallback = () => {
      setTimeout(() => {
        if (!settled && input.files && input.files.length === 0) {
          settleNull();
        }
      }, 300);
    };
    window.addEventListener('focus', handleFocusFallback);

    input.click();
  });
}

function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsDataURL(file);
  });
}

function getImageDimensions(dataUrl: string): Promise<{ width: number; height: number }> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve({ width: img.naturalWidth, height: img.naturalHeight });
    img.onerror = () => resolve({ width: 0, height: 0 });
    img.src = dataUrl;
  });
}

/**
 * Resize image if it exceeds maxDimension on either axis.
 * Preserves PNG format for transparency; uses JPEG 0.85 for photos.
 */
export async function resizeIfNeeded(
  dataUrl: string,
  naturalWidth: number,
  naturalHeight: number,
  maxDimension: number = 2048
): Promise<LoadedImage> {
  if (naturalWidth <= maxDimension && naturalHeight <= maxDimension) {
    return { dataUrl, width: naturalWidth, height: naturalHeight };
  }

  const scale = maxDimension / Math.max(naturalWidth, naturalHeight);
  const newWidth = Math.round(naturalWidth * scale);
  const newHeight = Math.round(naturalHeight * scale);

  const canvas = document.createElement('canvas');
  canvas.width = newWidth;
  canvas.height = newHeight;

  const ctx = canvas.getContext('2d');
  if (!ctx) {
    return { dataUrl, width: naturalWidth, height: naturalHeight };
  }

  const img = new Image();
  img.src = dataUrl;
  await img.decode();

  ctx.drawImage(img, 0, 0, newWidth, newHeight);

  const isPng = dataUrl.startsWith('data:image/png');
  const resizedDataUrl = isPng
    ? canvas.toDataURL('image/png')
    : canvas.toDataURL('image/jpeg', 0.85);

  return { dataUrl: resizedDataUrl, width: newWidth, height: newHeight };
}
