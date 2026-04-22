export async function compressImage(file: File, targetBytes = 200_000): Promise<string> {
  const img = await createImageBitmap(file)
  const canvas = document.createElement('canvas')
  const scale = Math.min(1, Math.sqrt(targetBytes / file.size))
  canvas.width = Math.round(img.width * scale)
  canvas.height = Math.round(img.height * scale)
  const ctx = canvas.getContext('2d')!
  ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob || blob.size > 1_000_000) {
          reject(new Error('too-large'))
          return
        }
        const reader = new FileReader()
        reader.onload = () => resolve(reader.result as string)
        reader.readAsDataURL(blob)
      },
      'image/jpeg',
      0.8
    )
  })
}
