import { NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'

export async function POST() {
  try {
    console.log('🚀 Starting database setup...')
    
    // Connect to MongoDB
    await connectDB()
    const db = (await import('mongoose')).connection.db
    
    if (!db) {
      throw new Error('Database connection not established')
    }

    console.log('🗄️  Setting up database collections with validation...')

    // Create Articles Collection with Native Validation
    console.log('📰 Creating articles collection...')
    await db.createCollection('articles', {
      validator: {
        $jsonSchema: {
          bsonType: 'object',
          required: [
            'title',
            'coverImage',
            'publisherName',
            'publisherLogo',
            'authorName',
            'datePosted',
            'quickSummary',
            'detailedSummary',
            'whyItMatters',
            'sourceUrl',
            'category',
            'createdAt',
            'updatedAt'
          ],
          properties: {
            title: {
              bsonType: 'string',
              minLength: 1,
              maxLength: 500,
              description: 'Article title must be a string between 1-500 characters'
            },
            coverImage: {
              bsonType: 'string',
              pattern: '^https?://',
              description: 'Cover image must be a valid HTTP/HTTPS URL'
            },
            publisherName: {
              bsonType: 'string',
              minLength: 1,
              maxLength: 100,
              description: 'Publisher name must be a string between 1-100 characters'
            },
            publisherLogo: {
              bsonType: 'string',
              pattern: '^https?://',
              description: 'Publisher logo must be a valid HTTP/HTTPS URL'
            },
            authorName: {
              bsonType: 'string',
              minLength: 1,
              maxLength: 100,
              description: 'Author name must be a string between 1-100 characters'
            },
            datePosted: {
              bsonType: 'date',
              description: 'Date posted must be a valid date'
            },
            quickSummary: {
              bsonType: 'string',
              minLength: 10,
              maxLength: 500,
              description: 'Quick summary must be a string between 10-500 characters'
            },
            detailedSummary: {
              bsonType: 'string',
              minLength: 50,
              maxLength: 2000,
              description: 'Detailed summary must be a string between 50-2000 characters'
            },
            whyItMatters: {
              bsonType: 'string',
              minLength: 20,
              maxLength: 1000,
              description: 'Why it matters must be a string between 20-1000 characters'
            },
            sourceUrl: {
              bsonType: 'string',
              pattern: '^https?://',
              description: 'Source URL must be a valid HTTP/HTTPS URL'
            },
            category: {
              bsonType: 'string',
              enum: ['AI', 'Technology', 'Startups', 'Funding', 'Machine Learning'],
              description: 'Category must be one of: AI, Technology, Startups, Funding, Machine Learning'
            },
            createdAt: {
              bsonType: 'date',
              description: 'Created at must be a valid date'
            },
            updatedAt: {
              bsonType: 'date',
              description: 'Updated at must be a valid date'
            }
          }
        }
      },
      validationLevel: 'strict',
      validationAction: 'error'
    })

    // Create indexes for articles collection
    await db.collection('articles').createIndex({ title: 1 })
    await db.collection('articles').createIndex({ category: 1 })
    await db.collection('articles').createIndex({ datePosted: -1 })
    await db.collection('articles').createIndex({ sourceUrl: 1 }, { unique: true })
    await db.collection('articles').createIndex({ createdAt: -1 })

    console.log('✅ Articles collection created with validation and indexes')

    // Create Chats Collection with Native Validation
    console.log('💬 Creating chats collection...')
    await db.createCollection('chats', {
      validator: {
        $jsonSchema: {
          bsonType: 'object',
          required: [
            'sessionId',
            'articleId',
            'messages',
            'articleTitle',
            'createdAt',
            'updatedAt'
          ],
          properties: {
            sessionId: {
              bsonType: 'string',
              minLength: 10,
              maxLength: 100,
              description: 'Session ID must be a string between 10-100 characters'
            },
            articleId: {
              bsonType: 'string',
              minLength: 1,
              maxLength: 100,
              description: 'Article ID must be a string between 1-100 characters'
            },
            messages: {
              bsonType: 'array',
              minItems: 0,
              items: {
                bsonType: 'object',
                required: ['text', 'isUser', 'timestamp'],
                properties: {
                  text: {
                    bsonType: 'string',
                    minLength: 1,
                    maxLength: 2000,
                    description: 'Message text must be a string between 1-2000 characters'
                  },
                  isUser: {
                    bsonType: 'bool',
                    description: 'isUser must be a boolean'
                  },
                  timestamp: {
                    bsonType: 'date',
                    description: 'Timestamp must be a valid date'
                  }
                }
              },
              description: 'Messages must be an array of message objects'
            },
            articleTitle: {
              bsonType: 'string',
              minLength: 1,
              maxLength: 500,
              description: 'Article title must be a string between 1-500 characters'
            },
            createdAt: {
              bsonType: 'date',
              description: 'Created at must be a valid date'
            },
            updatedAt: {
              bsonType: 'date',
              description: 'Updated at must be a valid date'
            }
          }
        }
      },
      validationLevel: 'strict',
      validationAction: 'error'
    })

    // Create indexes for chats collection
    await db.collection('chats').createIndex({ sessionId: 1 }, { unique: true })
    await db.collection('chats').createIndex({ articleId: 1 })
    await db.collection('chats').createIndex({ createdAt: -1 })
    await db.collection('chats').createIndex({ updatedAt: -1 })

    console.log('✅ Chats collection created with validation and indexes')

    // Get collection info to verify
    const articlesCount = await db.collection('articles').countDocuments()
    const chatsCount = await db.collection('chats').countDocuments()

    console.log('✅ Database setup completed successfully!')

    return NextResponse.json({
      success: true,
      message: 'Database collections created successfully with native validation',
      collections: {
        articles: {
          name: 'articles',
          count: articlesCount,
          validation: 'Enabled with strict validation rules'
        },
        chats: {
          name: 'chats',
          count: chatsCount,
          validation: 'Enabled with strict validation rules'
        }
      },
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('❌ Database setup failed:', error)
    return NextResponse.json({
      success: false,
      message: 'Database setup failed',
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}



