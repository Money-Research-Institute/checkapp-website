const UTM_STORAGE_KEY = 'checkapp_utm'
const UTM_KEYS = [
  'utm_source',
  'utm_medium',
  'utm_campaign',
  'utm_content',
  'utm_term',
  'fbclid',
  'gclid',
] as const

export type UtmKey = (typeof UTM_KEYS)[number]
export type UtmParams = Partial<Record<UtmKey, string>>

function readStored(): UtmParams {
  if (typeof window === 'undefined') return {}
  try {
    const raw =
      sessionStorage.getItem(UTM_STORAGE_KEY) ?? localStorage.getItem(UTM_STORAGE_KEY)
    if (!raw) return {}
    const parsed = JSON.parse(raw) as UtmParams
    return parsed && typeof parsed === 'object' ? parsed : {}
  } catch {
    return {}
  }
}

function writeStored(params: UtmParams): void {
  if (typeof window === 'undefined') return
  const json = JSON.stringify(params)
  try {
    sessionStorage.setItem(UTM_STORAGE_KEY, json)
  } catch {
    // ignore quota / private mode
  }
  try {
    localStorage.setItem(UTM_STORAGE_KEY, json)
  } catch {
    // ignore
  }
}

function fromSearch(search: string): UtmParams {
  const query = new URLSearchParams(search.startsWith('?') ? search : `?${search}`)
  const next: UtmParams = {}
  for (const key of UTM_KEYS) {
    const value = query.get(key)?.trim()
    if (value) next[key] = value
  }
  return next
}

/** Capture UTMs from the current URL into sessionStorage (last-touch within the visit). */
export function captureUtms(search?: string): UtmParams {
  if (typeof window === 'undefined') return {}
  const fromUrl = fromSearch(search ?? window.location.search)
  if (Object.keys(fromUrl).length === 0) return readStored()

  const merged = { ...readStored(), ...fromUrl }
  writeStored(merged)
  return merged
}

export function getUtms(): UtmParams {
  if (typeof window === 'undefined') return {}
  // Prefer any UTMs still on the URL, then fall back to session.
  return captureUtms()
}

export function formatUtms(params: UtmParams = getUtms()): string {
  return UTM_KEYS.filter((key) => params[key])
    .map((key) => `${key}=${params[key]}`)
    .join('&')
}

export function hasUtms(params: UtmParams = getUtms()): boolean {
  return UTM_KEYS.some((key) => Boolean(params[key]))
}

/** Append stored / URL UTMs to an internal or absolute link (skips keys already set). */
export function appendUtmsToUrl(url: string, params: UtmParams = getUtms()): string {
  if (typeof window === 'undefined') return url
  const hasAny = UTM_KEYS.some((key) => params[key])
  if (!hasAny) return url

  try {
    const base = new URL(url, window.location.origin)
    for (const key of UTM_KEYS) {
      const value = params[key]
      if (value && !base.searchParams.has(key)) {
        base.searchParams.set(key, value)
      }
    }
    if (url.startsWith('/') && !url.startsWith('//')) {
      return `${base.pathname}${base.search}${base.hash}`
    }
    return base.toString()
  } catch {
    const qs = formatUtms(params)
    if (!qs) return url
    return url.includes('?') ? `${url}&${qs}` : `${url}?${qs}`
  }
}
