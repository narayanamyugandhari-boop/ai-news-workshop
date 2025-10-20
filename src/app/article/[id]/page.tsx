import { notFound } from 'next/navigation'
import { ArticlePage } from '@/components/ArticlePage'
import { Article } from '@/types'

interface ArticlePageProps {
  params: Promise<{ id: string }>
}

async function getArticle(id: string): Promise<Article | null> {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/articles/${id}`, {
      cache: 'no-store' // Ensure fresh data
    })
    
    if (!response.ok) {
      return null
    }
    
    const data = await response.json()
    return data.success ? data.data.article : null
  } catch (error) {
    console.error('Error fetching article:', error)
    return null
  }
}

export default async function Article({ params }: ArticlePageProps) {
  // Await dynamic route parameters (Next.js 15+ requirement)
  const { id } = await params
  
  const article = await getArticle(id)

  if (!article) {
    notFound()
  }

  return <ArticlePage article={article} />
}
