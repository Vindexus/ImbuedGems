import { GEMS } from '../data/gems'
import type { SkillGem, SupportGem } from './types'

export function getValidSupports(gem: SkillGem): SupportGem[] {
  return GEMS.supports.filter(s => gem.validSupportIds.includes(s.id));
}
