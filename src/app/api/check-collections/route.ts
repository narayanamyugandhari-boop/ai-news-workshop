import { NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'

export async function GET() {
  try {
    console.log('🔍 Checking existing collections and their validation rules...')
    
    // Connect to MongoDB
    await connectDB()
    const db = (await import('mongoose')).connection.db
    
    if (!db) {
      throw new Error('Database connection not established')
    }

    // Get all collections
    const collections = await db.listCollections().toArray()
    console.log('📋 Found collections:', collections.map(c => c.name))

    const collectionDetails = []

    for (const collection of collections) {
      // Get document count using countDocuments()
      const count = await db.collection(collection.name).countDocuments()
      
      // Get collection options
      const options = await db.collection(collection.name).options()
      
      // Get indexes
      const indexes = await db.collection(collection.name).indexes()
      
      collectionDetails.push({
        name: collection.name,
        count: count,
        indexes: indexes.length,
        validation: options.validator || 'No validation',
        validationLevel: options.validationLevel || 'Not set',
        validationAction: options.validationAction || 'Not set'
      })
    }

    console.log('✅ Collection check completed')

    return NextResponse.json({
      success: true,
      message: 'Collections checked successfully',
      database: db.databaseName,
      collections: collectionDetails,
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('❌ Collection check failed:', error)
    return NextResponse.json({
      success: false,
      message: 'Collection check failed',
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}



