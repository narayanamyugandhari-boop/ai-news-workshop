import { NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    console.log('📰 Fetching individual article from MongoDB...')
    
    // Await dynamic route parameters (Next.js 15+ requirement)
    const { id } = await params
    
    if (!id) {
      return NextResponse.json({
        success: false,
        message: 'Article ID is required',
        timestamp: new Date().toISOString()
      }, { status: 400 })
    }
    
    // Connect to MongoDB
    await connectDB()
    const db = (await import('mongoose')).connection.db
    
    if (!db) {
      throw new Error('Database connection not established')
    }
    
    // Fetch article by ID
    const article = await db.collection('articles').findOne({ _id: new (await import('mongoose')).Types.ObjectId(id) })
    
    if (!article) {
      return NextResponse.json({
        success: false,
        message: 'Article not found',
        timestamp: new Date().toISOString()
      }, { status: 404 })
    }
    
    // Get related articles (same category, excluding current article)
    const relatedArticles = await db.collection('articles')
      .find({ 
        category: article.category,
        _id: { $ne: new (await import('mongoose')).Types.ObjectId(id) }
      })
      .sort({ createdAt: -1 })
      .limit(3)
      .toArray()
    
    console.log(`✅ Fetched article: "${article.title}"`)
    
    return NextResponse.json({
      success: true,
      data: {
        article,
        relatedArticles
      },
      timestamp: new Date().toISOString()
    })
    
  } catch (error) {
    console.error('❌ Failed to fetch article:', error)
    return NextResponse.json({
      success: false,
      message: 'Failed to fetch article',
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}



