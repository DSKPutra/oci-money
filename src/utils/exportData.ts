import type { Platform } from '../types'

function downloadBlob(content: string, filename: string, mimeType: string) {
  try {
    const blob = new Blob([content], { type: mimeType })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = filename
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  } catch {
    // ignore download errors
  }
}

export function exportJson(platforms: Platform[]) {
  downloadBlob(JSON.stringify(platforms, null, 2), 'oci-money-platforms.json', 'application/json')
}

const CSV_COLUMNS: (keyof Platform)[] = [
  'id',
  'name',
  'category',
  'url',
  'pricing',
  'description',
  'descriptionId',
]

function escapeCsvField(value: unknown): string {
  const str = String(value ?? '')
  if (/[",\n]/.test(str)) {
    return `"${str.replace(/"/g, '""')}"`
  }
  return str
}

export function exportCsv(platforms: Platform[]) {
  const header = CSV_COLUMNS.join(',')
  const rows = platforms.map((p) => CSV_COLUMNS.map((col) => escapeCsvField(p[col])).join(','))
  const csv = [header, ...rows].join('\n')
  downloadBlob(csv, 'oci-money-platforms.csv', 'text/csv')
}

export function parseImportedJson(text: string): Platform[] {
  const parsed = JSON.parse(text)
  if (!Array.isArray(parsed)) throw new Error('Invalid file: expected an array of platforms')
  return parsed.filter(
    (p): p is Platform =>
      p && typeof p.name === 'string' && typeof p.url === 'string' && typeof p.id === 'string',
  )
}
