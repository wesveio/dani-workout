import { useRef, useState, useEffect } from 'react'
import { Plus } from 'lucide-react'
import dayjs from 'dayjs'
import { compressImage } from '@/lib/imageCompression'
import { useBodyMetricsStore } from '@/store/bodyMetricsStore'
import { Dialog, DialogContent } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { useToast } from '@/components/ui/use-toast'
import type { ProgressPhoto } from '@/types'

type Props = {
  photos: ProgressPhoto[]
  userId: string
}

export function PhotoGallery({ photos, userId }: Props) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { toast } = useToast()
  const [viewingPhoto, setViewingPhoto] = useState<ProgressPhoto | null>(null)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [usageMB, setUsageMB] = useState<number | null>(null)
  const [quotaWarning, setQuotaWarning] = useState(false)

  useEffect(() => {
    navigator.storage?.estimate().then(est => {
      if (est.usage) setUsageMB(est.usage / 1_000_000)
      if (est.quota && est.usage && (est.usage / est.quota) > 0.8) setQuotaWarning(true)
    }).catch(() => {})
  }, [photos.length])

  const quotaToastShown = useRef(false)

  useEffect(() => {
    if (quotaWarning && !quotaToastShown.current) {
      quotaToastShown.current = true
      toast({ description: 'Espaco quase cheio. Considere exportar e limpar fotos antigas.' })
    }
  }, [quotaWarning]) // eslint-disable-line react-hooks/exhaustive-deps

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    try {
      const dataUrl = await compressImage(file)
      await useBodyMetricsStore.getState().addPhoto({
        userId,
        date: dayjs().format('YYYY-MM-DD'),
        dataUrl,
        fileSizeBytes: dataUrl.length,
      })
    } catch (err) {
      if ((err as Error).message === 'too-large') {
        toast({ description: 'Foto muito grande. Escolha outra imagem.' })
      }
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  const handleDeletePhoto = async (id: string) => {
    await useBodyMetricsStore.getState().deletePhoto(id)
    setViewingPhoto(null)
    setConfirmDelete(false)
    toast({ description: 'Foto excluida.' })
  }

  return (
    <div className="space-y-3">
      <input
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
        ref={fileInputRef}
      />

      {photos.length > 0 && usageMB !== null && (
        <span className="text-xs text-txt-faint">{usageMB.toFixed(1)} MB usados</span>
      )}

      <div className="grid grid-cols-3 gap-2">
        <button
          onClick={() => fileInputRef.current?.click()}
          className="aspect-square rounded-lg border-2 border-dashed border-line/50 flex items-center justify-center text-txt-faint hover:border-txt-faint transition min-h-[80px]"
        >
          <Plus className="h-6 w-6" />
        </button>

        {photos.length === 0 ? (
          <div className="col-span-2 py-12 text-center text-sm text-txt-faint flex flex-col justify-center">
            <div className="font-semibold">Sem fotos ainda</div>
            <div className="mt-1">Adicione sua primeira foto para acompanhar sua transformacao.</div>
          </div>
        ) : (
          photos.map(photo => (
            <button
              key={photo.id}
              onClick={() => setViewingPhoto(photo)}
              className="relative aspect-square rounded-lg overflow-hidden min-h-[80px]"
            >
              <img src={photo.dataUrl} alt="" className="w-full h-full object-cover" />
              <span className="absolute bottom-1 left-1 text-[10px] bg-black/60 text-white px-1 rounded">
                {dayjs(photo.date).format('DD/MM')}
              </span>
            </button>
          ))
        )}
      </div>

      {/* Full-size viewer dialog */}
      <Dialog open={!!viewingPhoto} onOpenChange={() => { setViewingPhoto(null); setConfirmDelete(false) }}>
        <DialogContent className="max-w-sm p-0 bg-bg-1">
          {viewingPhoto && (
            <>
              <img src={viewingPhoto.dataUrl} alt="" className="w-full rounded-t-lg" />
              <div className="p-4 flex items-center justify-between">
                <span className="text-sm">{dayjs(viewingPhoto.date).format('DD/MM/YYYY')}</span>
                {!confirmDelete ? (
                  <Button
                    className="bg-destructive text-white"
                    size="sm"
                    onClick={() => setConfirmDelete(true)}
                  >
                    Excluir Foto
                  </Button>
                ) : (
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-txt-faint">A foto sera removida permanentemente.</span>
                    <Button variant="ghost" size="sm" onClick={() => setConfirmDelete(false)}>
                      Cancelar
                    </Button>
                    <Button
                      className="bg-destructive text-white"
                      size="sm"
                      onClick={() => handleDeletePhoto(viewingPhoto.id)}
                    >
                      Excluir
                    </Button>
                  </div>
                )}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
