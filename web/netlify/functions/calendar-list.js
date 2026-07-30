const {
  json,
  corsPreflight,
  getAccessToken,
  resolveSharedCalendarId,
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

  if (!timeMin || !timeMax) {
    return json(400, { error: 'Informe timeMin e timeMax (ISO)' })
  }

  try {
    const { calendarId, source } = await resolveSharedCalendarId(token)

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

    const results = []
    for (const item of data.items || []) {
      const mapped = eventToAgendamento(item, null, calendarId)
      if (mapped) results.push(mapped)
    }

    results.sort((a, b) => `${a.data}${a.hora}`.localeCompare(`${b.data}${b.hora}`))
    return json(200, {
      agendamentos: results,
      calendarId,
      source,
      modo: 'agenda_unica',
    })
  } catch (err) {
    return json(err.status || 500, { error: err.message || 'Falha ao listar eventos' })
  }
}
