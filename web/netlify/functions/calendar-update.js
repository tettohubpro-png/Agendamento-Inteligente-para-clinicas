const {
  json,
  corsPreflight,
  getAccessToken,
  resolveSharedCalendarId,
  toEventBody,
  isOpenDay,
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

  const { id, nome, telefone, email, barbeiro, medico, servico, valor, data, hora, status } = body
  const barb = barbeiro || medico
  if (!id) return json(400, { error: 'id do evento é obrigatório' })

  if (data && !isOpenDay(data)) return json(400, { error: 'Agende apenas de segunda a sábado' })
  if (hora && !isValidSlot(hora)) return json(400, { error: 'Horário inválido' })

  try {
    const { calendarId } = await resolveSharedCalendarId(token)

    const current = await calendarFetch(
      `/calendars/${encodeURIComponent(calendarId)}/events/${encodeURIComponent(id)}`,
      token,
    )

    const mapped = eventToAgendamento(current, barb, calendarId)
    const next = {
      nome: nome || mapped?.clienteNome,
      telefone: telefone ?? mapped?.clienteTelefone,
      email: email ?? mapped?.clienteEmail,
      barbeiro: barb || mapped?.barbeiro,
      servico: servico || mapped?.servico,
      valor: valor ?? mapped?.valor,
      data: data || mapped?.data,
      hora: hora || mapped?.hora,
      status: status || mapped?.status || 'confirmado',
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
      agendamento: eventToAgendamento(updated, next.barbeiro, calendarId),
    })
  } catch (err) {
    return json(err.status || 500, { error: err.message || 'Falha ao atualizar evento' })
  }
}
