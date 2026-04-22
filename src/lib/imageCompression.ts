export async function compressImage(file: File, targetBytes = 200_000): Promise<string> {
  const img = await createImageBitmap(file)
  const canvas = document.createElement('canvas')
  const scale = Math.min(1, Math.sqrt(targetBytes / file.size))
  canvas.width = Math.round(img.width * scale)
  canvas.height = Math.round(img.height * scale)
  const ctx = canvas.getContext('2d')!
  ctx.drawImage(img, 0, 0, canvas.width, canvas.height)

  const encode = (quality: number) =>
    new Promise<Blob | null>((res) => canvas.toBlob(res, 'image/jpeg', quality))

  let blob = await encode(0.8)
  if (!blob) throw new Error('too-large')
  if (blob.size > targetBytes) {
    blob = await encode(0.6)
  }
  if (!blob || blob.size > 1_000_000) throw new Error('too-large')

  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = () => reject(new Error('too-large'))
    reader.readAsDataURL(blob!)
  })
}
