import { Link } from 'react-router-dom'

const STATS = [
  { value: '48,200', label: 'Ciudadanos registrados', icon: '👥' },
  { value: '3,841',  label: 'Tickets resueltos',      icon: '✅' },
  { value: '127',    label: 'Empresas activas',        icon: '🏢' },
  { value: '98%',    label: 'Satisfacción ciudadana',  icon: '⭐' },
]

const FEATURES = [
  {
    icon: '🤖',
    title: 'Asistente Virtual 24/7',
    desc: 'Resuelve dudas sobre trámites, servicios municipales y orientación ciudadana al instante, sin filas ni esperas.',
    color: 'blue',
  },
  {
    icon: '📋',
    title: 'Gestión de Reportes',
    desc: 'Reporta baches, alumbrado, fugas de agua y más. Sigue el estado de tu solicitud en tiempo real.',
    color: 'orange',
    link: '/ciudadania',
  },
  {
    icon: '📊',
    title: 'Tablero Empresarial',
    desc: 'Consulta métricas, envía reportes periódicos y accede a programas de apoyo para tu negocio.',
    color: 'green',
    link: '/empresas',
  },
]

const HOW_IT_WORKS = [
  { step: '01', title: 'Escribe tu consulta',        desc: 'Describe tu necesidad en lenguaje natural, sin formularios complicados.', icon: '✏️' },
  { step: '02', title: 'El asistente responde',      desc: 'Obtén respuestas precisas en segundos, disponible los 7 días de la semana.', icon: '💬' },
  { step: '03', title: 'Resuelve tu trámite',        desc: 'Recibe instrucciones paso a paso o crea un ticket si se requiere atención presencial.', icon: '🎯' },
]

const SERVICES = [
  { icon: '🔦', name: 'Alumbrado público' },
  { icon: '🚗', name: 'Vialidad y baches' },
  { icon: '💧', name: 'Agua y drenaje' },
  { icon: '🌳', name: 'Espacios verdes' },
  { icon: '📄', name: 'Licencias y permisos' },
  { icon: '🏫', name: 'Servicios educativos' },
  { icon: '🏥', name: 'Salud municipal' },
  { icon: '🚌', name: 'Transporte público' },
]

export default function LandingPage() {
  return (
    <div className="landing">

      {/* ── Hero ────────────────────────────────────────── */}
      <section className="hero">
        <div className="hero-bg" aria-hidden="true" />
        <div className="hero-content">
          <div className="hero-badge">🏛️ Municipio Digital · Plataforma Oficial</div>
          <h1 className="hero-title">
            Tu municipio,<br />
            <span className="hero-highlight">a un mensaje</span><br />
            de distancia
          </h1>
          <p className="hero-subtitle">
            Accede a trámites, reporta problemas y obtén respuestas al instante
            con nuestro asistente inteligente. Disponible 24/7.
          </p>
          <div className="hero-actions">
            <button className="btn btn-primary btn-lg" id="open-chat-btn">
              💬 Hablar con el asistente
            </button>
            <Link to="/ciudadania" className="btn btn-outline btn-lg">
              📋 Ver mis reportes
            </Link>
          </div>
          <div className="hero-note">Sin registro · Respuesta inmediata · Completamente gratuito</div>
        </div>

        <div className="hero-visual">
          <div className="chat-preview">
            <div className="chat-preview-bar">
              <div className="chat-preview-dot" /><div className="chat-preview-dot" /><div className="chat-preview-dot" />
              <span>Asistente Municipal</span>
              <span className="chat-preview-online">● En línea</span>
            </div>
            <div className="chat-preview-body">
              <div className="chat-preview-msg assistant">
                ¡Hola! Soy el Asistente Municipal. ¿En qué puedo ayudarte hoy?
              </div>
              <div className="chat-preview-msg user">
                Necesito renovar mi licencia de funcionamiento.
              </div>
              <div className="chat-preview-msg assistant">
                Con gusto te ayudo. Necesitarás: identificación oficial, comprobante de pago predial y el folio del año anterior. El trámite tarda <strong>3 días hábiles</strong>. ¿Quieres que te dé el enlace de pago en línea?
              </div>
              <div className="chat-preview-typing">
                <span /><span /><span />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Stats ────────────────────────────────────────── */}
      <section className="stats-section">
        <div className="section-inner">
          {STATS.map((s) => (
            <div key={s.label} className="landing-stat">
              <div className="landing-stat-icon">{s.icon}</div>
              <div className="landing-stat-value">{s.value}</div>
              <div className="landing-stat-label">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Features ─────────────────────────────────────── */}
      <section className="features-section">
        <div className="section-inner">
          <div className="section-header">
            <h2>Todo lo que necesitas, en un solo lugar</h2>
            <p>Tres módulos diseñados para ciudadanos, empresas y funcionarios municipales.</p>
          </div>
          <div className="features-grid">
            {FEATURES.map((f) => (
              <div key={f.title} className={`feature-card feature-card--${f.color}`}>
                <div className="feature-icon">{f.icon}</div>
                <h3>{f.title}</h3>
                <p>{f.desc}</p>
                {f.link && (
                  <Link to={f.link} className="feature-link">
                    Ir al módulo →
                  </Link>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── How it works ─────────────────────────────────── */}
      <section className="how-section">
        <div className="section-inner">
          <div className="section-header">
            <h2>¿Cómo funciona?</h2>
            <p>Resolver tus trámites nunca había sido tan sencillo.</p>
          </div>
          <div className="steps-grid">
            {HOW_IT_WORKS.map((s, i) => (
              <div key={s.step} className="step-card">
                <div className="step-number">{s.step}</div>
                <div className="step-icon">{s.icon}</div>
                <h3>{s.title}</h3>
                <p>{s.desc}</p>
                {i < HOW_IT_WORKS.length - 1 && <div className="step-arrow">→</div>}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Services grid ────────────────────────────────── */}
      <section className="services-section">
        <div className="section-inner">
          <div className="section-header">
            <h2>Servicios disponibles</h2>
            <p>Pregunta al asistente sobre cualquiera de estos servicios municipales.</p>
          </div>
          <div className="services-grid">
            {SERVICES.map((s) => (
              <div key={s.name} className="service-pill">
                <span>{s.icon}</span>
                <span>{s.name}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA final ────────────────────────────────────── */}
      <section className="cta-section">
        <div className="section-inner">
          <div className="cta-card">
            <div className="cta-icon">🚀</div>
            <h2>¿Listo para empezar?</h2>
            <p>El asistente municipal está disponible ahora mismo. Sin descargas, sin registros.</p>
            <button className="btn btn-primary btn-lg" id="open-chat-btn-2">
              💬 Iniciar conversación
            </button>
          </div>
        </div>
      </section>

      {/* ── Footer ───────────────────────────────────────── */}
      <footer className="landing-footer">
        <div className="section-inner">
          <div className="footer-brand">
            <span>🏛️</span> Municipio Digital
          </div>
          <div className="footer-links">
            <Link to="/ciudadania">Tablero Ciudadanía</Link>
            <Link to="/empresas">Tablero Empresas</Link>
          </div>
          <div className="footer-copy">© 2026 Municipio · Todos los derechos reservados</div>
        </div>
      </footer>
    </div>
  )
}
