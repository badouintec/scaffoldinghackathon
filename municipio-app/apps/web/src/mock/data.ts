import type { Message, Ticket, Report } from '../types'

// ── Conversación de ejemplo ────────────────────────────────
const CONV = 'mock-conv-001'

export const MOCK_MESSAGES: Message[] = [
  {
    id: 'm1',
    conversationId: CONV,
    role: 'assistant',
    content: '¡Hola! Soy el Asistente Municipal. Estoy aquí para ayudarte con trámites, servicios y cualquier consulta sobre el municipio. ¿En qué puedo ayudarte hoy?',
    createdAt: new Date('2026-03-18T09:00:00'),
  },
  {
    id: 'm2',
    conversationId: CONV,
    role: 'user',
    content: 'Hola, necesito saber cómo obtener un permiso de construcción.',
    createdAt: new Date('2026-03-18T09:01:10'),
  },
  {
    id: 'm3',
    conversationId: CONV,
    role: 'assistant',
    content: 'Para obtener un **permiso de construcción** debes seguir estos pasos:\n\n1. Presentar solicitud en la Oficina de Desarrollo Urbano (Planta Baja, Edificio Municipal).\n2. Adjuntar planos firmados por un arquitecto certificado.\n3. Comprobante de pago predial al corriente.\n4. Escrituras o título de propiedad.\n\nEl trámite tiene un plazo de **15 días hábiles**. ¿Te gustaría que te indicara el horario de atención o los costos?',
    createdAt: new Date('2026-03-18T09:01:25'),
  },
  {
    id: 'm4',
    conversationId: CONV,
    role: 'user',
    content: '¿Cuánto cuesta el trámite?',
    createdAt: new Date('2026-03-18T09:02:00'),
  },
  {
    id: 'm5',
    conversationId: CONV,
    role: 'assistant',
    content: 'El costo depende del tipo de obra:\n\n• **Obra nueva residencial:** $1,200 MXN por cada 100 m²\n• **Ampliación:** $800 MXN por cada 100 m²\n• **Comercial / Industrial:** $2,500 MXN por cada 100 m²\n\nEs posible hacer el pago en caja municipal o mediante transferencia bancaria. ¿Necesitas el número de cuenta?',
    createdAt: new Date('2026-03-18T09:02:18'),
  },
]

// Respuestas automáticas simuladas para el modo demo
export const MOCK_REPLIES: string[] = [
  'Entendido. Puedo ayudarte con esa consulta. El municipio cuenta con diversas opciones para atender tu solicitud. Te recomiendo acudir a la ventanilla de servicios con una identificación oficial.',
  'Esa es una excelente pregunta. El trámite que mencionas se puede realizar en línea a través del portal municipal o de forma presencial de lunes a viernes de 8:00 a 15:00 hrs.',
  'Para ese tipo de gestión, necesitarás los siguientes documentos: identificación oficial, comprobante de domicilio y CURP. El tiempo de respuesta estimado es de 5 días hábiles.',
  'El municipio ofrece programas de apoyo para pequeñas empresas. Puedes consultar la convocatoria vigente en la sección "Programas de Fomento Económico" del portal oficial.',
  'He registrado tu consulta. Un funcionario del área correspondiente se pondrá en contacto contigo en un plazo máximo de 48 horas. ¿Hay algo más en lo que pueda ayudarte?',
]

