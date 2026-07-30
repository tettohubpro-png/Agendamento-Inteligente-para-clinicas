const { json, corsPreflight, configuredCalendarId, barbeirosList } = require('./_shared/calendar')

exports.handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') return corsPreflight()
  if (event.httpMethod !== 'GET') return json(405, { error: 'Método não permitido' })

  const calendarId = configuredCalendarId()
  return json(200, {
    clientId: process.env.GOOGLE_CLIENT_ID || process.env.VITE_GOOGLE_CLIENT_ID || '',
    barbeiros: barbeirosList(),
    calendars: calendarId ? { BOMCORTE: calendarId } : {},
    sharedCalendarId: calendarId || null,
    modo: 'agenda_unica',
    aviso:
      'Gmail é só para login. Use a agenda Google chamada BOMCORTE (compartilhada). Nunca a agenda pessoal.',
  })
}
