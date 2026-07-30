export function StatCard({
  label,
  value,
  sub,
  accent,
}: {
  label: string
  value: string
  sub?: string
  accent?: boolean
}) {
  return (
    <div className={`rounded-2xl border p-4 ${accent ? 'border-brand/40 bg-brand-soft' : 'border-line bg-panel'}`}>
      <p className="text-sm text-ink-muted">{label}</p>
      <p className={`mt-1 font-display text-3xl tracking-wide ${accent ? 'text-brand' : 'text-ink'}`}>{value}</p>
      {sub && <p className="mt-1 text-xs text-ink-muted">{sub}</p>}
    </div>
  )
}

export function PageHeader({
  title,
  subtitle,
  action,
}: {
  title: string
  subtitle?: string
  action?: React.ReactNode
}) {
  return (
    <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h1 className="font-display text-4xl tracking-wide text-ink">{title}</h1>
        {subtitle && <p className="mt-1 text-ink-muted">{subtitle}</p>}
      </div>
      {action}
    </div>
  )
}

export function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    agendado: 'bg-surface-2 text-ink-muted',
    confirmado: 'bg-brand-soft text-brand',
    em_atendimento: 'bg-blue-950/60 text-blue-300',
    finalizado: 'bg-emerald-950/60 text-emerald-300',
    cancelado: 'bg-red-950/60 text-red-300',
    nao_compareceu: 'bg-amber-950/60 text-amber-300',
    aguardando: 'bg-amber-950/60 text-amber-300',
    aberto: 'bg-brand-soft text-brand',
    fechado: 'bg-surface-2 text-ink-muted',
  }
  const labels: Record<string, string> = {
    agendado: 'Agendado',
    confirmado: 'Confirmado',
    em_atendimento: 'Em atendimento',
    finalizado: 'Finalizado',
    cancelado: 'Cancelado',
    nao_compareceu: 'Não compareceu',
    aguardando: 'Aguardando',
  }
  return (
    <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${map[status] ?? 'bg-surface-2'}`}>
      {labels[status] ?? status}
    </span>
  )
}

export function BarChart({ data, labelKey, valueKey }: { data: { [k: string]: string | number }[]; labelKey: string; valueKey: string }) {
  const max = Math.max(...data.map((d) => Number(d[valueKey])), 1)
  return (
    <div className="space-y-2">
      {data.map((d) => (
        <div key={String(d[labelKey])} className="flex items-center gap-3">
          <span className="w-16 shrink-0 text-xs text-ink-muted">{String(d[labelKey])}</span>
          <div className="h-6 flex-1 overflow-hidden rounded bg-surface-2">
            <div
              className="h-full rounded bg-brand transition-all"
              style={{ width: `${(Number(d[valueKey]) / max) * 100}%` }}
            />
          </div>
          <span className="w-20 text-right text-sm text-ink">{Number(d[valueKey]).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span>
        </div>
      ))}
    </div>
  )
}

export function Card({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return <div className={`rounded-2xl border border-line bg-panel p-5 ${className}`}>{children}</div>
}

export function Btn({
  children,
  onClick,
  variant = 'primary',
  type = 'button',
  disabled,
}: {
  children: React.ReactNode
  onClick?: () => void
  variant?: 'primary' | 'secondary' | 'danger'
  type?: 'button' | 'submit'
  disabled?: boolean
}) {
  const styles = {
    primary: 'bg-brand text-surface hover:bg-brand-deep',
    secondary: 'border border-line text-ink hover:bg-surface-2',
    danger: 'bg-red-900/60 text-red-200 hover:bg-red-900',
  }
  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      className={`rounded-xl px-4 py-2 text-sm font-medium transition disabled:opacity-50 ${styles[variant]}`}
    >
      {children}
    </button>
  )
}
