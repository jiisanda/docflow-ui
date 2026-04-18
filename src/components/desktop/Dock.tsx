import { Archive, Trash2, Bell } from 'lucide-react'

interface Props {
  onTrash: () => void
  onArchive: () => void
  onNotif: () => void
  notifCount: number
}

interface DockItemProps {
  icon: React.ReactNode
  label: string
  badge?: number
  onClick: () => void
}

function DockItem({ icon, label, badge, onClick }: DockItemProps) {
  return (
    <button onClick={onClick}
      className="flex flex-col items-center gap-1 group w-14 transition-transform hover:-translate-y-1">
      <div className="relative w-10 h-10 rounded-xl flex items-center justify-center transition-all group-hover:shadow-lg"
        style={{ background: 'rgba(255,250,242,0.85)', border: '1px solid rgba(92,61,17,0.15)' }}>
        {icon}
        {badge ? (
          <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full text-[9px] flex items-center justify-center font-bold"
            style={{ background: '#e74c3c', color: '#fff' }}>
            {badge > 9 ? '9+' : badge}
          </span>
        ) : null}
      </div>
      <span className="text-[10px]" style={{ color: '#7a6548' }}>{label}</span>
    </button>
  )
}

export default function Dock({ onTrash, onArchive, onNotif, notifCount }: Props) {
  return (
    <div className="absolute right-4 top-1/2 -translate-y-1/2 flex flex-col items-center gap-2 p-2 rounded-2xl"
      style={{ background: 'rgba(255,250,242,0.5)', border: '1px solid rgba(92,61,17,0.12)', backdropFilter: 'blur(8px)' }}>
      <DockItem icon={<Archive size={20} color="#5c3d11" />} label="Archive" onClick={onArchive} />
      <DockItem icon={<Bell size={20} color="#5c3d11" />} label="Notifs" onClick={onNotif} badge={notifCount} />
      <div className="w-8 h-px my-1" style={{ background: 'rgba(92,61,17,0.15)' }} />
      <DockItem icon={<Trash2 size={20} color="#c0392b" />} label="Trash" onClick={onTrash} />
    </div>
  )
}
