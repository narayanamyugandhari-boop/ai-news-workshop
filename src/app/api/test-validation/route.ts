import { NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'

export async function POST() {
  try {
    console.log('🧪 Testing database validation rules...')
    
    // Connect to MongoDB
    await connectDB()
    const db = (await import('mongoose')).connection.db
    
    if (!db) {
      throw new Error('Database connection not established')
    }

    const results = {
      articles: { valid: false, invalid: false, errors: [] },
      chats: { valid: false, invalid: false, errors: [] }
    }

    // Test Articles Collection Validation
    console.log('📰 Testing articles collection validation...')
    
    // Test 1: Valid article data
    try {
      const validArticle = {
        title: 'Test Article: AI Breakthrough in Machine Learning',
        coverImage: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800&h=400&fit=crop',
        publisherName: 'Tech News',
        publisherLogo: 'https://images.unsplash.com/photo-1611224923853-80b023f02d71?w=100&h=100&fit=crop',
        authorName: 'John Doe',
        datePosted: new Date(),
        quickSummary: 'This is a test article about AI breakthroughs in machine learning technology.',
        detailedSummary: 'This is a detailed summary of the AI breakthrough. It explains the technical aspects and implications for the future of machine learning and artificial intelligence development.',
        whyItMatters: 'This breakthrough matters because it represents a significant advancement in AI technology that could revolutionize how we approach machine learning problems.',
        sourceUrl: 'https://example.com/test-article',
        category: 'AI',
        createdAt: new Date(),
        updatedAt: new Date()
      }

      await db.collection('articles').insertOne(validArticle)
      results.articles.valid = true
      console.log('✅ Valid article inserted successfully')
      
      // Clean up test data
      await db.collection('articles').deleteOne({ sourceUrl: 'https://example.com/test-article' })
      
    } catch (error) {
      results.articles.errors.push(`Valid data test failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
      console.log('❌ Valid article test failed:', error)
    }

    // Test 2: Invalid article data (missing required fields)
    try {
      const invalidArticle = {
        title: 'Test Article',
        // Missing required fields: coverImage, publisherName, etc.
        category: 'InvalidCategory' // Invalid category
      }

      await db.collection('articles').insertOne(invalidArticle)
      results.articles.errors.push('Invalid data was accepted (should have been rejected)')
      console.log('❌ Invalid article was accepted (validation failed)')
      
    } catch (error) {
      results.articles.invalid = true
      console.log('✅ Invalid article correctly rejected:', error instanceof Error ? error.message : 'Unknown error')
    }

    // Test Chats Collection Validation
    console.log('💬 Testing chats collection validation...')
    
    // Test 1: Valid chat data
    try {
      const validChat = {
        sessionId: 'test-session-12345',
        articleId: 'test-article-123',
        messages: [
          {
            text: 'Hello, can you tell me more about this article?',
            isUser: true,
            timestamp: new Date()
          },
          {
            text: 'Sure! This article discusses important AI developments.',
            isUser: false,
            timestamp: new Date()
          }
        ],
        articleTitle: 'Test Article: AI Breakthrough in Machine Learning',
        createdAt: new Date(),
        updatedAt: new Date()
      }

      await db.collection('chats').insertOne(validChat)
      results.chats.valid = true
      console.log('✅ Valid chat inserted successfully')
      
      // Clean up test data
      await db.collection('chats').deleteOne({ sessionId: 'test-session-12345' })
      
    } catch (error) {
      results.chats.errors.push(`Valid data test failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
      console.log('❌ Valid chat test failed:', error)
    }

    // Test 2: Invalid chat data (missing required fields)
    try {
      const invalidChat = {
        sessionId: 'test-session-67890',
        // Missing required fields: articleId, messages, etc.
        messages: [
          {
            text: 'Hello',
            // Missing isUser and timestamp
          }
        ]
      }

      await db.collection('chats').insertOne(invalidChat)
      results.chats.errors.push('Invalid data was accepted (should have been rejected)')
      console.log('❌ Invalid chat was accepted (validation failed)')
      
    } catch (error) {
      results.chats.invalid = true
      console.log('✅ Invalid chat correctly rejected:', error instanceof Error ? error.message : 'Unknown error')
    }

    // Summary
    const allTestsPassed = results.articles.valid && results.articles.invalid && 
                          results.chats.valid && results.chats.invalid

    console.log('🧪 Validation testing completed!')
    console.log('Articles - Valid:', results.articles.valid, 'Invalid rejected:', results.articles.invalid)
    console.log('Chats - Valid:', results.chats.valid, 'Invalid rejected:', results.chats.invalid)

    return NextResponse.json({
      success: allTestsPassed,
      message: allTestsPassed 
        ? 'All validation tests passed! Database schema is properly enforced.'
        : 'Some validation tests failed. Check the details below.',
      results,
      summary: {
        articlesValidation: results.articles.valid && results.articles.invalid ? 'PASS' : 'FAIL',
        chatsValidation: results.chats.valid && results.chats.invalid ? 'PASS' : 'FAIL',
        overallStatus: allTestsPassed ? 'PASS' : 'FAIL'
      },
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('❌ Validation testing failed:', error)
    return NextResponse.json({
      success: false,
      message: 'Validation testing failed',
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}



