import { MOCK_REPORTS } from '../mock/data'

const SUMMARY_STATS = [
  { label: '🏢 Empresas activas',   value: '127' },
  { label: '📄 Reportes enviados',  value: '5'   },
  { label: '📈 Crecimiento prom.',  value: '+18%' },
  { label: '👷 Empleos generados',  value: '604' },
]

export default function DashboardEmpresas() {
  return (
    <main className="page">
      <div className="page-header">
        <h1>Tablero Empresas</h1>
        <p>Reportes periódicos y métricas empresariales del municipio</p>
      </div>

      <div className="dashboard-stats">
        {SUMMARY_STATS.map((s) => (
          <div key={s.label} className="stat-card">
            <div className="stat-label">{s.label}</div>
            <div className="stat-value">{s.value}</div>
          </div>
        ))}
      </div>

      <div className="reports-grid">
        {MOCK_REPORTS.map((r) => (
          <div key={r.id} className="report-card">
            <div className="report-card-header">
              <h3>{r.title}</h3>
              <span className="period-badge">{r.period}</span>
            </div>
            <div className="report-metrics">
              {Object.entries(r.data as Record<string, string|number>).map(([k, v]) => (
                <div key={k} className="metric-row">
                  <span className="metric-key">{k.replace(/_/g, ' ')}</span>
                  <span className="metric-value">{String(v)}</span>
                </div>
              ))}
            </div>
            <div className="report-footer">
              Enviado el {new Date(r.createdAt).toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: 'numeric' })}
            </div>
          </div>
        ))}
      </div>
    </main>
  )
}
