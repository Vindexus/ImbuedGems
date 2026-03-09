import { GEMS } from '../data/gems'
import type { SkillGem, SupportGem } from './types'

export function getValidSupports(gem: SkillGem): SupportGem[] {
  if (gem.type === 'base') {
    return GEMS.supports.filter(s => s.validSkillIds.includes(gem.id) && s.tradeId)
  }
  const baseGem = GEMS.skills.find(g => g.type === 'base' && g.name === gem.baseGemName)
  const baseIds = new Set(baseGem ? GEMS.supports.filter(s => s.validSkillIds.includes(baseGem.id) && s.tradeId).map(s => s.id) : [])
  return GEMS.supports.filter(s => s.tradeId && (baseIds.has(s.id) || s.validSkillIds.includes(gem.id)))
}
