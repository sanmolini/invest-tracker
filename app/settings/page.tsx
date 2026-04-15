'use client'

import { useTheme } from '@/components/providers/ThemeProvider'
import { ACCENT_PRESETS, DEFAULT_THEME, type AccentPreset, type BaseTheme } from '@/lib/theme'
import { Sun, Moon } from 'lucide-react'

function ThemePreview({ base, accentHex }: { base: BaseTheme; accentHex: string }) {
  const bg      = base === 'dark' ? '#080b14' : '#f8fafc'
  const card    = base === 'dark' ? '#131929' : '#ffffff'
  const border  = base === 'dark' ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.09)'
  const t1      = base === 'dark' ? '#e2e8f0' : '#0f172a'
  const t2      = base === 'dark' ? '#94a3b8' : '#475569'

  return (
    <div className="rounded-xl overflow-hidden border text-[10px]"
      style={{ background: bg, borderColor: border, width: 160, flexShrink: 0 }}>
      {/* Fake header */}
      <div className="px-3 py-2 flex items-center gap-1.5" style={{ borderBottom: `1px solid ${border}` }}>
        <div className="w-2 h-2 rounded-full" style={{ background: accentHex }} />
        <div className="font-semibold" style={{ color: t1 }}>InvestTracker</div>
      </div>
      {/* Fake card */}
      <div className="p-3 space-y-2">
        <div className="rounded-lg p-2" style={{ background: card, border: `1px solid ${border}` }}>
          <div className="mb-1" style={{ color: t2 }}>Valor Total</div>
          <div className="font-bold font-mono" style={{ color: t1 }}>$12,450.00</div>
          <div className="font-mono text-[9px]" style={{ color: '#22c55e' }}>+8.24%</div>
        </div>
        <div className="rounded-lg px-2.5 py-1.5 text-center font-semibold"
          style={{ background: accentHex, color: '#fff' }}>
          + Nueva inversión
        </div>
      </div>
    </div>
  )
}

export default function SettingsPage() {
  const { theme, setTheme } = useTheme()

  const accentHex = theme.accent === 'custom'
    ? theme.customColor
    : ACCENT_PRESETS[theme.accent as Exclude<AccentPreset, 'custom'>]?.hex ?? '#00c27c'

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="page-title">Configuración</h1>
        <p className="text-text-muted text-sm mt-1">Personalizá la apariencia de la app</p>
      </div>

      <div className="card p-6 space-y-8">

        {/* ── Base theme ───────────────────────────────────── */}
        <div>
          <div className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-4">
            Fondo
          </div>
          <div className="grid grid-cols-2 gap-3">
            {(['dark', 'light'] as BaseTheme[]).map(base => {
              const active = theme.base === base
              return (
                <button
                  key={base}
                  onClick={() => setTheme({ ...theme, base })}
                  className={`flex items-center gap-3 p-4 rounded-xl border-2 transition-all ${
                    active ? 'border-brand' : 'border-bg-border hover:border-bg-elevated'
                  }`}
                  style={active ? { borderColor: accentHex } : undefined}
                >
                  <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${
                    base === 'dark' ? 'bg-[#0f1424]' : 'bg-[#f1f5f9]'
                  }`}>
                    {base === 'dark'
                      ? <Moon size={18} className="text-[#94a3b8]" />
                      : <Sun  size={18} className="text-[#475569]" />
                    }
                  </div>
                  <div className="text-left">
                    <div className="text-sm font-semibold text-text-primary">
                      {base === 'dark' ? 'Oscuro' : 'Claro'}
                    </div>
                    <div className="text-xs text-text-muted">
                      {base === 'dark' ? 'Ideal para pantallas' : 'Alto contraste'}
                    </div>
                  </div>
                  {active && (
                    <div className="ml-auto w-4 h-4 rounded-full flex items-center justify-center"
                      style={{ background: accentHex }}>
                      <div className="w-2 h-2 rounded-full bg-white" />
                    </div>
                  )}
                </button>
              )
            })}
          </div>
        </div>

        {/* ── Accent color ─────────────────────────────────── */}
        <div>
          <div className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-4">
            Color de acento
          </div>

          {/* Presets grid */}
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 mb-3">
            {(Object.entries(ACCENT_PRESETS) as [Exclude<AccentPreset,'custom'>, { label: string; hex: string }][]).map(([key, info]) => {
              const active = theme.accent === key
              return (
                <button
                  key={key}
                  onClick={() => setTheme({ ...theme, accent: key })}
                  className="flex flex-col items-center gap-1.5 p-2 rounded-xl border-2 transition-all"
                  style={{
                    borderColor: active ? info.hex : 'rgba(255,255,255,0.07)',
                    backgroundColor: active ? `${info.hex}18` : 'transparent',
                  }}
                >
                  <div className="w-7 h-7 rounded-full border-2 border-white/10"
                    style={{ background: info.hex }} />
                  <span className="text-[10px] text-text-secondary">{info.label}</span>
                </button>
              )
            })}
          </div>

          {/* Custom picker */}
          <button
            onClick={() => setTheme({ ...theme, accent: 'custom' })}
            className={`w-full flex items-center gap-3 p-3 rounded-xl border-2 transition-all ${
              theme.accent === 'custom'
                ? 'border-brand'
                : 'border-bg-border hover:border-bg-elevated'
            }`}
            style={theme.accent === 'custom' ? { borderColor: accentHex } : undefined}
          >
            <div className="w-7 h-7 rounded-full border-2 border-white/10 overflow-hidden relative shrink-0">
              <div className="absolute inset-0"
                style={{ background: 'conic-gradient(red,yellow,lime,cyan,blue,magenta,red)' }} />
              {theme.accent === 'custom' && (
                <div className="absolute inset-0.5 rounded-full"
                  style={{ background: theme.customColor }} />
              )}
            </div>
            <span className="text-sm text-text-primary font-medium">Personalizado</span>
            {theme.accent === 'custom' && (
              <input
                type="color"
                value={theme.customColor}
                onChange={e => setTheme({ ...theme, accent: 'custom', customColor: e.target.value })}
                onClick={e => e.stopPropagation()}
                className="ml-auto h-8 w-16 rounded cursor-pointer border-0 bg-transparent"
              />
            )}
          </button>
        </div>

        {/* ── Live preview ─────────────────────────────────── */}
        <div>
          <div className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-4">
            Vista previa
          </div>
          <div className="flex gap-4 items-start flex-wrap">
            <ThemePreview base={theme.base} accentHex={accentHex} />
            <div className="flex-1 min-w-0 space-y-3 text-sm">
              <div className="flex items-center gap-3">
                <div className="w-4 h-4 rounded-full shrink-0" style={{ background: accentHex }} />
                <div>
                  <div className="text-text-primary font-medium">Acento activo</div>
                  <div className="text-text-muted font-mono text-xs">{accentHex.toUpperCase()}</div>
                </div>
              </div>
              <div className="space-y-1.5 text-xs text-text-muted">
                <div>· Gráficas, botones y estados activos usan este color</div>
                <div>· Los colores de ganancia/pérdida siempre son verde/rojo</div>
                <div>· La legibilidad del texto se mantiene en todos los fondos</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
