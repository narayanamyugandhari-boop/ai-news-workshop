import { NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'

export async function DELETE() {
  try {
    console.log('🗑️  Clearing existing articles from database...')
    
    // Connect to MongoDB
    await connectDB()
    const db = (await import('mongoose')).connection.db
    
    if (!db) {
      throw new Error('Database connection not established')
    }
    
    // Get count before deletion
    const countBefore = await db.collection('articles').countDocuments()
    
    // Delete all articles
    const result = await db.collection('articles').deleteMany({})
    
    console.log(`✅ Cleared ${result.deletedCount} articles from database`)
    
    return NextResponse.json({
      success: true,
      message: 'Articles cleared successfully',
      deletedCount: result.deletedCount,
      countBefore: countBefore,
      countAfter: 0,
      timestamp: new Date().toISOString()
    })
    
  } catch (error) {
    console.error('❌ Failed to clear articles:', error)
    return NextResponse.json({
      success: false,
      message: 'Failed to clear articles',
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}