// ── Tickets de ciudadanía ─────────────────────────────────
export const MOCK_TICKETS: Ticket[] = [
  {
    id: 't1',
    userId: 'u1',
    subject: 'Alumbrado público apagado en Av. Reforma',
    description: 'Varios postes de luz llevan más de una semana apagados. La calle queda completamente oscura de noche, representa un peligro.',
    status: 'abierto',
    category: 'alumbrado',
    createdAt: new Date('2026-03-15T10:30:00'),
    updatedAt: new Date('2026-03-15T10:30:00'),
  },
  {
    id: 't2',
    userId: 'u2',
    subject: 'Bache profundo en Calle Morelos #45',
    description: 'Bache de aproximadamente 40 cm de diámetro y 15 cm de profundidad. Ya dañó dos vehículos esta semana.',
    status: 'en_proceso',
    category: 'baches',
    createdAt: new Date('2026-03-14T08:15:00'),
    updatedAt: new Date('2026-03-16T11:00:00'),
  },
  {
    id: 't3',
    userId: 'u3',
    subject: 'Solicitud de poda de árbol peligroso',
    description: 'Árbol frente a la primaria con ramas secas que podrían caer sobre los niños. Urgente antes de temporada de vientos.',
    status: 'abierto',
    category: 'otro',
    createdAt: new Date('2026-03-16T14:00:00'),
    updatedAt: new Date('2026-03-16T14:00:00'),
  },
  {
    id: 't4',
    userId: 'u4',
    subject: 'Fuga de agua en colonia Las Flores',
    description: 'Fuga visible desde hace 3 días en la esquina de Jazmines y Rosas. Se está desperdiciando agua y la banqueta está dañada.',
    status: 'en_proceso',
    category: 'agua',
    createdAt: new Date('2026-03-13T09:00:00'),
    updatedAt: new Date('2026-03-17T08:30:00'),
  },
  {
    id: 't5',
    userId: 'u5',
    subject: 'Renovación de licencia de funcionamiento',
    description: 'No puedo renovar mi licencia en el portal, el sistema arroja error 503 desde hace 4 días. Necesito renovar antes del 20 de marzo.',
    status: 'cerrado',
    category: 'trámites',
    createdAt: new Date('2026-03-12T16:45:00'),
    updatedAt: new Date('2026-03-17T10:00:00'),
  },
  {
    id: 't6',
    userId: 'u6',
    subject: 'Semáforo descompuesto en Blvd. Juárez',
    description: 'El semáforo de la intersección con Independencia parpadea en amarillo permanente. Han ocurrido dos accidentes menores esta semana.',
    status: 'abierto',
    category: 'otro',
    createdAt: new Date('2026-03-17T07:00:00'),
    updatedAt: new Date('2026-03-17T07:00:00'),
  },
  {
    id: 't7',
    userId: 'u7',
    subject: 'Reparación de banqueta en zona centro',
    description: 'Banqueta rota frente al mercado municipal, riesgo de caída para adultos mayores. Zona de alto tránsito peatonal.',
    status: 'cerrado',
    category: 'baches',
    createdAt: new Date('2026-03-10T11:20:00'),
    updatedAt: new Date('2026-03-15T16:00:00'),
  },
]

// ── Reportes de empresas ──────────────────────────────────
export const MOCK_REPORTS: Report[] = [
  {
    id: 'r1',
    companyId: 'emp1',
    title: 'Reporte de Ventas — Restaurante El Patio',
    period: '2026-T1',
    data: {
      ventas_totales: '$487,320 MXN',
      clientes_atendidos: 1842,
      ticket_promedio: '$264.56 MXN',
      empleados: 12,
      crecimiento_vs_periodo_anterior: '+18%',
    },
    createdAt: new Date('2026-03-14T09:00:00'),
  },
  {
    id: 'r2',
    companyId: 'emp2',
    title: 'Indicadores Operativos — Taller Mecánico Ramos',
    period: '2026-T1',
    data: {
      servicios_realizados: 234,
      ingresos: '$312,500 MXN',
      satisfaccion_cliente: '4.8 / 5.0',
      tiempo_promedio_servicio: '2.3 hrs',
      empleados: 6,
    },
    createdAt: new Date('2026-03-15T14:30:00'),
  },
  {
    id: 'r3',
    companyId: 'emp3',
    title: 'Informe Actividad — Librería Cultural Siglo XXI',
    period: '2026-Q1',
    data: {
      titulos_vendidos: 1205,
      ingresos: '$98,400 MXN',
      eventos_realizados: 8,
      asistentes_eventos: 340,
      nuevos_socios: 47,
    },
    createdAt: new Date('2026-03-16T10:00:00'),
  },
  {
    id: 'r4',
    companyId: 'emp4',
    title: 'Resumen Financiero — Constructora Horizonte',
    period: '2026-T1',
    data: {
      proyectos_activos: 3,
      monto_contratos: '$4,200,000 MXN',
      empleados_directos: 45,
      subcontratistas: 12,
      avance_promedio: '62%',
    },
    createdAt: new Date('2026-03-17T08:00:00'),
  },
  {
    id: 'r5',
    companyId: 'emp5',
    title: 'Métricas Q1 — Farmacia San Judas',
    period: '2026-Q1',
    data: {
      recetas_surtidas: 3418,
      ingresos: '$256,870 MXN',
      medicamentos_surtidos: 12400,
      clientes_frecuentes: 523,
      nuevos_clientes: 89,
    },
    createdAt: new Date('2026-03-17T12:00:00'),
  },
]
