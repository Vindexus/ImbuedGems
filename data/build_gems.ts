import { readFileSync, writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { join, dirname } from 'node:path'

const __dirname = dirname(fileURLToPath(import.meta.url))

const rawGems: RawGem[] = JSON.parse(readFileSync(join(__dirname, 'poegems_dot_com.json'), 'utf-8'))
const imbuedTrade: { id: string; text: string }[] = JSON.parse(readFileSync(join(__dirname, 'imbued_trade.json'), 'utf-8'))

type RawGem = {
  uuid: string
  name: string
  tags: string[]
  colors: string[]
  baseGem?: string
  sG?: string
  uniques: string[]
}

type Gem = {
  id: string
  slug: string
  colors: string[]
  tags: string[]
  name: string
}

type SkillGem = Gem & ({ type: 'alt'; baseGemName: string; altLetter: string } | { type: 'base' })
type SupportGem = Gem & { validSkillIds: string[]; tradeId: number }

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

const uuidToName = new Map(rawGems.map(g => [g.uuid, g.name]))

// Alt gem discriminator letters sourced from pathofexile.com/api/trade/data/items
const ALT_LETTER_OVERRIDES = new Map<string, string>([
  ['Absolution of Inspiring', 'x'],
  ['Animate Guardian of Smiting', 'x'],
  ['Animate Weapon of Ranged Arms', 'y'],
  ['Animate Weapon of Self Reflection', 'x'],
  ['Arc of Oscillating', 'y'],
  ['Arc of Surging', 'x'],
  ['Armageddon Brand of Recall', 'y'],
  ['Armageddon Brand of Volatility', 'x'],
  ['Artillery Ballista of Cross Strafe', 'x'],
  ['Artillery Ballista of Focus Fire', 'y'],
  ['Ball Lightning of Orbiting', 'x'],
  ['Ball Lightning of Static', 'y'],
  ['Bane of Condemnation', 'x'],
  ['Barrage of Volley Fire', 'x'],
  ['Bear Trap of Skewers', 'x'],
  ['Blade Blast of Dagger Detonation', 'y'],
  ['Blade Blast of Unloading', 'x'],
  ['Blade Flurry of Incision', 'x'],
  ['Blade Trap of Greatswords', 'x'],
  ['Blade Trap of Laceration', 'y'],
  ['Blade Vortex of the Scythe', 'x'],
  ['Bladefall of Impaling', 'y'],
  ['Bladefall of Trarthus', 'z'],
  ['Bladefall of Volleys', 'x'],
  ['Bladestorm of Uncertainty', 'x'],
  ['Blast Rain of Trarthus', 'x'],
  ['Blight of Atrophy', 'y'],
  ['Blight of Contagion', 'x'],
  ['Blink Arrow of Bombarding Clones', 'x'],
  ['Blink Arrow of Prismatic Clones', 'y'],
  ['Bodyswap of Sacrifice', 'x'],
  ['Boneshatter of Carnage', 'y'],
  ['Boneshatter of Complex Trauma', 'x'],
  ['Burning Arrow of Vigour', 'x'],
  ['Caustic Arrow of Poison', 'x'],
  ['Chain Hook of Trarthus', 'y'],
  ['Charged Dash of Projection', 'x'],
  ['Cleave of Rage', 'x'],
  ['Cold Snap of Power', 'x'],
  ['Consecrated Path of Endurance', 'x'],
  ['Contagion of Subsiding', 'x'],
  ['Contagion of Transference', 'y'],
  ['Crackling Lance of Branching', 'x'],
  ['Crackling Lance of Disintegration', 'y'],
  ['Creeping Frost of Floes', 'x'],
  ['Cremation of Exhuming', 'x'],
  ['Cremation of the Volcano', 'y'],
  ['Cyclone of Tumult', 'x'],
  ['Dark Pact of Trarthus', 'x'],
  ['Detonate Dead of Chain Reaction', 'y'],
  ['Detonate Dead of Scavenging', 'x'],
  ['Discharge of Misery', 'x'],
  ['Divine Ire of Disintegration', 'y'],
  ['Divine Ire of Holy Lightning', 'x'],
  ['Dominating Blow of Inspiring', 'x'],
  ['Double Strike of Impaling', 'x'],
  ['Double Strike of Momentum', 'y'],
  ['Dual Strike of Ambidexterity', 'x'],
  ['Earthquake of Amplification', 'x'],
  ['Earthshatter of Fragility', 'x'],
  ['Earthshatter of Prominence', 'y'],
  ['Elemental Hit of the Spectrum', 'x'],
  ['Essence Drain of Desperation', 'x'],
  ['Essence Drain of Wickedness', 'y'],
  ['Ethereal Knives of Lingering Blades', 'x'],
  ['Ethereal Knives of the Massacre', 'y'],
  ['Explosive Concoction of Destruction', 'x'],
  ['Explosive Trap of Magnitude', 'y'],
  ['Explosive Trap of Shrapnel', 'x'],
  ['Exsanguinate of Transmission', 'x'],
  ['Eye of Winter of Finality', 'x'],
  ['Eye of Winter of Transience', 'y'],
  ['Fire Trap of Blasting', 'x'],
  ['Firestorm of Meteors', 'x'],
  ['Firestorm of Pelting', 'y'],
  ['Flame Dash of Return', 'y'],
  ['Flame Surge of Combusting', 'x'],
  ['Flameblast of Celerity', 'x'],
  ['Flameblast of Contraction', 'y'],
  ['Flamethrower Trap of Stability', 'x'],
  ['Flicker Strike of Power', 'x'],
  ['Forbidden Rite of Soul Sacrifice', 'x'],
  ['Frenzy of Onslaught', 'x'],
  ['Frost Blades of Katabasis', 'x'],
  ['Frost Bomb of Forthcoming', 'y'],
  ['Frost Bomb of Instability', 'x'],
  ['Frostblink of Wintry Blast', 'x'],
  ['Frozen Legion of Rallying', 'x'],
  ['Galvanic Arrow of Energy', 'x'],
  ['Galvanic Arrow of Surging', 'y'],
  ['Galvanic Field of Intensity', 'x'],
  ['Glacial Cascade of the Fissure', 'x'],
  ['Glacial Hammer of Shattering', 'x'],
  ['Ground Slam of Earthshaking', 'x'],
  ['Heavy Strike of Trarthus', 'y'],
  ['Hexblast of Contradiction', 'x'],
  ['Hexblast of Havoc', 'y'],
  ['Holy Flame Totem of Ire', 'x'],
  ['Ice Crash of Cadence', 'x'],
  ['Ice Nova of Deep Freeze', 'y'],
  ['Ice Nova of Frostbolts', 'x'],
  ['Ice Shot of Penetration', 'x'],
  ['Ice Spear of Splitting', 'x'],
  ['Ice Trap of Hollowness', 'x'],
  ['Icicle Mine of Fanning', 'x'],
  ['Icicle Mine of Sabotage', 'y'],
  ['Incinerate of Expanse', 'x'],
  ['Incinerate of Venting', 'y'],
  ['Infernal Blow of Immolation', 'x'],
  ['Kinetic Blast of Clustering', 'x'],
  ['Kinetic Bolt of Fragmentation', 'x'],
  ['Kinetic Fusillade of Detonation', 'x'],
  ['Kinetic Rain of Impact', 'x'],
  ['Lacerate of Butchering', 'x'],
  ['Lacerate of Haemorrhage', 'y'],
  ['Lancing Steel of Spraying', 'x'],
  ['Leap Slam of Groundbreaking', 'x'],
  ['Lightning Arrow of Electrocution', 'x'],
  ['Lightning Conduit of the Heavens', 'x'],
  ['Lightning Spire Trap of Overloading', 'y'],
  ['Lightning Spire Trap of Zapping', 'x'],
  ['Lightning Strike of Arcing', 'x'],
  ['Lightning Tendrils of Eccentricity', 'x'],
  ['Lightning Tendrils of Escalation', 'y'],
  ['Lightning Trap of Sparking', 'x'],
  ['Mirror Arrow of Bombarding Clones', 'x'],
  ['Mirror Arrow of Prismatic Clones', 'y'],
  ['Molten Strike of the Zenith', 'x'],
  ['Orb of Storms of Squalls', 'x'],
  ['Penance Brand of Conduction', 'y'],
  ['Penance Brand of Dissipation', 'x'],
  ['Perforate of Bloodshed', 'y'],
  ['Perforate of Duality', 'x'],
  ['Poisonous Concoction of Bouncing', 'x'],
  ['Power Siphon of the Archmage', 'x'],
  ['Puncture of Shanking', 'x'],
  ['Purifying Flame of Revelations', 'x'],
  ['Pyroclast Mine of Sabotage', 'x'],
  ['Rage Vortex of Berserking', 'x'],
  ['Rain of Arrows of Artillery', 'x'],
  ['Rain of Arrows of Saturation', 'y'],
  ['Raise Spectre of Transience', 'x'],
  ['Raise Zombie of Falling', 'y'],
  ['Raise Zombie of Slamming', 'x'],
  ['Reave of Refraction', 'x'],
  ['Righteous Fire of Arcane Devotion', 'x'],
  ['Scorching Ray of Immolation', 'x'],
  ['Scourge Arrow of Menace', 'x'],
  ['Searing Bond of Detonation', 'x'],
  ['Seismic Trap of Swells', 'x'],
  ['Shattering Steel of Ammunition', 'x'],
  ['Shield Crush of the Chieftain', 'x'],
  ['Shock Nova of Procession', 'x'],
  ['Shockwave Totem of Authority', 'x'],
  ['Shrapnel Ballista of Steel', 'x'],
  ['Siege Ballista of Splintering', 'x'],
  ['Siege Ballista of Trarthus', 'y'],
  ['Siphoning Trap of Pain', 'x'],
  ['Smite of Divine Judgement', 'x'],
  ['Soulrend of Reaping', 'x'],
  ['Soulrend of the Spiral', 'y'],
  ['Spark of the Nova', 'x'],
  ['Spark of Unpredictability', 'y'],
  ['Spectral Helix of Trarthus', 'y'],
  ['Spectral Shield Throw of Shattering', 'x'],
  ['Spectral Shield Throw of Trarthus', 'y'],
  ['Spectral Throw of Materialising', 'x'],
  ['Spectral Throw of Trarthus', 'y'],
  ['Split Arrow of Splitting', 'x'],
  ['Splitting Steel of Ammunition', 'x'],
  ['Static Strike of Gathering Lightning', 'x'],
  ['Storm Brand of Indecision', 'x'],
  ['Storm Burst of Repulsion', 'x'],
  ['Storm Call of Trarthus', 'x'],
  ['Storm Rain of the Conduit', 'x'],
  ['Storm Rain of the Fence', 'y'],
  ['Stormbind of Teleportation', 'x'],
  ['Summon Carrion Golem of Hordes', 'x'],
  ['Summon Carrion Golem of Scavenging', 'y'],
  ['Summon Chaos Golem of Hordes', 'x'],
  ['Summon Chaos Golem of the Maelström', 'y'],
  ['Summon Flame Golem of Hordes', 'x'],
  ['Summon Flame Golem of the Meteor', 'y'],
  ['Summon Holy Relic of Conviction', 'x'],
  ['Summon Ice Golem of Hordes', 'x'],
  ['Summon Ice Golem of Shattering', 'y'],
  ['Summon Lightning Golem of Hordes', 'x'],
  ['Summon Raging Spirit of Enormity', 'x'],
  ['Summon Reaper of Eviscerating', 'y'],
  ['Summon Reaper of Revenants', 'x'],
  ['Summon Skeletons of Archers', 'x'],
  ['Summon Skeletons of Mages', 'y'],
  ['Summon Stone Golem of Hordes', 'x'],
  ['Summon Stone Golem of Safeguarding', 'y'],
  ['Sunder of Earthbreaking', 'x'],
  ['Sunder of Trarthus', 'y'],
  ['Tectonic Slam of Cataclysm', 'x'],
  ['Tornado of Elemental Turbulence', 'y'],
  ['Tornado Shot of Cloudburst', 'x'],
  ['Toxic Rain of Sporeburst', 'x'],
  ['Toxic Rain of Withering', 'y'],
  ['Viper Strike of the Mamba', 'x'],
  ['Void Sphere of Rending', 'x'],
  ['Volatile Dead of Confinement', 'x'],
  ['Volatile Dead of Seething', 'y'],
  ['Volcanic Fissure of Snaking', 'x'],
  ['Vortex of Projection', 'x'],
  ['Wave of Conviction of Trarthus', 'y'],
  ['Wild Strike of Extremes', 'x'],
])

const excludedTags = ['Vaal', 'Exceptional']

function gemSlug(name: string): string {
  return name.replace(/ Support$/, '').toLowerCase().split(' ').join('-').split("'").join('')
}

const gems: { skills: SkillGem[]; supports: SupportGem[] } = { skills: [], supports: [] }

for (const rg of rawGems) {
  if (rg.tags.some(t => excludedTags.includes(t))) continue

  const g: Gem = {
    id: rg.uuid,
    slug: gemSlug(rg.name),
    name: rg.name,
    tags: rg.tags,
    colors: rg.colors.map(x => x.toLowerCase()),
  }

  if (g.tags.includes('Support')) {
    const support: SupportGem = {
      ...g,
      validSkillIds: (rg.sG ?? '').split(';').filter(Boolean),
      tradeId: SUPPORT_TRADE_IDS.get(g.name) ?? 0,
    }
    gems.supports.push(support)
  } else if (rg.baseGem) {
    const baseGemName = uuidToName.get(rg.baseGem)
    if (!baseGemName) throw new Error(`Could not find base gem name for uuid "${rg.baseGem}"`)
    const altLetter = ALT_LETTER_OVERRIDES.get(rg.name)
    if (!altLetter) throw new Error(`No alt letter defined for "${rg.name}" — add it to ALT_LETTER_OVERRIDES`)
    const skill: SkillGem = { ...g, type: 'alt', baseGemName, altLetter }
    gems.skills.push(skill)
  } else {
    const skill: SkillGem = { ...g, type: 'base' }
    gems.skills.push(skill)
  }
}

const output = `// This file is auto-generated by data/build_gems.ts. Do not edit manually.
// Run \`npm run build:gems\` to regenerate.
import type { SkillGem, SupportGem } from '../gems/types'

export const GEMS: { skills: SkillGem[]; supports: SupportGem[] } = ${JSON.stringify(gems, null, 2)}
`

writeFileSync(join(__dirname, '../src/data/gems.ts'), output)
console.log(`Generated src/data/gems.ts — ${gems.skills.length} skills, ${gems.supports.length} supports`)
