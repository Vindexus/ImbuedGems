export type GemColor = 'red' | 'green' | 'blue' | 'white'

export type Gem = {
  id: string
  slug: string
  color: GemColor
  tags: string[]
  name: string
}

export type SkillGem = Gem & {
  types: string[]
  validSupportIds: string[]
  description: string
} & ({
  type: 'alt'
  baseGemId: string
  baseGemName: string
  altLetter: string
} | {
  type: 'base'
})

export type SupportGem = Gem & {
  allowedTypes: string[]
  excludedTypes: string[]
  letter: string
  tradeId: number
  description: string[]
  costMultiplier: number
}
