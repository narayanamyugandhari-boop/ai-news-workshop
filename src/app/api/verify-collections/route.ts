import { NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'

export async function GET() {
  try {
    console.log('🔍 Verifying collections in MongoDB Atlas...')
    
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
      const count = await db.collection(collection.name).countDocuments()
      const indexes = await db.collection(collection.name).listIndexes().toArray()
      
      // Get collection options (including validation)
      const options = await db.collection(collection.name).options()
      
      collectionDetails.push({
        name: collection.name,
        documentCount: count,
        indexes: indexes.map(idx => ({
          name: idx.name,
          key: idx.key,
          unique: idx.unique || false
        })),
        validation: {
          enabled: !!options.validator,
          level: options.validationLevel || 'Not set',
          action: options.validationAction || 'Not set',
          schema: options.validator ? 'Native MongoDB $jsonSchema validation' : 'None'
        }
      })
    }

    console.log('✅ Collection verification completed')

    return NextResponse.json({
      success: true,
      message: 'Collections verified successfully in MongoDB Atlas',
      database: {
        name: db.databaseName,
        host: (await import('mongoose')).connection.host,
        port: (await import('mongoose')).connection.port
      },
      collections: collectionDetails,
      summary: {
        totalCollections: collections.length,
        collectionsWithValidation: collectionDetails.filter((c: any) => c.validation.enabled).length,
        totalDocuments: collectionDetails.reduce((sum, c) => sum + c.documentCount, 0),
        totalIndexes: collectionDetails.reduce((sum, c) => sum + c.indexes.length, 0)
      },
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('❌ Collection verification failed:', error)
    return NextResponse.json({
      success: false,
      message: 'Collection verification failed',
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}



