import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { listArchive, unarchiveDocument } from '../../api/documents'
import WindowChrome from './WindowChrome'
import { Archive, RotateCcw, FileText } from 'lucide-react'

interface Props { onClose: () => void; zIndex?: number; onFocus?: () => void }

export default function ArchiveWindow({ onClose, zIndex, onFocus }: Props) {
  const qc = useQueryClient()
  const { data, isLoading } = useQuery({ queryKey: ['archive'], queryFn: listArchive })

  const unarchiveMut = useMutation({
    mutationFn: (name: string) => unarchiveDocument(name),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['archive'] })
      qc.invalidateQueries({ queryKey: ['documents'] })
    },
  })

  const items: any[] = data?.response ?? []

  return (
    <WindowChrome title="🗂 Archive" defaultWidth={480} defaultHeight={360} defaultX={240} defaultY={160} onClose={onClose} zIndex={zIndex} onFocus={onFocus}>
      <div className="flex flex-col h-full">
        <div className="flex items-center justify-between px-4 py-2.5" style={{ borderBottom: '1px solid rgba(92,61,17,0.1)' }}>
          <span className="text-xs" style={{ color: '#7a6548' }}>{items.length} item{items.length !== 1 ? 's' : ''}</span>
        </div>

        <div className="flex-1 overflow-auto px-2 py-2">
          {isLoading ? (
            <div className="flex items-center justify-center h-full text-sm" style={{ color: '#7a6548' }}>Loading...</div>
          ) : items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full gap-2">
              <Archive size={32} color="#d4c4a8" />
              <span className="text-sm" style={{ color: '#b0a090' }}>Archive is empty</span>
            </div>
          ) : (
            items.map((item: any) => (
              <div key={item.id}
                className="flex items-center justify-between px-3 py-2 rounded-lg group hover:bg-black/5 transition-colors">
                <div className="flex items-center gap-2.5">
                  <FileText size={16} color="#8b6914" />
                  <span className="text-sm truncate max-w-48" style={{ color: '#2c1a06' }}>{item.name}</span>
                </div>
                <button
                  onClick={() => unarchiveMut.mutate(item.name)}
                  disabled={unarchiveMut.isPending}
                  className="opacity-0 group-hover:opacity-100 text-xs px-2 py-1 rounded-md transition-all flex items-center gap-1"
                  style={{ background: '#5c3d11', color: '#f5e6c8' }}>
                  <RotateCcw size={12} />
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </WindowChrome>
  )
}
