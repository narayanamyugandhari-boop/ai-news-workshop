import { NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import { generateArticleSummary, generateWhyItMatters } from '@/lib/gemini'

async function fetchOneMoreArticle() {
  const NEWS_API_KEY = process.env.NEWS_API_KEY
  if (!NEWS_API_KEY) {
    throw new Error('News API key not found')
  }

  console.log('📰 Fetching one more article with broad search...')
  
  try {
    // Try a very broad search for tech news
    const response = await fetch(
      `https://newsapi.org/v2/everything?q=technology&language=en&sortBy=publishedAt&pageSize=10&apiKey=${NEWS_API_KEY}`
    )
    
    if (!response.ok) {
      throw new Error(`API request failed: ${response.status}`)
    }
    
    const data = await response.json()
    
    if (data.articles && data.articles.length > 0) {
      // Filter for tech sources and relevant content
      const techSources = ['techcrunch', 'wired', 'the-verge', 'ars-technica', 'venturebeat', 'engadget', 'mashable', 'recode', 'techradar', 'zdnet']
      
      const filteredArticles = data.articles.filter(article => {
        if (!article.title || !article.description) return false
        
        const sourceName = article.source?.name?.toLowerCase() || ''
        const isTechSource = techSources.some(techSource => 
          sourceName.includes(techSource) || 
          sourceName.includes('tech') ||
          sourceName.includes('wired') ||
          sourceName.includes('verge') ||
          sourceName.includes('ars') ||
          sourceName.includes('venture')
        )
        
        if (!isTechSource) return false
        
        const titleLower = article.title.toLowerCase()
        const descLower = article.description.toLowerCase()
        const content = `${titleLower} ${descLower}`
        
        // Exclude unwanted content
        const excludeKeywords = [
          'politics', 'political', 'war', 'military', 'defense', 'election', 'government',
          'congress', 'senate', 'president', 'biden', 'trump', 'ukraine', 'russia'
        ]
        
        const hasExcludedKeywords = excludeKeywords.some(keyword => 
          content.includes(keyword.toLowerCase())
        )
        
        return !hasExcludedKeywords
      })
      
      console.log(`   ✅ Found ${filteredArticles.length} relevant articles`)
      return filteredArticles
    }
    
    return []
  } catch (error) {
    console.error('   ❌ Error fetching articles:', error)
    return []
  }
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
    
    // Get publisher logo
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
    console.log('🚀 Getting final article to reach 10 total...')
    
    // Get current article count
    await connectDB()
    const db = (await import('mongoose')).connection.db
    const currentCount = await db.collection('articles').countDocuments()
    
    console.log(`📊 Current articles in database: ${currentCount}`)
    
    if (currentCount >= 10) {
      return NextResponse.json({
        success: true,
        message: 'Already have 10 or more articles',
        totalInDatabase: currentCount,
        timestamp: new Date().toISOString()
      })
    }
    
    // Step 1: Fetch one more article
    const rawArticles = await fetchOneMoreArticle()
    
    if (rawArticles.length === 0) {
      return NextResponse.json({
        success: false,
        message: 'No new articles found',
        totalInDatabase: currentCount,
        timestamp: new Date().toISOString()
      })
    }
    
    // Step 2: Process the first new article
    let processedArticle = null
    let error = null
    
    for (const article of rawArticles) {
      try {
        processedArticle = await processArticleWithAI(article)
        break // Use the first successfully processed article
      } catch (err) {
        error = err
        continue
      }
    }
    
    if (!processedArticle) {
      return NextResponse.json({
        success: false,
        message: 'Failed to process any articles',
        error: error instanceof Error ? error.message : 'Unknown error',
        totalInDatabase: currentCount,
        timestamp: new Date().toISOString()
      })
    }
    
    // Step 3: Store in database
    const result = await storeArticleInDatabase(processedArticle)
    
    // Get final count
    const totalArticles = await db.collection('articles').countDocuments()
    
    console.log(`✅ Final article added! Total articles in database: ${totalArticles}`)
    
    return NextResponse.json({
      success: true,
      message: 'Final article added successfully',
      results: {
        processed: 1,
        inserted: result.status === 'inserted' ? 1 : 0,
        duplicate: result.status === 'duplicate' ? 1 : 0,
        totalInDatabase: totalArticles,
        targetReached: totalArticles >= 10
      },
      timestamp: new Date().toISOString()
    })
    
  } catch (error) {
    console.error('❌ Failed to get final article:', error)
    return NextResponse.json({
      success: false,
      message: 'Failed to get final article',
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}



