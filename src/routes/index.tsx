// src/routes/index.tsx
import { createFileRoute, Link, useNavigate } from '@tanstack/react-router'
import { useState, useEffect, useRef } from 'react'
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
  loader: () => GEMS.skills.slice().sort((a, b) => a.name.localeCompare(b.name)),
})

function Home() {
  const gems = Route.useLoaderData()
  const { search } = Route.useSearch()
  const navigate = useNavigate({ from: Route.fullPath })

  const [inputValue, setInputValue] = useState(search ?? '')
  const [highlightedIndex, setHighlightedIndex] = useState(-1)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Sync local state if URL changes externally (back/forward navigation)
  useEffect(() => { setInputValue(search ?? '') }, [search])

  // Reset highlight when filtered results change
  const filtered = inputValue
    ? gems.filter(g => g.name.toLowerCase().includes(inputValue.toLowerCase()))
    : gems


  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const value = e.target.value
    setInputValue(value)
    setHighlightedIndex(0)
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => {
      navigate({ resetScroll: false, search: { search: value || undefined } })
    }, 400)
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setHighlightedIndex(i => Math.min(i + 1, filtered.length - 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setHighlightedIndex(i => Math.max(i - 1, -1))
    } else if (e.key === 'Esc') {
      setHighlightedIndex(-1)
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const target = filtered[highlightedIndex] ?? filtered[0]
    if (target) navigate({ to: '/$gem', params: { gem: target.slug }, search: { selected: undefined } })
  }

  return (
    <div className="flex flex-col gap-2">
      <form onSubmit={handleSubmit} className="w-full">
      <input
        type="search"
        placeholder="Search gems..."
        value={inputValue}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        id="search-gems"
        className="w-full border border-gray-600 bg-gray-900 rounded px-3 py-2 text-gray-100 placeholder-gray-500 focus:outline-none focus:border-gray-400"
      />
      </form>
      <div className="flex flex-col divide-y divide-gray-800">
        {filtered.map((sg, i) => (
          <div key={sg.slug} className={`flex items-center gap-3 py-3 px-2 -mx-2 rounded ${i === highlightedIndex ? 'bg-gray-800' : ''}`}>
            <Link
              to="/$gem"
              params={{ gem: sg.slug }}
              search={{ selected: undefined }}
              className="flex-1"
              style={gemColorStyle(sg.color)}
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
