const {
  json,
  corsPreflight,
  getAccessToken,
  resolveCalendarId,
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
  const medico = body.medico || params.medico
  const calendarId = body.calendarId || params.calendarId || resolveCalendarId(medico)

  if (!id) return json(400, { error: 'id do evento é obrigatório' })
  if (!calendarId) return json(400, { error: 'calendarId ou medico é obrigatório' })

  try {
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
