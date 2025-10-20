import { NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'

export async function GET(request: Request) {
  try {
    console.log('📰 Fetching articles from MongoDB...')
    
    // Connect to MongoDB
    await connectDB()
    const db = (await import('mongoose')).connection.db
    
    if (!db) {
      throw new Error('Database connection not established')
    }
    
    // Get query parameters
    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category')
    const limit = parseInt(searchParams.get('limit') || '20')
    const page = parseInt(searchParams.get('page') || '1')
    const skip = (page - 1) * limit
    
    // Build query
    const query: any = {}
    if (category && category !== 'All') {
      query.category = category
    }
    
    // Fetch articles with pagination
    const articles = await db.collection('articles')
      .find(query)
      .sort({ createdAt: -1 }) // Most recent first
      .skip(skip)
      .limit(limit)
      .toArray()
    
    // Get total count for pagination
    const totalCount = await db.collection('articles').countDocuments(query)
    
    // Get unique categories for filtering
    const categories = await db.collection('articles').distinct('category')
    
    console.log(`✅ Fetched ${articles.length} articles from database`)
    
    return NextResponse.json({
      success: true,
      data: {
        articles,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(totalCount / limit),
          totalCount,
          limit,
          hasNextPage: page < Math.ceil(totalCount / limit),
          hasPrevPage: page > 1
        },
        categories: ['All', ...categories.sort()],
        filters: {
          category: category || 'All'
        }
      },
      timestamp: new Date().toISOString()
    })
    
  } catch (error) {
    console.error('❌ Failed to fetch articles:', error)
    return NextResponse.json({
      success: false,
      message: 'Failed to fetch articles',
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}



