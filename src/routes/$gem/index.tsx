import { createFileRoute, Link, useNavigate } from '@tanstack/react-router'
import { GEMS } from '../../data/gems'
import { getValidSupports } from '../../gems/gems'
import { getGemTradeLink } from '../../gems/trade'
import { ExternalLink } from '../../components/ExternalLink'
import { gemColorStyle } from '../../gems/colors'

export const Route = createFileRoute('/$gem/')({
  validateSearch: (search: Record<string, unknown>) => ({
    selected: typeof search.selected === 'string' ? search.selected : undefined,
  }),
  loader: ({ params }) => {
    const gem = GEMS.skills.find((g) => g.slug === params.gem)
    if (!gem) {
      throw new Error(`Gem not found: ${params.gem}`)
    }
    const COLOR_ORDER = ['red', 'green', 'blue', 'white']
    const supports = getValidSupports(gem).sort((a, b) => {
      const colorDiff = COLOR_ORDER.indexOf(a.color) - COLOR_ORDER.indexOf(b.color)
      return colorDiff !== 0 ? colorDiff : a.name.localeCompare(b.name)
    })
    return { gem, supports }
  },
  component: RouteComponent,
  head: ({ params }) => {
    const gem = GEMS.skills.find(g => g.slug === params.gem)
    return {
      meta: [
        { title: gem ? `${gem.name} — Imbued Gems` : 'Imbued Gems' },
        { name: 'description', content: gem ? `Trade search links for ${gem.name} with its imbued built-in support gems in Path of Exile.` : '' },
      ],
    }
  },
})


function RouteComponent() {
  const { gem, supports } = Route.useLoaderData()
  const { selected } = Route.useSearch()
  const navigate = useNavigate({ from: Route.fullPath })

  const allSlugs = supports.map(s => s.slug)

  // No `selected` param = all selected. Empty string = none selected.
  const selectedSlugs = selected !== undefined
    ? selected.split(',').filter(Boolean)
    : allSlugs

  const selectedSupports = supports.filter(s => selectedSlugs.includes(s.slug))
  const allSelected = selectedSlugs.length === supports.length

  function toggleSupport(slug: string) {
    const next = selectedSlugs.includes(slug)
      ? selectedSlugs.filter(s => s !== slug)
      : [...selectedSlugs, slug]
    const isAll = next.length === supports.length
    navigate({ resetScroll: false, search: { selected: isAll ? undefined : next.join(',') } })
  }

  const toggleAllSearch = allSelected
    ? { selected: '' }
    : { selected: undefined }

  function colorToggleSearch(color: string) {
    const colorSlugs = supports.filter(s => s.color === color).map(s => s.slug)
    const allColorSelected = colorSlugs.every(slug => selectedSlugs.includes(slug))
    const next = allColorSelected
      ? selectedSlugs.filter(s => !colorSlugs.includes(s))
      : [...new Set([...selectedSlugs, ...colorSlugs])]
    const isAll = next.length === supports.length
    return { selected: isAll ? undefined : next.join(',') }
  }

  const colors = ['red', 'green', 'blue', 'white'].filter(c => supports.some(s => s.color === c))
  const colorLabel: Record<string, string> = { red: 'Red', green: 'Green', blue: 'Blue', white: 'White' }
  const colorClass: Record<string, string> = {
    red: 'text-red-400 hover:text-red-300',
    green: 'text-green-400 hover:text-green-300',
    blue: 'text-blue-400 hover:text-blue-300',
    white: 'text-gray-200 hover:text-white',
  }

  return (
    <div className="flex flex-col gap-4 pb-24">
      <Link to="/" search={{ search: undefined }} className="text-sm text-blue-400 hover:text-blue-300 self-start">
        ← Back
      </Link>

      <div>
        <h1 className="text-2xl font-bold" style={gemColorStyle(gem.color)}>{gem.name}</h1>
        <div className="text-sm text-gray-400 mt-1">{gem.tags.join(', ')}</div>
        {gem.description && <p className="text-sm text-gray-300 mt-2">{gem.description}</p>}
      </div>

      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 text-sm">
          <span className="text-gray-500">Toggle</span>
          <Link
            from={Route.fullPath}
            resetScroll={false}
            search={toggleAllSearch}
            className="text-gray-300 hover:text-white"
          >
            All
          </Link>
          {colors.map(c => (
            <Link
              key={c}
              from={Route.fullPath}
              resetScroll={false}
              search={colorToggleSearch(c)}
              className={colorClass[c]}
            >
              {colorLabel[c]}
            </Link>
          ))}
        </div>
        <ExternalLink href={getGemTradeLink(gem, supports, supports)}>
          <span className="hidden sm:inline">Search with all supports</span>
          <span className="sm:hidden">All supports ↗</span>
        </ExternalLink>
      </div>

      <div className="flex flex-col divide-y divide-gray-800">
        {supports.map((s) => {
          const checked = selectedSlugs.includes(s.slug)
          return (
            <div key={s.id} className="flex items-center gap-3 py-3">
              <label className="flex items-start gap-2 flex-1 cursor-pointer min-w-0">
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={() => toggleSupport(s.slug)}
                  className="accent-blue-400 shrink-0 mt-1"
                />
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span style={gemColorStyle(s.color)}>{s.name}</span>
                    <span className="text-xs text-gray-500">{s.costMultiplier}% cost</span>
                  </div>
                  {s.description.length > 0 && (
                    <ul className="text-xs text-gray-400 mt-0.5 space-y-0.5">
                      {s.description.map((line) => <li key={line}>{line}</li>)}
                    </ul>
                  )}
                </div>
              </label>
              <ExternalLink href={getGemTradeLink(gem, supports, [s])}>
                <span className="hidden sm:inline">Only this</span>
                <span className="sm:hidden">↗</span>
              </ExternalLink>
            </div>
          )
        })}
      </div>

      {/* Floating footer */}
      <div className="fixed bottom-0 left-0 right-0 bg-gray-900 border-t border-gray-700 py-4">
        <div className="max-w-3xl mx-auto px-4 flex justify-center">
          {selectedSupports.length === 0 ? (
            <span className="text-base font-medium text-gray-600 cursor-not-allowed">
              <span className="hidden sm:inline">Search with selected supports (0)</span>
              <span className="sm:hidden">No supports selected</span>
            </span>
          ) : (
            <ExternalLink href={getGemTradeLink(gem, supports, selectedSupports)}>
              <span className="text-base font-medium">
                Search ({selectedSupports.length}/{supports.length})
              </span>
            </ExternalLink>
          )}
        </div>
      </div>
    </div>
  )
}
