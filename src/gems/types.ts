type GemColor = 'red' | 'green' | 'blue'

type GemTag = 'attack' | 'projectile' | 'spell' | 'minion'

export type Gem = {
	color: GemColor
}

export type SkillGem = {
	name: string
	key: string
	tags: GemTag[]
}

export type SupportGem = {
	canSupport: GemTag[]
	cannotSupport: GemTag[]
}