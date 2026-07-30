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
  if (process.env.BARBEIROS_CALENDARS) {
    try {
      return JSON.parse(process.env.BARBEIROS_CALENDARS)
    } catch {
      // fallback
    }
  }
  return {
    Maycon:
      process.env.CALENDAR_MAYCON_ID ||
      process.env.VITE_CALENDAR_MAYCON_ID ||
      'primary',
  }
}

function barbeirosList() {
  return Object.keys(calendarIds())
}

function resolveCalendarId(barbeiro) {
  const ids = calendarIds()
  if (!barbeiro || barbeiro === 'todos') return null
  return ids[barbeiro] || null
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

function buildSummary({ nome, hora, servico, barbeiro }) {
  return `${nome} | ${hora} | ${servico} | ${barbeiro}`
}

function buildDescription({ telefone, email, status, servico, valor }) {
  return [
    `Telefone: ${telefone || ''}`,
    `E-mail: ${email || ''}`,
    `Serviço: ${servico || ''}`,
    `Valor: R$ ${Number(valor || 0).toFixed(2)}`,
    `Status: ${status || 'aguardando'}`,
  ].join('\n')
}

function parseDescription(description = '') {
  const telefone = (description.match(/Telefone:\s*(.*)/i) || [])[1]?.trim() || ''
  const email = (description.match(/E-mail:\s*(.*)/i) || [])[1]?.trim() || ''
  const servico = (description.match(/Serviço:\s*(.*)/i) || [])[1]?.trim() || ''
  const valorRaw = (description.match(/Valor:\s*R\$\s*([\d.,]+)/i) || [])[1]?.trim() || '0'
  const valor = parseFloat(valorRaw.replace(',', '.')) || 0
  const statusRaw = (description.match(/Status:\s*(.*)/i) || [])[1]?.trim().toLowerCase() || 'confirmado'
  const status = ['confirmado', 'aguardando', 'cancelado'].includes(statusRaw) ? statusRaw : 'confirmado'
  return { telefone, email, servico, valor, status }
}

function parseSummary(summary = '') {
  const parts = summary.split('|').map((p) => p.trim())
  if (parts.length >= 4) {
    return { nome: parts[0], hora: parts[1], servico: parts[2], barbeiro: parts[3] }
  }
  if (parts.length >= 3) {
    return { nome: parts[0], hora: parts[1], servico: parts[2], barbeiro: 'Maycon' }
  }
  return { nome: summary || 'Cliente', hora: '', servico: '', barbeiro: 'Maycon' }
}

function eventToAgendamento(event, barbeiro, calendarId) {
  const start = event.start?.dateTime || event.start?.date
  if (!start) return null
  const data = start.slice(0, 10)
  const horaFromStart = start.includes('T') ? start.slice(11, 16) : ''
  const parsed = parseSummary(event.summary || '')
  const desc = parseDescription(event.description || '')
  const barbeiroFinal = barbeiro || parsed.barbeiro || 'Maycon'
  const hora = horaFromStart || parsed.hora || '08:30'
  return {
    id: event.id,
    calendarId,
    clienteId: desc.email || desc.telefone || event.id,
    clienteNome: parsed.nome,
    clienteTelefone: desc.telefone,
    clienteEmail: desc.email,
    barbeiro: barbeiroFinal,
    servico: desc.servico || parsed.servico,
    valor: desc.valor,
    data,
    hora,
    status: desc.status,
  }
}

function toEventBody(payload) {
  const { nome, telefone, email, barbeiro, servico, valor, data, hora, status } = payload
  const end = addMinutes(data, hora, 30)
  return {
    summary: buildSummary({ nome, hora, servico, barbeiro }),
    description: buildDescription({ telefone, email, servico, valor, status: status || 'aguardando' }),
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

function isOpenDay(isoDate) {
  const d = new Date(`${isoDate}T12:00:00`)
  const day = d.getDay()
  return day >= 1 && day <= 6 // seg–sáb
}

function isValidSlot(hora) {
  const [h, m] = hora.split(':').map(Number)
  const total = h * 60 + m
  const start = 8 * 60 + 30 // 08:30
  const end = 18 * 60 // 18:00
  return total >= start && total < end && m % 30 === 0
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
  barbeirosList,
  resolveCalendarId,
  eventToAgendamento,
  toEventBody,
  isOpenDay,
  isValidSlot,
  calendarFetch,
  addMinutes,
}
