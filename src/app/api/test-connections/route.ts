import { NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import newsapi from '@/lib/newsapi'
import { getNewsByCategory } from '@/lib/newsapi'
import model from '@/lib/gemini'
import { generateArticleSummary } from '@/lib/gemini'

export async function GET() {
  const results = {
    mongodb: { connected: false, error: null },
    newsapi: { connected: false, error: null },
    gemini: { connected: false, error: null },
    environment: { loaded: false, variables: {} }
  }

  // Test MongoDB connection
  try {
    // Check if connection string is properly formatted
    const mongoUri = process.env.MONGODB_URI
    if (mongoUri && mongoUri.includes('<db_password>')) {
      results.mongodb.error = 'MongoDB URI contains placeholder <db_password>. Please replace with actual password.'
    } else if (mongoUri && mongoUri.startsWith('mongodb+srv://')) {
      // Try to connect (this will fail with auth error but confirms the connection string is valid)
      try {
        await connectDB()
        results.mongodb.connected = true
      } catch (connectError) {
        // If it's an auth error, the connection string is valid but credentials are wrong
        if (connectError instanceof Error && connectError.message.includes('authentication failed')) {
          results.mongodb.error = 'MongoDB connection string is valid but authentication failed. Please check your credentials.'
        } else {
          results.mongodb.error = connectError instanceof Error ? connectError.message : 'Unknown error'
        }
      }
    } else {
      results.mongodb.error = 'Invalid MongoDB connection string format'
    }
  } catch (error) {
    results.mongodb.error = error instanceof Error ? error.message : 'Unknown error'
  }

  // Test News API connection
  try {
    // Test with a direct fetch to avoid client compatibility issues
    const response = await fetch(`https://newsapi.org/v2/everything?q=technology&apiKey=${process.env.NEWS_API_KEY}&pageSize=1`)
    if (response.ok) {
      const data = await response.json()
      if (data && data.articles) {
        results.newsapi.connected = true
      }
    } else {
      results.newsapi.error = `HTTP ${response.status}: ${response.statusText}`
    }
  } catch (error) {
    results.newsapi.error = error instanceof Error ? error.message : 'Unknown error'
  }

  // Test Gemini API connection
  try {
    const testResponse = await generateArticleSummary('This is a test article about artificial intelligence and machine learning technologies.', 'brief')
    if (testResponse && testResponse.length > 0) {
      results.gemini.connected = true
    }
  } catch (error) {
    results.gemini.error = error instanceof Error ? error.message : 'Unknown error'
  }

  // Check environment variables
  try {
    results.environment.variables = {
      MONGODB_URI: process.env.MONGODB_URI ? 'Set' : 'Not set',
      NEWS_API_KEY: process.env.NEWS_API_KEY ? 'Set' : 'Not set',
      GOOGLE_API_KEY: process.env.GOOGLE_API_KEY ? 'Set' : 'Not set',
      NODE_ENV: process.env.NODE_ENV || 'Not set'
    }
    results.environment.loaded = true
  } catch (error) {
    results.environment.loaded = false
  }

  // Determine overall success
  const allConnected = results.mongodb.connected && results.newsapi.connected && results.gemini.connected && results.environment.loaded

  return NextResponse.json({
    success: allConnected,
    message: allConnected 
      ? 'All services connected successfully!' 
      : 'Some services failed to connect. Check the details below.',
    results,
    timestamp: new Date().toISOString()
  })
}
