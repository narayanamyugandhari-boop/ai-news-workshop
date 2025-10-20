import { NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import { generateArticleSummary, generateWhyItMatters } from '@/lib/gemini'

// Top-tier tech publications
const TECH_SOURCES = [
  'techcrunch',
  'wired',
  'the-verge',
  'ars-technica',
  'venturebeat',
  'engadget',
  'mashable',
  'recode',
  'techradar',
  'zdnet'
]

// Categories to focus on
const CATEGORIES = ['AI', 'Technology', 'Startups', 'Funding', 'Machine Learning']

// Keywords to exclude (politics, war, defense)
const EXCLUDE_KEYWORDS = [
  'politics', 'political', 'war', 'military', 'defense', 'election', 'government',
  'congress', 'senate', 'president', 'biden', 'trump', 'ukraine', 'russia',
  'china', 'trade war', 'sanctions', 'nato', 'security clearance'
]

async function fetchNewsFromAPI() {
  const NEWS_API_KEY = process.env.NEWS_API_KEY
  if (!NEWS_API_KEY) {
    throw new Error('News API key not found')
  }

  console.log('📰 Fetching news from top-tier tech sources...')
  
  const allArticles = []
  
  // Fetch from each source
  for (const source of TECH_SOURCES) {
    try {
      console.log(`   Fetching from ${source}...`)
      
      const response = await fetch(
        `https://newsapi.org/v2/everything?sources=${source}&language=en&sortBy=publishedAt&pageSize=5&apiKey=${NEWS_API_KEY}`
      )
      
      if (!response.ok) {
        console.log(`   ⚠️  Failed to fetch from ${source}: ${response.status}`)
        continue
      }
      
      const data = await response.json()
      
      if (data.articles && data.articles.length > 0) {
        // Filter articles by category and exclude unwanted content
        const filteredArticles = data.articles.filter(article => {
          if (!article.title || !article.description) return false
          
          const titleLower = article.title.toLowerCase()
          const descLower = article.description.toLowerCase()
          const content = `${titleLower} ${descLower}`
          
          // Check if article contains excluded keywords
          const hasExcludedKeywords = EXCLUDE_KEYWORDS.some(keyword => 
            content.includes(keyword.toLowerCase())
          )
          
          if (hasExcludedKeywords) return false
          
          // Check if article is about our target categories
          const hasTargetCategory = CATEGORIES.some(category => 
            content.includes(category.toLowerCase()) || 
            content.includes('artificial intelligence') ||
            content.includes('machine learning') ||
            content.includes('startup') ||
            content.includes('funding') ||
            content.includes('venture capital') ||
            content.includes('tech') ||
            content.includes('software') ||
            content.includes('app') ||
            content.includes('platform')
          )
          
          return hasTargetCategory
        })
        
        allArticles.push(...filteredArticles)
        console.log(`   ✅ Found ${filteredArticles.length} relevant articles from ${source}`)
      }
    } catch (error) {
      console.log(`   ❌ Error fetching from ${source}:`, error)
    }
  }
  
  // Sort by published date and take the 10 most recent
  const sortedArticles = allArticles
    .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime())
    .slice(0, 10)
  
  console.log(`📊 Total articles found: ${allArticles.length}`)
  console.log(`🎯 Selected top 10 articles for processing`)
  
  return sortedArticles
}

