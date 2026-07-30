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
  const barb = barbeiro || medico || 'Maycon'
  if (!nome || !data || !hora || !servico) {
    return json(400, { error: 'Campos obrigatórios: nome, servico, data, hora' })
  }
  if (!isOpenDay(data)) return json(400, { error: 'Agende apenas de segunda a sábado' })
  if (!isValidSlot(hora)) return json(400, { error: 'Horário inválido (08:30–18:00, slots de 30 min)' })

  try {
    const { calendarId } = await resolveSharedCalendarId(token)

    const endDate = new Date(`${data}T${hora}:00`)
    endDate.setMinutes(endDate.getMinutes() + 30)
    const endIso = endDate.toISOString()

    const qs = new URLSearchParams({
      singleEvents: 'true',
      timeMin: new Date(`${data}T${hora}:00`).toISOString(),
      timeMax: endIso,
      maxResults: '10',
    })
    const existing = await calendarFetch(
      `/calendars/${encodeURIComponent(calendarId)}/events?${qs}`,
      token,
    )
    const conflict = (existing.items || []).some((ev) => {
      if (!(ev.summary || '').includes('|')) return false
      const s = ev.start?.dateTime || ''
      return s.slice(11, 16) === hora
    })
    if (conflict) {
      return json(409, {
        error: 'Este horário já está reservado. Escolha outro horário disponível.',
      })
    }

    if (telefone || email) {
      const weekQs = new URLSearchParams({
        singleEvents: 'true',
        orderBy: 'startTime',
        timeMin: new Date().toISOString(),
        timeMax: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(),
        maxResults: '100',
      })
      const future = await calendarFetch(
        `/calendars/${encodeURIComponent(calendarId)}/events?${weekQs}`,
        token,
      )
      const active = (future.items || []).some((ev) => {
        if (!(ev.summary || '').includes('|')) return false
        const desc = (ev.description || '').toLowerCase()
        const statusLine = (desc.match(/status:\s*(.*)/i) || [])[1] || ''
        if (statusLine.includes('cancelado')) return false
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
          status: status || 'confirmado',
        }),
      ),
    })

    return json(201, {
      agendamento: eventToAgendamento(created, barb, calendarId),
      mensagem: 'Horário reservado com sucesso na agenda da BOMCORTE.',
    })
  } catch (err) {
    return json(err.status || 500, { error: err.message || 'Falha ao criar evento' })
  }
}
