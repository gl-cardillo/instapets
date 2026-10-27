// Resizes a picture to fit within maxSize×maxSize and encodes it as a data
// URL no longer than maxLength characters, lowering the quality as needed.
// Pictures are stored in Firestore, whose documents are capped at 1 MB.
export async function compressImage(
  file: File,
  maxSize: number,
  maxLength: number,
): Promise<string> {
  if (!file.type.startsWith("image/")) {
    throw new Error("Please choose an image");
  }

  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, maxSize / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);
  canvas.getContext("2d")!.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  bitmap.close();

  // browsers that can't encode WebP return a (huge) PNG instead
  const type = canvas.toDataURL("image/webp").startsWith("data:image/webp")
    ? "image/webp"
    : "image/jpeg";

  for (let quality = 0.85; quality >= 0.4; quality -= 0.15) {
    const dataUrl = canvas.toDataURL(type, quality);
    if (dataUrl.length <= maxLength) return dataUrl;
  }
  throw new Error("This picture is too detailed to upload, try another one");
}
