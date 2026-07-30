const { json, corsPreflight } = require('./_shared/calendar')

exports.handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') return corsPreflight()
  if (event.httpMethod !== 'GET') return json(405, { error: 'Método não permitido' })

  return json(200, {
    clientId: process.env.GOOGLE_CLIENT_ID || process.env.VITE_GOOGLE_CLIENT_ID || '',
    calendars: {
      'Dr. Elizeu': process.env.CALENDAR_ELIZEU_ID || process.env.VITE_CALENDAR_ELIZEU_ID || 'primary',
      'Dr. Paulo': process.env.CALENDAR_PAULO_ID || process.env.VITE_CALENDAR_PAULO_ID || 'primary',
    },
  })
}
