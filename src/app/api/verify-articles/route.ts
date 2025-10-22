import { NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'

export async function GET() {
  try {
    console.log('🔍 Verifying articles in database...')
    
    // Connect to MongoDB
    await connectDB()
    const db = (await import('mongoose')).connection.db
    
    if (!db) {
      throw new Error('Database connection not established')
    }
    
    // Get all articles
    const articles = await db.collection('articles').find({}).sort({ createdAt: -1 }).toArray()
    
    console.log(`📊 Found ${articles.length} articles in database`)
    
    // Analyze articles
    const analysis = {
      totalArticles: articles.length,
      categories: {} as Record<string, number>,
      publishers: {} as Record<string, number>,
      hasAllRequiredFields: 0,
      missingFields: [] as string[],
      articles: articles.map(article => ({
        id: article._id,
        title: article.title,
        publisher: article.publisherName,
        category: article.category,
        hasCoverImage: !!article.coverImage,
        hasPublisherLogo: !!article.publisherLogo,
        hasQuickSummary: !!article.quickSummary,
        hasDetailedSummary: !!article.detailedSummary,
        hasWhyItMatters: !!article.whyItMatters,
        sourceUrl: article.sourceUrl,
        createdAt: article.createdAt
      }))
    }
    
    // Count categories
    articles.forEach(article => {
      analysis.categories[article.category] = (analysis.categories[article.category] || 0) + 1
    })
    
    // Count publishers
    articles.forEach(article => {
      analysis.publishers[article.publisherName] = (analysis.publishers[article.publisherName] || 0) + 1
    })
    
    // Check required fields
    const requiredFields = [
      'title', 'coverImage', 'publisherName', 'publisherLogo', 'authorName',
      'datePosted', 'quickSummary', 'detailedSummary', 'whyItMatters', 'sourceUrl', 'category'
    ]
    
    articles.forEach(article => {
      const missingFields = requiredFields.filter((field: string) => !article[field])
      if (missingFields.length === 0) {
        analysis.hasAllRequiredFields++
      } else {
        analysis.missingFields.push(...missingFields)
      }
    })
    
    // Remove duplicates from missing fields
    analysis.missingFields = Array.from(new Set(analysis.missingFields))
    
    console.log('✅ Article verification completed')
    
    return NextResponse.json({
      success: true,
      message: 'Articles verified successfully',
      analysis,
      summary: {
        totalArticles: analysis.totalArticles,
        articlesWithAllFields: analysis.hasAllRequiredFields,
        categories: Object.keys(analysis.categories).length,
        publishers: Object.keys(analysis.publishers).length,
        missingFieldsCount: analysis.missingFields.length
      },
      timestamp: new Date().toISOString()
    })
    
  } catch (error) {
    console.error('❌ Article verification failed:', error)
    return NextResponse.json({
      success: false,
      message: 'Article verification failed',
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}



