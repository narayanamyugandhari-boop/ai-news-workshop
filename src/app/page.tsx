'use client'

import { NewsCard } from '@/components/NewsCard'
import { Article } from '@/types'
import { useState, useEffect } from 'react'

interface ArticlesResponse {
  success: boolean
  data: {
    articles: Article[]
    pagination: {
      currentPage: number
      totalPages: number
      totalCount: number
      limit: number
      hasNextPage: boolean
      hasPrevPage: boolean
    }
    categories: string[]
    filters: {
      category: string
    }
  }
}

export default function HomePage() {
  const [articles, setArticles] = useState<Article[]>([])
  const [categories, setCategories] = useState<string[]>(['All'])
  const [selectedCategory, setSelectedCategory] = useState<string>('All')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [pagination, setPagination] = useState<any>(null)

  const fetchArticles = async (category: string = 'All', page: number = 1) => {
    try {
      setLoading(true)
      setError(null)
      
      const params = new URLSearchParams({
        category: category === 'All' ? '' : category,
        page: page.toString(),
        limit: '20'
      })
      
      const response = await fetch(`/api/articles?${params}`)
      const data: ArticlesResponse = await response.json()
      
      if (data.success) {
        setArticles(data.data.articles)
        setCategories(data.data.categories)
        setPagination(data.data.pagination)
        setSelectedCategory(category)
      } else {
        setError('Failed to fetch articles')
      }
    } catch (err) {
      setError('Failed to fetch articles')
      console.error('Error fetching articles:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchArticles()
  }, [])

  const handleCategoryChange = (category: string) => {
    fetchArticles(category, 1)
  }

  const handleLoadMore = () => {
    if (pagination?.hasNextPage) {
      fetchArticles(selectedCategory, pagination.currentPage + 1)
    }
  }

  if (loading && articles.length === 0) {
    return (
      <div className="space-y-8">
        {/* Hero Section */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl md:text-6xl font-bold text-foreground">
            Latest in <span className="text-primary">AI & Technology</span>
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto">
            Stay ahead with the most important news in AI, Technology, Startups, Funding, and Machine Learning
          </p>
        </div>

        {/* Loading State */}
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-8">
        {/* Hero Section */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl md:text-6xl font-bold text-foreground">
            Latest in <span className="text-primary">AI & Technology</span>
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto">
            Stay ahead with the most important news in AI, Technology, Startups, Funding, and Machine Learning
          </p>
        </div>

        {/* Error State */}
        <div className="text-center py-12">
          <p className="text-red-500 mb-4">{error}</p>
          <button 
            onClick={() => fetchArticles()}
            className="px-6 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <div className="text-center space-y-4">
        <h1 className="text-4xl md:text-6xl font-bold text-foreground">
          Latest in <span className="text-primary">AI & Technology</span>
        </h1>
        <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto">
          Stay ahead with the most important news in AI, Technology, Startups, Funding, and Machine Learning
        </p>
      </div>

      {/* Category Filter */}
      <div className="flex flex-wrap justify-center gap-2">
        {categories.map((category) => (
          <button
            key={category}
            onClick={() => handleCategoryChange(category)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              selectedCategory === category
                ? 'bg-primary text-primary-foreground'
                : 'hover:bg-accent hover:text-accent-foreground'
            }`}
          >
            {category}
          </button>
        ))}
      </div>

      {/* News Grid */}
      {articles.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {articles.map((article) => (
            <NewsCard key={article._id} article={article} />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No articles found for the selected category.</p>
        </div>
      )}

      {/* Load More Button */}
      {pagination?.hasNextPage && (
        <div className="text-center">
          <button 
            onClick={handleLoadMore}
            disabled={loading}
            className="px-8 py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Loading...' : 'Load More Articles'}
          </button>
        </div>
      )}
    </div>
  )
}
