const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Authorization, Content-Type',
  'Access-Control-Allow-Methods': 'GET, POST, PATCH, DELETE, OPTIONS',
}

function json(statusCode, body) {
  return {
    statusCode,
    headers: { 'Content-Type': 'application/json', ...CORS_HEADERS },
    body: JSON.stringify(body),
  }
}

function corsPreflight() {
  return { statusCode: 204, headers: CORS_HEADERS, body: '' }
}

function getAccessToken(event) {
  const header = event.headers.authorization || event.headers.Authorization || ''
  const match = header.match(/^Bearer\s+(.+)$/i)
  return match ? match[1].trim() : null
}

function calendarIds() {
  return {
    'Dr. Elizeu':
      process.env.CALENDAR_ELIZEU_ID ||
      process.env.VITE_CALENDAR_ELIZEU_ID ||
      'primary',
    'Dr. Paulo':
      process.env.CALENDAR_PAULO_ID ||
      process.env.VITE_CALENDAR_PAULO_ID ||
      'primary',
  }
}

function resolveCalendarId(medico) {
  const ids = calendarIds()
  if (!medico || medico === 'todos') return null
  return ids[medico] || null
}

function addMinutes(isoDate, hhmm, minutes) {
  const [h, m] = hhmm.split(':').map(Number)
  const d = new Date(`${isoDate}T${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:00`)
  d.setMinutes(d.getMinutes() + minutes)
  const y = d.getFullYear()
  const mo = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  const hour = String(d.getHours()).padStart(2, '0')
  const min = String(d.getMinutes()).padStart(2, '0')
  return { date: `${y}-${mo}-${day}`, time: `${hour}:${min}` }
}

function buildSummary({ nome, hora, medico }) {
  return `${nome} | ${hora} | ${medico}`
}

function buildDescription({ telefone, email, status }) {
  return [`Telefone: ${telefone || ''}`, `E-mail: ${email || ''}`, `Status: ${status || 'aguardando'}`].join(
    '\n',
  )
}

function parseDescription(description = '') {
  const telefone = (description.match(/Telefone:\s*(.*)/i) || [])[1]?.trim() || ''
  const email = (description.match(/E-mail:\s*(.*)/i) || [])[1]?.trim() || ''
  const statusRaw = (description.match(/Status:\s*(.*)/i) || [])[1]?.trim().toLowerCase() || 'confirmado'
  const status = ['confirmado', 'aguardando', 'cancelado'].includes(statusRaw) ? statusRaw : 'confirmado'
  return { telefone, email, status }
}

function parseSummary(summary = '') {
  const parts = summary.split('|').map((p) => p.trim())
  if (parts.length >= 3) {
    return { nome: parts[0], hora: parts[1], medico: parts[2] }
  }
  return { nome: summary || 'Paciente', hora: '', medico: '' }
}

function eventToAgendamento(event, medico, calendarId) {
  const start = event.start?.dateTime || event.start?.date
  if (!start) return null
  const data = start.slice(0, 10)
  const horaFromStart = start.includes('T') ? start.slice(11, 16) : ''
  const parsed = parseSummary(event.summary || '')
  const desc = parseDescription(event.description || '')
  const medicoFinal =
    medico ||
    (parsed.medico.includes('Paulo') ? 'Dr. Paulo' : parsed.medico.includes('Elizeu') ? 'Dr. Elizeu' : 'Dr. Elizeu')
  const hora = horaFromStart || parsed.hora || '08:00'
  const telefone = desc.telefone
  const email = desc.email
  const nome = parsed.nome
  return {
    id: event.id,
    calendarId,
    pacienteId: email || telefone || event.id,
    pacienteNome: nome,
    pacienteTelefone: telefone,
    pacienteEmail: email,
    medico: medicoFinal,
    data,
    hora,
    status: desc.status,
  }
}

function toEventBody(payload) {
  const { nome, telefone, email, medico, data, hora, status } = payload
  const end = addMinutes(data, hora, 30)
  return {
    summary: buildSummary({ nome, hora, medico }),
    description: buildDescription({ telefone, email, status: status || 'aguardando' }),
    start: {
      dateTime: `${data}T${hora}:00`,
      timeZone: 'America/Sao_Paulo',
    },
    end: {
      dateTime: `${end.date}T${end.time}:00`,
      timeZone: 'America/Sao_Paulo',
    },
  }
}

function isWeekday(isoDate) {
  const d = new Date(`${isoDate}T12:00:00`)
  const day = d.getDay()
  return day >= 1 && day <= 5
}

function isValidSlot(hora) {
  const [h, m] = hora.split(':').map(Number)
  const total = h * 60 + m
  return total >= 8 * 60 && total <= 17 * 60 + 30 && m % 30 === 0
}

async function calendarFetch(path, accessToken, options = {}) {
  const res = await fetch(`https://www.googleapis.com/calendar/v3${path}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
  })
  const text = await res.text()
  let data = null
  try {
    data = text ? JSON.parse(text) : null
  } catch {
    data = { raw: text }
  }
  if (!res.ok) {
    const err = new Error(data?.error?.message || `Google Calendar error ${res.status}`)
    err.status = res.status
    err.data = data
    throw err
  }
  return data
}

module.exports = {
  CORS_HEADERS,
  json,
  corsPreflight,
  getAccessToken,
  calendarIds,
  resolveCalendarId,
  eventToAgendamento,
  toEventBody,
  isWeekday,
  isValidSlot,
  calendarFetch,
  addMinutes,
}
