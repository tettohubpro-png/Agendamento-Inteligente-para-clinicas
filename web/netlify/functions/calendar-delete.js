const {
  json,
  corsPreflight,
  getAccessToken,
  resolveSharedCalendarId,
  calendarFetch,
} = require('./_shared/calendar')

exports.handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') return corsPreflight()
  if (event.httpMethod !== 'DELETE' && event.httpMethod !== 'POST') {
    return json(405, { error: 'Método não permitido' })
  }

  const token = getAccessToken(event)
  if (!token) return json(401, { error: 'Token Google ausente' })

  let body = {}
  if (event.body) {
    try {
      body = JSON.parse(event.body)
    } catch {
      return json(400, { error: 'JSON inválido' })
    }
  }

  const params = event.queryStringParameters || {}
  const id = body.id || params.id
  if (!id) return json(400, { error: 'id do evento é obrigatório' })

  try {
    const { calendarId } = await resolveSharedCalendarId(token)
    await calendarFetch(
      `/calendars/${encodeURIComponent(calendarId)}/events/${encodeURIComponent(id)}`,
      token,
      { method: 'DELETE' },
    )
    return json(200, { ok: true, id })
  } catch (err) {
    return json(err.status || 500, { error: err.message || 'Falha ao cancelar evento' })
  }
}
