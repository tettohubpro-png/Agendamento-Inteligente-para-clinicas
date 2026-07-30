const { json, corsPreflight, calendarIds, barbeirosList } = require('./_shared/calendar')

exports.handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') return corsPreflight()
  if (event.httpMethod !== 'GET') return json(405, { error: 'Método não permitido' })

  const ids = calendarIds()
  return json(200, {
    clientId: process.env.GOOGLE_CLIENT_ID || process.env.VITE_GOOGLE_CLIENT_ID || '',
    barbeiros: barbeirosList(),
    calendars: ids,
  })
}
