// src/routes/index.tsx
import { createFileRoute, Link, useNavigate } from '@tanstack/react-router'
import { GEMS } from '../data/gems'
import { getValidSupports } from '../gems/gems'
import { getGemTradeLink } from '../gems/trade'
import { ExternalLink } from '../components/ExternalLink'
import { gemColorStyle } from '../gems/colors'

export const Route = createFileRoute('/')({
  validateSearch: (search: Record<string, unknown>) => ({
    search: typeof search.search === 'string' ? search.search : undefined,
  }),
  head: () => ({
    meta: [
      { title: 'Imbued Gems — PoE Trade Helper' },
      { name: 'description', content: 'Browse imbued skill gems and generate Path of Exile trade links filtered by built-in support gems.' },
    ],
  }),
  component: Home,
  loader: () => GEMS.skills,
})

function Home() {
  const gems = Route.useLoaderData()
  const { search } = Route.useSearch()
  const navigate = useNavigate({ from: Route.fullPath })

  const filtered = search
    ? gems.filter(g => g.name.toLowerCase().includes(search.toLowerCase()))
    : gems

  return (
    <div className="flex flex-col gap-2">
      <input
        type="search"
        placeholder="Search gems..."
        value={search ?? ''}
        onChange={e => navigate({
          resetScroll: false,
          search: { search: e.target.value || undefined },
        })}
        className="border border-gray-600 bg-gray-900 rounded px-3 py-2 text-gray-100 placeholder-gray-500 focus:outline-none focus:border-gray-400"
      />
      <div className="flex flex-col divide-y divide-gray-800">
        {filtered.map(sg => (
          <div key={sg.slug} className="flex items-center gap-3 py-3">
            <Link
              to="/$gem"
              params={{ gem: sg.slug }}
              search={{ selected: undefined }}
              className="flex-1"
              style={gemColorStyle(sg.colors)}
            >
              {sg.name}
            </Link>
            <Link
              to="/$gem"
              params={{ gem: sg.slug }}
              search={{ selected: undefined }}
              className="text-sm text-blue-400 hover:text-blue-300 hidden sm:inline"
            >
              Choose Supports
            </Link>
            <ExternalLink href={getGemTradeLink(sg, getValidSupports(sg), getValidSupports(sg))}>
              <span className="hidden sm:inline">Trade</span>
              <span className="sm:hidden">↗</span>
            </ExternalLink>
          </div>
        ))}
      </div>
    </div>
  )
}
