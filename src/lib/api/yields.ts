export interface YieldPool {
  pool: string
  chain: string
  project: string
  symbol: string
  tvlUsd: number
  apy: number | null
  apyBase: number | null
  apyReward: number | null
  apyMean30d: number | null
  stablecoin: boolean
  ilRisk: string
  outlier: boolean
  count: number
}

let cache: Promise<YieldPool[]> | null = null

export function getYieldPools() {
  if (!cache) {
    cache = fetch('https://yields.llama.fi/pools')
      .then((res) => {
        if (!res.ok) throw new Error(`Request failed (${res.status})`)
        return res.json() as Promise<{ data: YieldPool[] }>
      })
      .then((json) =>
        json.data.map((p) => ({
          pool: p.pool,
          chain: p.chain,
          project: p.project,
          symbol: p.symbol,
          tvlUsd: p.tvlUsd,
          apy: p.apy,
          apyBase: p.apyBase,
          apyReward: p.apyReward,
          apyMean30d: p.apyMean30d,
          stablecoin: p.stablecoin,
          ilRisk: p.ilRisk,
          outlier: p.outlier,
          count: p.count,
        })),
      )
      .catch((err) => {
        cache = null
        throw err
      })
  }
  return cache
}

export type YieldRisk = 'lower' | 'medium' | 'high'

export function yieldRisk(p: YieldPool): { level: YieldRisk; notes: string[] } {
  const notes: string[] = []
  let score = 0
  if (p.tvlUsd < 1_000_000) {
    score += 2
    notes.push('TVL under $1M')
  } else if (p.tvlUsd < 10_000_000) {
    score += 1
    notes.push('TVL under $10M')
  }
  if ((p.apy ?? 0) > 100) {
    score += 2
    notes.push('APY above 100% is rarely sustainable')
  } else if ((p.apy ?? 0) > 30) {
    score += 1
    notes.push('High APY')
  }
  if (p.apyReward && p.apyBase !== null && p.apyReward > (p.apyBase ?? 0) * 2) {
    score += 1
    notes.push('Mostly token-reward driven')
  }
  if (p.ilRisk === 'yes') {
    score += 1
    notes.push('Impermanent loss risk')
  }
  if (p.outlier) {
    score += 2
    notes.push('Flagged as APY outlier')
  }
  if (p.apyMean30d && p.apy && p.apy > p.apyMean30d * 2) {
    score += 1
    notes.push('APY far above its 30-day average')
  }
  if (p.count < 30) {
    score += 1
    notes.push('Short history')
  }
  return { level: score >= 4 ? 'high' : score >= 2 ? 'medium' : 'lower', notes }
}
