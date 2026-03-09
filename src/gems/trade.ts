import { SkillGem, SupportGem } from "./types";

// {"query":{"status":{"option":"securable"},"type":{"option":"Boneshatter","discriminator":"alt_x"},"stats":[{"type":"count","filters":[{"id":"imbued.pseudo_built_in_support|4141042029"},{"id":"imbued.pseudo_built_in_support|4269882850"}],"value":{"min":1}}]},"sort":{"price":"asc"}}

type TradeOptions = {
  query: {
    status: { option: string }
    type: string | { option: string; discriminator: string }
    stats: Array<{
      type: string
      filters: Array<{ disabled: boolean; id: string }>
      value: { min: number }
    }>
  }
  sort: { price: string }
}

export function getGemTradeOptions(skill: SkillGem, validSupports: SupportGem[], selectedSupports: SupportGem[]): TradeOptions {
  const type = skill.type === 'alt'
    ? { option: skill.baseGemName, discriminator: `alt_${skill.altLetter}` }
    : skill.name

  const selectedIds = new Set(selectedSupports.map(s => s.id))

  return {
    query: {
      status: { option: 'available' },
      type,
      stats: [
        {
          type: 'count',
          filters: validSupports.map(support => ({
            disabled: !selectedIds.has(support.id),
            id: `imbued.pseudo_built_in_support|${support.tradeId}`,
          })),
          value: { min: 1 },
        },
      ],
    },
    sort: { price: 'asc' },
  }
}

export function getGemTradeLink(skill: SkillGem, validSupports: SupportGem[], selectedSupports: SupportGem[]): string {
  const options = getGemTradeOptions(skill, validSupports, selectedSupports)
  return `https://pathofexile.com/trade/search?q=${encodeURIComponent(JSON.stringify(options))}`
}
