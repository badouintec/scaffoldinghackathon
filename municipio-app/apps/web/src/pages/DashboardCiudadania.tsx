import { useTickets } from '../hooks/useTickets'
import type { Ticket } from '../types'

export default function DashboardCiudadania() {
  const { tickets, loading, error, updateStatus } = useTickets()

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="spinner" />
        <p>Cargando tickets…</p>
      </div>
    )
  }

  const byStatus = (s: Ticket['status']) => tickets.filter((t) => t.status === s)
  const cols: { key: Ticket['status']; label: string; icon: string }[] = [
    { key: 'abierto',    label: 'Abierto',     icon: '🟡' },
    { key: 'en_proceso', label: 'En proceso',  icon: '🔵' },
    { key: 'cerrado',    label: 'Cerrado',     icon: '🟢' },
  ]

  return (
    <main className="page">
      <div className="page-header">
        <h1>Tablero Ciudadanía</h1>
        <p>Gestión de tickets y solicitudes ciudadanas</p>
      </div>

      {error && <div className="error-banner">⚠️ {error}</div>}

      <div className="dashboard-stats">
        {cols.map(({ key, label, icon }) => (
          <div key={key} className="stat-card">
            <div className="stat-label">{icon} {label}</div>
            <div className="stat-value">{byStatus(key).length}</div>
          </div>
        ))}
        <div className="stat-card">
          <div className="stat-label">💼 Total</div>
          <div className="stat-value">{tickets.length}</div>
        </div>
      </div>

      <div className="kanban">
        {cols.map(({ key, label, icon }) => (
          <div key={key} className={`kanban-col kanban-col--${key}`}>
            <div className="kanban-col-header">
              <h2>{icon} {label}</h2>
              <span className="kanban-col-count">{byStatus(key).length}</span>
            </div>
            {byStatus(key).length === 0 ? (
              <div className="empty-state">
                <div className="empty-state-icon">📥</div>
                <p>Sin tickets</p>
              </div>
            ) : (
              byStatus(key).map((ticket) => (
                <TicketCard key={ticket.id} ticket={ticket} onStatusChange={updateStatus} />
              ))
            )}
          </div>
        ))}
      </div>
    </main>
  )
}

const CAT_ICONS: Record<string, string> = {
  alumbrado: '💡',
  baches:    '🚧',
  agua:      '💧',
  trámites:  '📋',
  otro:      '📌',
}

function relativeDate(d: Date) {
  const diff = Math.floor((Date.now() - new Date(d).getTime()) / 86400000)
  if (diff === 0) return 'Hoy'
  if (diff === 1) return 'Ayer'
  return `hace ${diff} días`
}

function TicketCard({
  ticket,
  onStatusChange,
}: {
  ticket: Ticket
  onStatusChange: (id: string, s: Ticket['status']) => void
}) {
  const catClass = `ticket-category cat-${ticket.category.replace('á','a').replace('é','e').replace('í','i').replace('ó','o').replace('ú','u')}`
  return (
    <div className="ticket-card">
      <div className="ticket-card-top">
        <span className={catClass}>
          {CAT_ICONS[ticket.category] ?? '📌'} {ticket.category}
        </span>
        <span className="ticket-date">{relativeDate(ticket.createdAt)}</span>
      </div>
      <h3>{ticket.subject}</h3>
      <p>{ticket.description}</p>
      <select
        className="ticket-select"
        value={ticket.status}
        onChange={(e) => onStatusChange(ticket.id, e.target.value as Ticket['status'])}
      >
        <option value="abierto">Abierto</option>
        <option value="en_proceso">En proceso</option>
        <option value="cerrado">Cerrado</option>
      </select>
    </div>
  )
}
