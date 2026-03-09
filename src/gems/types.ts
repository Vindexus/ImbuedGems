export type GemColor = 'red' | 'green' | 'blue' | 'white'

export type GemTag = "Spell" | "Minion" | "Duration" | "AoE" | "Physical" | "Lightning" | "Chaos" | "Support" | "Cold" | "Fire" | "Attack" | "Trap" | "Curse" | "Mark" | "Critical" | "Movement" | "Travel" | "Melee" | "Strike" | "Warcry" | "Aura" | "Chaining" | "Guard" | "Arcane" | "Trigger" | "Brand" | "Bow" | "Projectile" | "Totem" | "Exceptional" | "Orb" | "Hex" | "Nova" | "Channelling" | "Mine" | "Prismatic" | "Stance" | "Slam" | "Retaliation" | "Blink" | "Link" | "Blessing" | "Herald" | "Golem" | "Vaal"

export type Gem = {
	id: string
	slug: string
	colors: GemColor[]
	tags: GemTag[]
	name: string
}

export type SkillGem = Gem & ({
	type: 'alt'
  baseGemName: string
	altLetter: string
} | {
	type: 'base'
})

export type SupportGem = Gem & {
  validSkillIds: string[]
  tradeId: number
}