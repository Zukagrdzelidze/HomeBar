// Mirrors the server's photo rules (ImageFormat), so bad files are caught before upload.
export const PHOTO_TYPES = ['image/jpeg', 'image/png', 'image/webp']
const MAX_PHOTO_BYTES = 5 * 1024 * 1024

export function photoError(photo: File | null): string | null {
  if (!photo) return null
  if (photo.size > MAX_PHOTO_BYTES) return 'Photo must be 5 MB or smaller'
  if (!PHOTO_TYPES.includes(photo.type)) return 'Photo must be a JPEG, PNG or WebP'
  return null
}
