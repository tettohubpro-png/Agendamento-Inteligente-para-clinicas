/**
 * Sincroniza prompt e config BOMCORTE nos workflows n8n.
 * Uso: node scripts/build-n8n-workflows.js
 */
const fs = require('fs')
const path = require('path')

const root = path.join(__dirname, '..')
const config = JSON.parse(fs.readFileSync(path.join(root, 'n8n/config/bomcorte.json'), 'utf8'))
const prompt = fs.readFileSync(path.join(root, 'n8n/prompts/bomcorte-agent-system.txt'), 'utf8').trim()

const agendamentoPath = path.join(root, 'n8n/workflows/AgendamentoAutomatico.json')
const agendamento = JSON.parse(fs.readFileSync(agendamentoPath, 'utf8'))

const agent = agendamento.nodes.find((n) => n.name === 'AI Agent')
if (!agent) throw new Error('Nó AI Agent não encontrado')
agent.parameters.options.systemMessage = `=${prompt}`

const mcpClient = agendamento.nodes.find((n) => n.name === 'MCP Client')
if (mcpClient) {
  mcpClient.parameters.toolDescription =
    'Ferramentas Google Calendar do barbeiro Maycon: Agendar_Maycon, Listar_agenda_Maycon, Buscar_agendamento_Maycon, Reagendar_Maycon, Cancelar_Maycon. Use sempre antes de confirmar horários ao cliente.'
}

const enviarTexto = agendamento.nodes.find((n) => n.name === 'Enviar texto')
if (enviarTexto) {
  delete enviarTexto.disabled
  enviarTexto.parameters.instanceName = config.n8n.evolutionInstance
}

// Conectar Edit Fields direto ao Switch (pula nós de planilha desabilitados)
agendamento.connections['Edit Fields'] = {
  main: [[{ node: 'Switch', type: 'main', index: 0 }]],
}

// Renomear aba da planilha para clientes
for (const node of agendamento.nodes) {
  if (node.type === 'n8n-nodes-base.googleSheetsTool' || node.type === 'n8n-nodes-base.googleSheets') {
    if (node.parameters?.sheetName) {
      node.parameters.sheetName.cachedResultName = config.n8n.googleSheetsSheetName
    }
  }
  if (node.name === 'Buscar cadastro') {
    node.parameters.toolDescription =
      'Busca cliente na planilha por Nome, email ou Telefone. Sempre busque pelo telefone do WhatsApp primeiro.'
  }
  if (node.name === 'Cadastro novo') {
    node.parameters.toolDescription =
      'Cadastra novo cliente na planilha. Campos: Nome, Telefone, email. Use após confirmar que não existe cadastro.'
  }
}

agendamento.name = 'BOMCORTE - Agendamento WhatsApp'
agendamento.tags = ['bomcorte', 'whatsapp', 'agendamento']

fs.writeFileSync(agendamentoPath, JSON.stringify(agendamento, null, 2))
console.log('✓ AgendamentoAutomatico.json atualizado')

// Atualizar calendário no MCP se config mudar
const mcpPath = path.join(root, 'n8n/workflows/MCP-GoogleCalendar.json')
const mcp = JSON.parse(fs.readFileSync(mcpPath, 'utf8'))
const calEmail = config.barbeiros[0]?.calendarEmail || 'primary'
for (const node of mcp.nodes) {
  if (node.type === 'n8n-nodes-base.googleCalendarTool' && node.parameters?.calendar) {
    node.parameters.calendar.value = calEmail
    node.parameters.calendar.cachedResultName = `Agenda ${config.barbeiros[0]?.nome || 'Maycon'} (BOMCORTE)`
  }
}
fs.writeFileSync(mcpPath, JSON.stringify(mcp, null, 2))
console.log('✓ MCP-GoogleCalendar.json atualizado')
console.log('\nPróximo passo: importe os workflows no n8n e ative ambos.')
