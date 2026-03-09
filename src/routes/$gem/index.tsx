import { createFileRoute, Link, useNavigate } from '@tanstack/react-router'
import { GEMS } from '../../data/gems'
import { getValidSupports } from '../../gems/gems'
import { getGemTradeLink } from '../../gems/trade'
import { ExternalLink } from '../../components/ExternalLink'

export const Route = createFileRoute('/$gem/')({
  validateSearch: (search: Record<string, unknown>) => ({
    selected: typeof search.selected === 'string' ? search.selected : undefined,
  }),
  loader: ({ params }) => {
    const gem = GEMS.skills.find((g) => g.slug === params.gem)
    if (!gem) {
      throw new Error(`Gem not found: ${params.gem}`)
    }
    const supports = getValidSupports(gem)
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

  return (
    <div className="flex flex-col gap-4 pb-24">
      <Link to="/" search={{ search: undefined }} className="text-sm text-blue-400 hover:text-blue-300 self-start">
        ← Back
      </Link>

      <div>
        <h1 className="text-2xl font-bold">{gem.name}</h1>
        <div className="text-sm text-gray-400 mt-1">{gem.tags.join(', ')}</div>
      </div>

      <div className="flex items-center gap-4">
        <button
          type="button"
          onClick={() => navigate({ resetScroll: false, search: toggleAllSearch })}
          className="text-sm text-blue-400 hover:text-blue-300"
        >
          Toggle All
        </button>
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
              <label className="flex items-center gap-2 flex-1 cursor-pointer min-w-0">
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={() => toggleSupport(s.slug)}
                  className="accent-blue-400 shrink-0"
                />
                <span className="truncate">{s.name}</span>
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
