import { NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import { generateArticleSummary, generateWhyItMatters } from '@/lib/gemini'

// Expanded list of tech sources
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
  'zdnet',
  'cnet',
  'the-next-web',
  'gizmodo',
  'lifehacker',
  'fast-company'
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

  console.log('📰 Fetching news from expanded tech sources...')
  
  const allArticles = []
  
  // Fetch from each source
  for (const source of TECH_SOURCES) {
    try {
      console.log(`   Fetching from ${source}...`)
      
      const response = await fetch(
        `https://newsapi.org/v2/everything?sources=${source}&language=en&sortBy=publishedAt&pageSize=2&apiKey=${NEWS_API_KEY}`
      )
      
      if (!response.ok) {
        console.log(`   ⚠️  Failed to fetch from ${source}: ${response.status}`)
        continue
      }
      
      const data = await response.json()
      
      if (data.articles && data.articles.length > 0) {
        // Filter articles by category and exclude unwanted content
        const filteredArticles = data.articles.filter((article: any) => {
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
            content.includes('platform') ||
            content.includes('innovation') ||
            content.includes('digital') ||
            content.includes('cloud') ||
            content.includes('data') ||
            content.includes('cyber')
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
  
  // Sort by published date and take the most recent
  const sortedArticles = allArticles
    .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime())
  
  console.log(`📊 Total articles found: ${allArticles.length}`)
  
  return sortedArticles
}

async function processArticleWithAI(article: any, delay: number = 0) {
  if (delay > 0) {
    console.log(`   ⏳ Waiting ${delay}ms to avoid rate limits...`)
    await new Promise(resolve => setTimeout(resolve, delay))
  }
  
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
    
    // Generate AI content with shorter prompts to reduce processing time
    const quickSummary = await generateArticleSummary(articleContent, 'brief')
    
    // Wait between AI calls
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    const detailedSummary = await generateArticleSummary(articleContent, 'detailed')
    
    // Wait between AI calls
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    const whyItMatters = await generateWhyItMatters(articleContent)
    
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
    console.log('🚀 Starting expanded news fetching pipeline...')
    
    // Step 1: Fetch news articles
    const rawArticles = await fetchNewsFromAPI()
    
    if (rawArticles.length === 0) {
      return NextResponse.json({
        success: false,
        message: 'No articles found from specified sources',
        timestamp: new Date().toISOString()
      })
    }
    
    // Get current article count
    await connectDB()
    const db = (await import('mongoose')).connection.db
    const currentCount = await db.collection('articles').countDocuments()
    
    console.log(`📊 Current articles in database: ${currentCount}`)
    console.log(`📊 Processing ${rawArticles.length} new articles...`)
    
    // Step 2: Process articles until we have 10 total
    const processedArticles = []
    const errors = []
    let processedCount = 0
    
    for (let i = 0; i < rawArticles.length && (currentCount + processedCount) < 10; i++) {
      const article = rawArticles[i]
      try {
        // Add delay between articles to avoid rate limits
        const delay = i * 3000 // 3 seconds between each article
        const processed = await processArticleWithAI(article, delay)
        processedArticles.push(processed)
        processedCount++
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
    const inserted = storageResults.filter((r: any) => r.status === 'inserted').length
    const duplicates = storageResults.filter((r: any) => r.status === 'duplicate').length
    const failed = storageResults.filter((r: any) => r.status === 'error').length
    
    console.log(`📊 Storage results: ${inserted} inserted, ${duplicates} duplicates, ${failed} failed`)
    
    // Get final count
    const totalArticles = await db.collection('articles').countDocuments()
    
    console.log(`✅ Pipeline completed! Total articles in database: ${totalArticles}`)
    
    return NextResponse.json({
      success: true,
      message: 'Expanded news fetching pipeline completed successfully',
      results: {
        fetched: rawArticles.length,
        processed: processedArticles.length,
        inserted: inserted,
        duplicates: duplicates,
        failed: failed,
        totalInDatabase: totalArticles,
        targetReached: totalArticles >= 10
      },
      errors: errors,
      timestamp: new Date().toISOString()
    })
    
  } catch (error) {
    console.error('❌ Pipeline failed:', error)
    return NextResponse.json({
      success: false,
      message: 'Expanded news fetching pipeline failed',
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}



