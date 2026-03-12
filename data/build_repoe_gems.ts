import { readFileSync, writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { join, dirname } from 'node:path'
import type { GemColor, SkillGem, SupportGem } from '../src/gems/types'

const __dirname = dirname(fileURLToPath(import.meta.url))

const rawGems: Record<string, any> = JSON.parse(readFileSync(join(__dirname, 'repoe-gems-raw.json'), 'utf-8'))
const imbuedTrade: { id: string; text: string }[] = JSON.parse(readFileSync(join(__dirname, 'imbued_trade.json'), 'utf-8'))
const gemsTrade: { entries: { type: string }[] } = JSON.parse(readFileSync(join(__dirname, 'gems_trade.json'), 'utf-8'))
const tradeableGemNames = new Set(gemsTrade.entries.map(e => e.type))

const PREFIX = 'Supported by Level 1 '
const SUPPORT_TRADE_IDS = new Map<string, number>(
  imbuedTrade
    .filter(e => e.id.startsWith('imbued.pseudo_built_in_support|'))
    .map(e => {
      const name = e.text.replace(PREFIX, '') + ' Support'
      const id = Number(e.id.split('|')[1])
      return [name, id] as [string, number]
    })
)

const COLOR_MAP: Record<string, GemColor> = {
  r: 'red',
  g: 'green',
  b: 'blue',
  w: 'white',
}

const ALT_SUFFIX_RE = /Alt([XYZ])$/

function gemSlug(name: string): string {
  return name.replace(/ Support$/, '').toLowerCase().split(' ').join('-').split("'").join('')
}

const skills: SkillGem[] = []
const supports: SupportGem[] = []

for (const [key, raw] of Object.entries(rawGems)) {
  // Skip Vaal gems
  if (key.startsWith('Vaal')) continue

  // Skip Battle Royale variants and legacy/old versions
  if (key.endsWith('Royale') || key.endsWith('Old')) continue

  // Skip unreleased gems
  if (raw.base_item?.release_state !== 'released') continue

  // Skip internal/placeholder gems
  if (raw.display_name.includes('[DNT]')) continue

  const color = COLOR_MAP[raw.color]
  if (!color) {
    console.warn(`Unknown color "${raw.color}" for gem "${key}", skipping`)
    continue
  }

  if (raw.is_support) {
    const sup = raw.support_gem ?? raw.support
    if (!sup) {
      console.warn(`Support gem "${key}" has no support_gem data, skipping`)
      continue
    }

    const tradeId = SUPPORT_TRADE_IDS.get(raw.display_name) ?? 0
    if (!tradeId) continue

    const support: SupportGem = {
      id: key,
      slug: gemSlug(raw.display_name),
      name: raw.display_name,
      color,
      tags: raw.tags ?? [],
      allowedTypes: sup.allowed_types ?? [],
      excludedTypes: sup.excluded_types ?? [],
      letter: sup.letter ?? '',
      tradeId,
      description: [
        sup.support_text,
        ...Object.values(raw.static?.stat_text ?? {}),
        ...Object.values(raw.per_level?.['1']?.stat_text ?? {}),
      ].filter(Boolean) as string[],
      costMultiplier: raw.static?.cost_multiplier ?? 100,
    }
    supports.push(support)
  } else {
    if (!raw.active_skill) {
      console.warn(`Skill gem "${key}" has no active_skill data, skipping`)
      continue
    }

    const altMatch = key.match(ALT_SUFFIX_RE)
    const baseGemId = altMatch ? key.replace(ALT_SUFFIX_RE, '') : null
    const altLetter = altMatch ? altMatch[1].toLowerCase() : null

    // Skip item-granted skills — only include gems obtainable as skill gems on trade
    const baseDisplayName = baseGemId ? rawGems[baseGemId]?.display_name : raw.display_name
    if (!tradeableGemNames.has(baseDisplayName)) continue

    const base: Omit<SkillGem, 'type' | 'baseGemId' | 'altLetter'> = {
      id: key,
      slug: gemSlug(raw.display_name),
      name: raw.display_name,
      color,
      tags: raw.tags ?? [],
      types: raw.active_skill.types ?? [],
      validSupportIds: [], // populated after all gems are processed
      description: raw.active_skill.description ?? '',
    }

    if (baseGemId && altLetter) {
      skills.push({ ...base, type: 'alt', baseGemId, altLetter })
    } else {
      skills.push({ ...base, type: 'base' })
    }
  }
}

// Compute validSupportIds for each skill.
// allowed_types and excluded_types are Reverse Polish Notation boolean expressions
// where AND/OR/NOT are operators and everything else is a skill type token.
// Multiple items remaining on the stack after evaluation are OR'd together.
function evalTypeExpr(tokens: string[], skillTypes: Set<string>): boolean {
  if (tokens.length === 0) return false
  const stack: boolean[] = []
  for (const token of tokens) {
    if (token === 'AND') {
      const b = stack.pop() ?? false
      const a = stack.pop() ?? false
      stack.push(a && b)
    } else if (token === 'OR') {
      const b = stack.pop() ?? false
      const a = stack.pop() ?? false
      stack.push(a || b)
    } else if (token === 'NOT') {
      stack.push(!(stack.pop() ?? false))
    } else {
      stack.push(skillTypes.has(token))
    }
  }
  return stack.some(Boolean)
}

function isSupportValidForSkill(support: SupportGem, skillTypes: Set<string>): boolean {
  if (support.allowedTypes.length === 0) return true
  return evalTypeExpr(support.allowedTypes, skillTypes) && !evalTypeExpr(support.excludedTypes, skillTypes)
}

for (const skill of skills) {
  const skillTypeSet = new Set(skill.types)
  skill.validSupportIds = supports
    .filter(s => isSupportValidForSkill(s, skillTypeSet))
    .map(s => s.id)
}

const gems = { skills, supports }

const output = `// This file is auto-generated by data/build_repoe_gems.ts. Do not edit manually.
// Run \`npm run build:gems\` to regenerate.
import type { SkillGem, SupportGem } from '../gems/types'

export const GEMS: { skills: SkillGem[]; supports: SupportGem[] } = ${JSON.stringify(gems, null, 2)}
`


writeFileSync(join(__dirname, '../src/data/gems.ts'), output)
console.log(`Generated src/data/gems.ts — ${skills.length} skills (${skills.filter(s => s.type === 'base').length} base, ${skills.filter(s => s.type === 'alt').length} alt), ${supports.length} supports`)

console.log(gems.skills.find(x => x.id === 'Cyclone'))

console.log(gems.supports.find(x => x.id === 'SupportTrap'))
