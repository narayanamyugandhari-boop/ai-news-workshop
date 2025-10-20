import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'AI News Hub',
  description: 'Stay updated with the latest AI, Technology, Startups, Funding, and Machine Learning news',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <div className="min-h-screen bg-background">
          <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="container mx-auto px-4 py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
                    <span className="text-primary-foreground font-bold text-sm">AI</span>
                  </div>
                  <h1 className="text-2xl font-bold text-foreground">AI News Hub</h1>
                </div>
                <nav className="hidden md:flex items-center space-x-6">
                  <a href="/" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                    Home
                  </a>
                  <a href="#ai" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                    AI
                  </a>
                  <a href="#technology" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                    Technology
                  </a>
                  <a href="#startups" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                    Startups
                  </a>
                  <a href="#funding" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                    Funding
                  </a>
                  <a href="#ml" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                    Machine Learning
                  </a>
                </nav>
              </div>
            </div>
          </header>
          <main className="container mx-auto px-4 py-8">
            {children}
          </main>
          <footer className="border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="container mx-auto px-4 py-8">
              <div className="text-center text-sm text-muted-foreground">
                <p>&copy; 2024 AI News Hub. Stay informed with the latest in AI and technology.</p>
              </div>
            </div>
          </footer>
        </div>
      </body>
    </html>
  )
}



