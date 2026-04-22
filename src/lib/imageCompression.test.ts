import { describe, it, expect, vi, beforeEach } from 'vitest'

// We test compressImage by mocking all browser APIs that jsdom doesn't implement.
describe('compressImage', () => {
  let compressImage: (file: File, targetBytes?: number) => Promise<string>

  beforeEach(async () => {
    vi.resetModules()

    // Mock createImageBitmap
    vi.stubGlobal('createImageBitmap', vi.fn().mockResolvedValue({ width: 800, height: 600 }))

    // Setup canvas mock
    const mockGetContext = vi.fn().mockReturnValue({
      drawImage: vi.fn(),
    })

    vi.spyOn(document, 'createElement').mockImplementation((tag: string) => {
      if (tag === 'canvas') {
        const canvas = {
          width: 0,
          height: 0,
          getContext: mockGetContext,
          toBlob: vi.fn(),
        }
        return canvas as unknown as HTMLElement
      }
      return document.createElement(tag)
    })

    const mod = await import('./imageCompression')
    compressImage = mod.compressImage
  })

  it('returns a data URL string starting with "data:image/jpeg;base64,"', async () => {
    // Make toBlob return a small blob and FileReader produce a data URL
    const fakeBlob = new Blob(['fake'], { type: 'image/jpeg' })
    Object.defineProperty(fakeBlob, 'size', { value: 100_000 })

    vi.spyOn(document, 'createElement').mockImplementation((tag: string) => {
      if (tag === 'canvas') {
        return {
          width: 0,
          height: 0,
          getContext: vi.fn().mockReturnValue({ drawImage: vi.fn() }),
          toBlob: (callback: (blob: Blob | null) => void) => {
            callback(fakeBlob)
          },
        } as unknown as HTMLElement
      }
      return document.createElement(tag)
    })

    // Mock FileReader as a constructor
    class MockFileReader {
      onload: ((ev: ProgressEvent) => void) | null = null
      result: string = 'data:image/jpeg;base64,abc123'
      readAsDataURL(_blob: Blob) {
        setTimeout(() => {
          if (this.onload) {
            this.onload({ target: this } as unknown as ProgressEvent)
          }
        }, 0)
      }
    }
    vi.stubGlobal('FileReader', MockFileReader)

    const file = new File(['fake image content'], 'photo.jpg', { type: 'image/jpeg' })
    const result = await compressImage(file)
    expect(result).toMatch(/^data:image\/jpeg;base64,/)
  })

  it('rejects with "too-large" when blob exceeds 1MB', async () => {
    const oversizedBlob = new Blob(['x'.repeat(1_000_001)], { type: 'image/jpeg' })
    Object.defineProperty(oversizedBlob, 'size', { value: 1_000_001 })

    vi.spyOn(document, 'createElement').mockImplementation((tag: string) => {
      if (tag === 'canvas') {
        return {
          width: 0,
          height: 0,
          getContext: vi.fn().mockReturnValue({ drawImage: vi.fn() }),
          toBlob: (callback: (blob: Blob | null) => void) => {
            callback(oversizedBlob)
          },
        } as unknown as HTMLElement
      }
      return document.createElement(tag)
    })

    const file = new File(['fake image content'], 'photo.jpg', { type: 'image/jpeg' })
    await expect(compressImage(file)).rejects.toThrow('too-large')
  })
})
