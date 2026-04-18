import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { listTrash, emptyTrash, restoreDocument } from '../../api/documents'
import WindowChrome from './WindowChrome'
import { Trash2, RotateCcw, FileText } from 'lucide-react'

interface Props { onClose: () => void; zIndex?: number; onFocus?: () => void }

export default function TrashWindow({ onClose, zIndex, onFocus }: Props) {
  const qc = useQueryClient()
  const { data, isLoading } = useQuery({ queryKey: ['trash'], queryFn: listTrash })

  const emptyMut = useMutation({
    mutationFn: emptyTrash,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['trash'] }),
  })

  const restoreMut = useMutation({
    mutationFn: (name: string) => restoreDocument(name),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['trash'] })
      qc.invalidateQueries({ queryKey: ['documents'] })
    },
  })

  const items: any[] = data?.response ?? []

  return (
    <WindowChrome title="🗑 Trash" defaultWidth={480} defaultHeight={360} defaultX={200} defaultY={140} onClose={onClose} zIndex={zIndex} onFocus={onFocus}>
      <div className="flex flex-col h-full">
        {/* Toolbar */}
        <div className="flex items-center justify-between px-4 py-2.5" style={{ borderBottom: '1px solid rgba(92,61,17,0.1)' }}>
          <span className="text-xs" style={{ color: '#7a6548' }}>{items.length} item{items.length !== 1 ? 's' : ''}</span>
          <button
            onClick={() => emptyMut.mutate()}
            disabled={items.length === 0 || emptyMut.isPending}
            className="text-xs px-3 py-1 rounded-lg font-medium transition-all"
            style={{ background: items.length === 0 ? '#e8dcc8' : '#c0392b', color: items.length === 0 ? '#aaa' : '#fff', cursor: items.length === 0 ? 'not-allowed' : 'pointer' }}>
            {emptyMut.isPending ? 'Emptying...' : 'Empty Trash'}
          </button>
        </div>

        {/* List */}
        <div className="flex-1 overflow-auto px-2 py-2">
          {isLoading ? (
            <div className="flex items-center justify-center h-full text-sm" style={{ color: '#7a6548' }}>Loading...</div>
          ) : items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full gap-2">
              <Trash2 size={32} color="#d4c4a8" />
              <span className="text-sm" style={{ color: '#b0a090' }}>Trash is empty</span>
            </div>
          ) : (
            items.map((item: any) => {
              const doc = item.DocumentMetadata ?? item
              return (
                <div key={doc.id}
                  className="flex items-center justify-between px-3 py-2 rounded-lg group hover:bg-black/5 transition-colors">
                  <div className="flex items-center gap-2.5">
                    <FileText size={16} color="#8b6914" />
                    <span className="text-sm truncate max-w-48" style={{ color: '#2c1a06' }}>{doc.name}</span>
                  </div>
                  <button
                    onClick={() => restoreMut.mutate(doc.name)}
                    className="opacity-0 group-hover:opacity-100 text-xs px-2 py-1 rounded-md transition-all"
                    style={{ background: '#5c3d11', color: '#f5e6c8' }}>
                    <RotateCcw size={12} />
                  </button>
                </div>
              )
            })
          )}
        </div>
      </div>
    </WindowChrome>
  )
}
