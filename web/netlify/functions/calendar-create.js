const {
  json,
  corsPreflight,
  getAccessToken,
  resolveCalendarId,
  calendarIds,
  toEventBody,
  isOpenDay,
  isValidSlot,
  calendarFetch,
  eventToAgendamento,
} = require('./_shared/calendar')

exports.handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') return corsPreflight()
  if (event.httpMethod !== 'POST') return json(405, { error: 'Método não permitido' })

  const token = getAccessToken(event)
  if (!token) return json(401, { error: 'Token Google ausente' })

  let body
  try {
    body = JSON.parse(event.body || '{}')
  } catch {
    return json(400, { error: 'JSON inválido' })
  }

  const { nome, telefone, email, barbeiro, medico, servico, valor, data, hora, status } = body
  const barb = barbeiro || medico
  if (!nome || !barb || !data || !hora || !servico) {
    return json(400, { error: 'Campos obrigatórios: nome, barbeiro, servico, data, hora' })
  }
  if (!isOpenDay(data)) return json(400, { error: 'Agende apenas de segunda a sábado' })
  if (!isValidSlot(hora)) return json(400, { error: 'Horário inválido (08:30–18:00, slots de 30 min)' })

  const calendarId = resolveCalendarId(barb)
  if (!calendarId) return json(400, { error: 'Barbeiro/calendário inválido' })

  try {
    const endDate = new Date(`${data}T${hora}:00`)
    endDate.setMinutes(endDate.getMinutes() + 30)
    const endIso = endDate.toISOString()

    const qs = new URLSearchParams({
      singleEvents: 'true',
      timeMin: new Date(`${data}T${hora}:00`).toISOString(),
      timeMax: endIso,
      maxResults: '5',
    })
    const existing = await calendarFetch(
      `/calendars/${encodeURIComponent(calendarId)}/events?${qs}`,
      token,
    )
    const conflict = (existing.items || []).some((ev) => {
      const s = ev.start?.dateTime || ''
      return s.slice(11, 16) === hora
    })
    if (conflict) {
      return json(409, { error: 'Já existe agendamento neste horário para este barbeiro' })
    }

    if (telefone || email) {
      const ids = calendarIds()
      const weekQs = new URLSearchParams({
        singleEvents: 'true',
        orderBy: 'startTime',
        timeMin: new Date().toISOString(),
        timeMax: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(),
        maxResults: '100',
      })
      const calendarsToCheck = [...new Set(Object.values(ids))]
      for (const calId of calendarsToCheck) {
        const future = await calendarFetch(
          `/calendars/${encodeURIComponent(calId)}/events?${weekQs}`,
          token,
        )
        const active = (future.items || []).some((ev) => {
          const desc = (ev.description || '').toLowerCase()
          const phoneMatch = telefone && desc.includes(String(telefone).toLowerCase())
          const emailMatch = email && desc.includes(String(email).toLowerCase())
          return phoneMatch || emailMatch
        })
        if (active) {
          return json(409, {
            error: 'Este cliente já possui um agendamento ativo. Cancele o anterior primeiro.',
          })
        }
      }
    }

    const created = await calendarFetch(`/calendars/${encodeURIComponent(calendarId)}/events`, token, {
      method: 'POST',
      body: JSON.stringify(
        toEventBody({
          nome,
          telefone,
          email,
          barbeiro: barb,
          servico,
          valor: valor || 0,
          data,
          hora,
          status: status || 'aguardando',
        }),
      ),
    })

    return json(201, {
      agendamento: eventToAgendamento(created, barb, calendarId),
    })
  } catch (err) {
    return json(err.status || 500, { error: err.message || 'Falha ao criar evento' })
  }
}
