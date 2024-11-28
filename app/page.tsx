import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <div className="max-w-5xl w-full text-center">
        <h1 className="text-4xl font-bold mb-8">Project Management Platform</h1>
        <Link href="/projects">
          <Button size="lg">View Projects</Button>
        </Link>
      </div>
    </main>
  )
}