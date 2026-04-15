export type BaseTheme = 'dark' | 'light'
export type AccentPreset = 'green' | 'blue' | 'purple' | 'pink' | 'orange' | 'cyan' | 'custom'

export interface ThemeConfig {
  base: BaseTheme
  accent: AccentPreset
  customColor: string
}

export const DEFAULT_THEME: ThemeConfig = {
  base: 'dark',
  accent: 'green',
  customColor: '#00c27c',
}

export const ACCENT_PRESETS: Record<Exclude<AccentPreset, 'custom'>, { label: string; hex: string }> = {
  green:  { label: 'Verde',   hex: '#00c27c' },
  blue:   { label: 'Azul',    hex: '#3b82f6' },
  purple: { label: 'Violeta', hex: '#8b5cf6' },
  pink:   { label: 'Rosa',    hex: '#ec4899' },
  orange: { label: 'Naranja', hex: '#f97316' },
  cyan:   { label: 'Cian',    hex: '#06b6d4' },
}

// ─── Color math ───────────────────────────────────────────────────────────────

function hexToRgb(hex: string): [number, number, number] {
  const h = hex.replace('#', '')
  return [
    parseInt(h.slice(0, 2), 16),
    parseInt(h.slice(2, 4), 16),
    parseInt(h.slice(4, 6), 16),
  ]
}

function rgbToHsl(r: number, g: number, b: number): [number, number, number] {
  r /= 255; g /= 255; b /= 255
  const max = Math.max(r, g, b), min = Math.min(r, g, b)
  let h = 0, s = 0
  const l = (max + min) / 2
  if (max !== min) {
    const d = max - min
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min)
    if (max === r) h = ((g - b) / d + (g < b ? 6 : 0)) / 6
    else if (max === g) h = ((b - r) / d + 2) / 6
    else h = ((r - g) / d + 4) / 6
  }
  return [h * 360, s * 100, l * 100]
}

function hslToHex(h: number, s: number, l: number): string {
  h /= 360; s /= 100; l /= 100
  const hue2rgb = (p: number, q: number, t: number) => {
    if (t < 0) t += 1; if (t > 1) t -= 1
    if (t < 1 / 6) return p + (q - p) * 6 * t
    if (t < 1 / 2) return q
    if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6
    return p
  }
  let r, g, b
  if (s === 0) {
    r = g = b = l
  } else {
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s
    const p = 2 * l - q
    r = hue2rgb(p, q, h + 1 / 3)
    g = hue2rgb(p, q, h)
    b = hue2rgb(p, q, h - 1 / 3)
  }
  return '#' + [r, g, b].map(x => Math.round(x * 255).toString(16).padStart(2, '0')).join('')
}

export function deriveAccentVars(hex: string) {
  const [r, g, b] = hexToRgb(hex)
  const [h, s, l] = rgbToHsl(r, g, b)
  const darkHex  = hslToHex(h, s, Math.max(l - 15, 10))
  const lightHex = hslToHex(h, s, Math.min(l + 15, 88))
  const [dr, dg, db] = hexToRgb(darkHex)
  const [lr, lg, lb] = hexToRgb(lightHex)
  return {
    brand:      `${r} ${g} ${b}`,
    brandDark:  `${dr} ${dg} ${db}`,
    brandLight: `${lr} ${lg} ${lb}`,
  }
}

// ─── Apply theme to :root ─────────────────────────────────────────────────────

export function applyTheme(config: ThemeConfig) {
  const root = document.documentElement

  // Base
  root.classList.toggle('theme-light', config.base === 'light')

  // Accent color
  const hex = config.accent === 'custom'
    ? config.customColor
    : ACCENT_PRESETS[config.accent].hex

  if (hex) {
    const vars = deriveAccentVars(hex)
    root.style.setProperty('--brand',       vars.brand)
    root.style.setProperty('--brand-dark',  vars.brandDark)
    root.style.setProperty('--brand-light', vars.brandLight)
  }
}

// Minimal inline script string to avoid FOUC — injected in <head> before render
export const THEME_SCRIPT = `
(function(){
  try {
    var PRESETS = {green:'#00c27c',blue:'#3b82f6',purple:'#8b5cf6',pink:'#ec4899',orange:'#f97316',cyan:'#06b6d4'};
    var t = JSON.parse(localStorage.getItem('invest-tracker-theme') || '{}');
    if (t.base === 'light') document.documentElement.classList.add('theme-light');
    var hex = t.accent === 'custom' ? t.customColor : PRESETS[t.accent];
    if (hex && hex !== '#00c27c') {
      function h2r(h){h=h.replace('#','');return[parseInt(h.slice(0,2),16),parseInt(h.slice(2,4),16),parseInt(h.slice(4,6),16)];}
      function r2h(r,g,b){return'#'+[r,g,b].map(function(x){return Math.round(x).toString(16).padStart(2,'0')}).join('');}
      function hsl(r,g,b){r/=255;g/=255;b/=255;var mx=Math.max(r,g,b),mn=Math.min(r,g,b),h=0,s=0,l=(mx+mn)/2;if(mx!==mn){var d=mx-mn;s=l>0.5?d/(2-mx-mn):d/(mx+mn);if(mx===r)h=((g-b)/d+(g<b?6:0))/6;else if(mx===g)h=((b-r)/d+2)/6;else h=((r-g)/d+4)/6;}return[h*360,s*100,l*100];}
      function fromHsl(h,s,l){h/=360;s/=100;l/=100;function q2(p,q,t){if(t<0)t+=1;if(t>1)t-=1;if(t<1/6)return p+(q-p)*6*t;if(t<1/2)return q;if(t<2/3)return p+(q-p)*(2/3-t)*6;return p;}var q=l<0.5?l*(1+s):l+s-l*s,p=2*l-q;return[q2(p,q,h+1/3),q2(p,q,h),q2(p,q,h-1/3)].map(function(x){return Math.round(x*255);});}
      var rgb=h2r(hex),hslv=hsl(rgb[0],rgb[1],rgb[2]);
      var dk=fromHsl(hslv[0],hslv[1],Math.max(hslv[2]-15,10));
      var lt=fromHsl(hslv[0],hslv[1],Math.min(hslv[2]+15,88));
      var el=document.documentElement;
      el.style.setProperty('--brand',rgb.join(' '));
      el.style.setProperty('--brand-dark',dk.join(' '));
      el.style.setProperty('--brand-light',lt.join(' '));
    }
  } catch(e){}
})();
`
