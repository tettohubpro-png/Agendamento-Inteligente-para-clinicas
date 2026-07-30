const {
  json,
  corsPreflight,
  getAccessToken,
  resolveCalendarId,
  toEventBody,
  isWeekday,
  isValidSlot,
  calendarFetch,
  eventToAgendamento,
} = require('./_shared/calendar')

exports.handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') return corsPreflight()
  if (event.httpMethod !== 'PATCH' && event.httpMethod !== 'POST') {
    return json(405, { error: 'Método não permitido' })
  }

  const token = getAccessToken(event)
  if (!token) return json(401, { error: 'Token Google ausente' })

  let body
  try {
    body = JSON.parse(event.body || '{}')
  } catch {
    return json(400, { error: 'JSON inválido' })
  }

  const { id, calendarId: bodyCalendarId, nome, telefone, email, medico, data, hora, status } = body
  if (!id) return json(400, { error: 'id do evento é obrigatório' })

  const calendarId = bodyCalendarId || resolveCalendarId(medico)
  if (!calendarId) return json(400, { error: 'calendarId ou medico é obrigatório' })

  if (data && !isWeekday(data)) return json(400, { error: 'Agende apenas de segunda a sexta' })
  if (hora && !isValidSlot(hora)) return json(400, { error: 'Horário inválido' })

  try {
    const current = await calendarFetch(
      `/calendars/${encodeURIComponent(calendarId)}/events/${encodeURIComponent(id)}`,
      token,
    )

    const mapped = eventToAgendamento(current, medico, calendarId)
    const next = {
      nome: nome || mapped?.pacienteNome,
      telefone: telefone ?? mapped?.pacienteTelefone,
      email: email ?? mapped?.pacienteEmail,
      medico: medico || mapped?.medico,
      data: data || mapped?.data,
      hora: hora || mapped?.hora,
      status: status || mapped?.status || 'aguardando',
    }

    const updated = await calendarFetch(
      `/calendars/${encodeURIComponent(calendarId)}/events/${encodeURIComponent(id)}`,
      token,
      {
        method: 'PUT',
        body: JSON.stringify(toEventBody(next)),
      },
    )

    return json(200, {
      agendamento: eventToAgendamento(updated, next.medico, calendarId),
    })
  } catch (err) {
    return json(err.status || 500, { error: err.message || 'Falha ao atualizar evento' })
  }
}
