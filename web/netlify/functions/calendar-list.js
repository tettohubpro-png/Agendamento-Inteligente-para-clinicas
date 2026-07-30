const {
  json,
  corsPreflight,
  getAccessToken,
  calendarIds,
  eventToAgendamento,
  calendarFetch,
} = require('./_shared/calendar')

exports.handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') return corsPreflight()
  if (event.httpMethod !== 'GET') return json(405, { error: 'Método não permitido' })

  const token = getAccessToken(event)
  if (!token) return json(401, { error: 'Token Google ausente' })

  const params = event.queryStringParameters || {}
  const timeMin = params.timeMin
  const timeMax = params.timeMax
  const barbeiro = params.barbeiro || params.medico || 'todos'

  if (!timeMin || !timeMax) {
    return json(400, { error: 'Informe timeMin e timeMax (ISO)' })
  }

  try {
    const ids = calendarIds()
    const targets =
      barbeiro === 'todos'
        ? Object.entries(ids).map(([nome, calendarId]) => ({ barbeiro: nome, calendarId }))
        : [{ barbeiro, calendarId: ids[barbeiro] }]

    const unique = new Map()
    for (const t of targets) {
      if (!t.calendarId) continue
      unique.set(`${t.barbeiro}:${t.calendarId}`, t)
    }

    const results = []
    for (const { barbeiro: barb, calendarId } of unique.values()) {
      const qs = new URLSearchParams({
        singleEvents: 'true',
        orderBy: 'startTime',
        timeMin,
        timeMax,
        maxResults: '250',
      })
      const data = await calendarFetch(
        `/calendars/${encodeURIComponent(calendarId)}/events?${qs}`,
        token,
      )
      for (const item of data.items || []) {
        const mapped = eventToAgendamento(item, barb, calendarId)
        if (mapped) results.push(mapped)
      }
    }

    results.sort((a, b) => `${a.data}${a.hora}`.localeCompare(`${b.data}${b.hora}`))
    return json(200, { agendamentos: results })
  } catch (err) {
    return json(err.status || 500, { error: err.message || 'Falha ao listar eventos' })
  }
}
