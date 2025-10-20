import NewsAPI from 'newsapi'

const NEWS_API_KEY = process.env.NEWS_API_KEY

if (!NEWS_API_KEY) {
  throw new Error('Please define the NEWS_API_KEY environment variable inside .env.local')
}

// Initialize NewsAPI client
const newsapi = new NewsAPI(NEWS_API_KEY)

export default newsapi

// Helper function to get news by category
export async function getNewsByCategory(category: string, pageSize: number = 20) {
  try {
    const response = await newsapi.v2.everything({
      q: category,
      language: 'en',
      sortBy: 'publishedAt',
      pageSize: pageSize,
    })
    return response
  } catch (error) {
    console.error('Error fetching news:', error)
    throw error
  }
}

// Helper function to get top headlines
export async function getTopHeadlines(category?: string, pageSize: number = 20) {
  try {
    const response = await newsapi.v2.topHeadlines({
      category: category,
      language: 'en',
      pageSize: pageSize,
    })
    return response
  } catch (error) {
    console.error('Error fetching top headlines:', error)
    throw error
  }
}
