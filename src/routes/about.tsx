import { createFileRoute, Link } from '@tanstack/react-router'

export const Route = createFileRoute('/about')({
  head: () => ({
    meta: [
      { title: 'About — Imbued Gems' },
      { name: 'description', content: 'About Imbued Gems, a Path of Exile trade helper by Colin "Vindexus" Kierans.' },
    ],
  }),
  component: AboutPage,
})

function AboutPage() {
  return (
    <div className="flex flex-col gap-6">
      <Link to="/" search={{ search: undefined }} className="text-sm text-blue-400 hover:text-blue-300 self-start">
        ← Back
      </Link>

      <h1 className="text-2xl font-bold">About</h1>

      <p>
        Imbued Gems is a trade helper for Path of Exile, built by{' '}
        <span className="text-gray-100 font-medium">Colin &ldquo;Vindexus&rdquo; Kierans</span>.
      </p>

      <p>
        Gem data sourced from{' '}
        <a
          href="https://www.poegems.com"
          target="_blank"
          rel="noreferrer"
          className="text-yellow-400 hover:text-yellow-300"
        >
          poegems.com
        </a>
        , an excellent resource for Path of Exile gem information.
      </p>

      <p>
        The source code is available on{' '}
        <a
          href="https://github.com/Vindexus/ImbuedGems"
          target="_blank"
          rel="noreferrer"
          className="text-yellow-400 hover:text-yellow-300"
        >
          GitHub
        </a>
        .
      </p>
    </div>
  )
}
