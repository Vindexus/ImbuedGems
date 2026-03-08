import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/$gem/')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/$gem/"!</div>
}
