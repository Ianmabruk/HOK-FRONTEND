export function fallbackImageFor(title = 'Product') {
  return `https://placehold.co/800x800/f5f0e8/2c2c2c?text=${encodeURIComponent(title)}`
}

export function parseImageList(imageValue) {
  if (!imageValue) return []

  if (Array.isArray(imageValue)) {
    return imageValue.filter(Boolean)
  }

  if (typeof imageValue !== 'string') {
    return []
  }

  const trimmed = imageValue.trim()
  if (!trimmed) return []

  if (trimmed.startsWith('[')) {
    try {
      const parsed = JSON.parse(trimmed)
      return Array.isArray(parsed) ? parsed.filter(Boolean) : []
    } catch {
      return trimmed ? [trimmed] : []
    }
  }

  return [trimmed]
}

export function serializeImageList(images) {
  const cleanImages = (images || []).filter(Boolean)
  if (cleanImages.length === 0) return ''
  if (cleanImages.length === 1) return cleanImages[0]
  return JSON.stringify(cleanImages)
}

export function getPrimaryProductImage(product) {
  const images = parseImageList(product?.image_url)
  return images[0] || fallbackImageFor(product?.title)
}

export function normalizeProductGallery(product) {
  const images = parseImageList(product?.image_url)
  return images.length > 0 ? images : [fallbackImageFor(product?.title)]
}

export function readFileAsDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(typeof reader.result === 'string' ? reader.result : '')
    reader.onerror = () => reject(new Error(`Failed to read ${file.name}`))
    reader.readAsDataURL(file)
  })
}

export async function readFilesAsDataUrls(files) {
  return Promise.all(files.map((file) => readFileAsDataUrl(file)))
}