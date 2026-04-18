import { FileText, Search, Bell, LogOut } from 'lucide-react'

interface Props {
  username: string
  onLogout: () => void
  onSearch: () => void
  notifCount: number
  onNotif: () => void
  currentPath: string[]
}

export default function Topbar({ username, onLogout, onSearch, notifCount, onNotif, currentPath }: Props) {
  return (
    <div className="flex items-center justify-between px-4 h-10 shrink-0"
      style={{ background: 'rgba(92,61,17,0.88)', backdropFilter: 'blur(8px)', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>

      {/* Left — logo + breadcrumb */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1.5">
          <FileText size={15} color="#f5e6c8" />
          <span className="text-sm font-semibold" style={{ color: '#f5e6c8' }}>DocFlow</span>
        </div>
        {currentPath.length > 0 && (
          <>
            <span style={{ color: 'rgba(245,230,200,0.4)' }}>/</span>
            {currentPath.map((seg, i) => (
              <span key={i} className="text-xs" style={{ color: 'rgba(245,230,200,0.7)' }}>{seg}</span>
            ))}
          </>
        )}
      </div>

      {/* Right — actions */}
      <div className="flex items-center gap-1">
        <button onClick={onSearch}
          className="p-1.5 rounded-md transition-colors hover:bg-white/10"
          style={{ color: 'rgba(245,230,200,0.8)' }}>
          <Search size={15} />
        </button>

        <button onClick={onNotif}
          className="relative p-1.5 rounded-md transition-colors hover:bg-white/10"
          style={{ color: 'rgba(245,230,200,0.8)' }}>
          <Bell size={15} />
          {notifCount > 0 && (
            <span className="absolute top-0.5 right-0.5 w-3.5 h-3.5 rounded-full text-[9px] flex items-center justify-center font-bold"
              style={{ background: '#e74c3c', color: '#fff' }}>
              {notifCount > 9 ? '9+' : notifCount}
            </span>
          )}
        </button>

        <div className="flex items-center gap-1.5 ml-2 pl-2" style={{ borderLeft: '1px solid rgba(255,255,255,0.15)' }}>
          <div className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold"
            style={{ background: '#8b6914', color: '#f5e6c8' }}>
            {username[0]?.toUpperCase()}
          </div>
          <span className="text-xs" style={{ color: 'rgba(245,230,200,0.8)' }}>{username}</span>
          <button onClick={onLogout}
            className="p-1 rounded transition-colors hover:bg-white/10 ml-1"
            style={{ color: 'rgba(245,230,200,0.6)' }}>
            <LogOut size={13} />
          </button>
        </div>
      </div>
    </div>
  )
}