async function processArticleWithAI(article: any) {
  console.log(`🤖 Processing article: "${article.title}"`)
  
  try {
    // Prepare content for AI processing
    const articleContent = `
Title: ${article.title}
Description: ${article.description || ''}
Content: ${article.content || article.description || ''}
Source: ${article.source?.name || 'Unknown'}
Published: ${article.publishedAt}
URL: ${article.url}
    `.trim()
    
    // Generate AI content
    const [quickSummary, detailedSummary, whyItMatters] = await Promise.all([
      generateArticleSummary(articleContent, 'brief'),
      generateArticleSummary(articleContent, 'detailed'),
      generateWhyItMatters(articleContent)
    ])
    
    // Determine category based on content
    const content = `${article.title} ${article.description || ''}`.toLowerCase()
    let category = 'Technology' // default
    
    if (content.includes('ai') || content.includes('artificial intelligence') || content.includes('gpt') || content.includes('machine learning')) {
      category = 'AI'
    } else if (content.includes('startup') || content.includes('funding') || content.includes('venture') || content.includes('investment')) {
      category = 'Startups'
    } else if (content.includes('funding') || content.includes('investment') || content.includes('series a') || content.includes('series b')) {
      category = 'Funding'
    } else if (content.includes('machine learning') || content.includes('neural network') || content.includes('algorithm')) {
      category = 'Machine Learning'
    }
    
    // Get publisher logo (using a placeholder service for now)
    const publisherLogo = `https://logo.clearbit.com/${article.source?.name?.toLowerCase().replace(/\s+/g, '')}.com` || 
                         'https://via.placeholder.com/100x100/3B82F6/FFFFFF?text=' + encodeURIComponent(article.source?.name || 'News')
    
    const processedArticle = {
      title: article.title,
      coverImage: article.urlToImage || 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&h=400&fit=crop',
      publisherName: article.source?.name || 'Unknown Publisher',
      publisherLogo: publisherLogo,
      authorName: article.author || 'Staff Writer',
      datePosted: new Date(article.publishedAt),
      quickSummary: quickSummary,
      detailedSummary: detailedSummary,
      whyItMatters: whyItMatters,
      sourceUrl: article.url,
      category: category,
      createdAt: new Date(),
      updatedAt: new Date()
    }
    
    console.log(`   ✅ AI processing completed for: "${article.title}"`)
    return processedArticle
    
  } catch (error) {
    console.error(`   ❌ AI processing failed for: "${article.title}"`, error)
    throw error
  }
}

async function storeArticleInDatabase(article: any) {
  try {
    await connectDB()
    const db = (await import('mongoose')).connection.db
    
    if (!db) {
      throw new Error('Database connection not established')
    }
    
    // Check for duplicates by sourceUrl
    const existingArticle = await db.collection('articles').findOne({ sourceUrl: article.sourceUrl })
    
    if (existingArticle) {
      console.log(`   ⚠️  Article already exists: "${article.title}"`)
      return { status: 'duplicate', article: existingArticle }
    }
    
    // Insert new article
    const result = await db.collection('articles').insertOne(article)
    
    console.log(`   ✅ Stored in database: "${article.title}"`)
    return { status: 'inserted', id: result.insertedId, article }
    
  } catch (error) {
    console.error(`   ❌ Database storage failed for: "${article.title}"`, error)
    throw error
  }
}

export async function POST() {
  try {
    console.log('🚀 Starting news fetching and processing pipeline...')
    
    // Step 1: Fetch news articles
    const rawArticles = await fetchNewsFromAPI()
    
    if (rawArticles.length === 0) {
      return NextResponse.json({
        success: false,
        message: 'No articles found from specified sources',
        timestamp: new Date().toISOString()
      })
    }
    
    console.log(`📊 Processing ${rawArticles.length} articles...`)
    
    // Step 2: Process each article with AI
    const processedArticles = []
    const errors = []
    
    for (const article of rawArticles) {
      try {
        const processed = await processArticleWithAI(article)
        processedArticles.push(processed)
      } catch (error) {
        errors.push({
          title: article.title,
          error: error instanceof Error ? error.message : 'Unknown error'
        })
      }
    }
    
    console.log(`🤖 AI processing completed: ${processedArticles.length} successful, ${errors.length} failed`)
    
    // Step 3: Store in database
    const storageResults = []
    
    for (const article of processedArticles) {
      try {
        const result = await storeArticleInDatabase(article)
        storageResults.push(result)
      } catch (error) {
        storageResults.push({
          status: 'error',
          title: article.title,
          error: error instanceof Error ? error.message : 'Unknown error'
        })
      }
    }
    
    // Summary
    const inserted = storageResults.filter(r => r.status === 'inserted').length
    const duplicates = storageResults.filter(r => r.status === 'duplicate').length
    const failed = storageResults.filter(r => r.status === 'error').length
    
    console.log(`📊 Storage results: ${inserted} inserted, ${duplicates} duplicates, ${failed} failed`)
    
    // Get final count
    await connectDB()
    const db = (await import('mongoose')).connection.db
    const totalArticles = await db.collection('articles').countDocuments()
    
    console.log(`✅ Pipeline completed! Total articles in database: ${totalArticles}`)
    
    return NextResponse.json({
      success: true,
      message: 'News fetching and processing pipeline completed successfully',
      results: {
        fetched: rawArticles.length,
        processed: processedArticles.length,
        inserted: inserted,
        duplicates: duplicates,
        failed: failed,
        totalInDatabase: totalArticles
      },
      errors: errors,
      timestamp: new Date().toISOString()
    })
    
  } catch (error) {
    console.error('❌ Pipeline failed:', error)
    return NextResponse.json({
      success: false,
      message: 'News fetching and processing pipeline failed',
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}



