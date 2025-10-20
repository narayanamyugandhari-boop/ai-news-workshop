#!/usr/bin/env node

/**
 * Test script to verify all external service configurations
 * Run with: node test-setup.js
 */

require('dotenv').config({ path: '.env.local' })

async function testSetup() {
  console.log('🔧 Testing AI News Hub Setup...\n')
  
  const results = {
    environment: false,
    mongodb: false,
    newsapi: false,
    gemini: false
  }

  // Test Environment Variables
  console.log('📋 Testing Environment Variables...')
  const requiredVars = ['MONGODB_URI', 'NEWS_API_KEY', 'GOOGLE_API_KEY']
  const missingVars = requiredVars.filter(varName => !process.env[varName])
  
  if (missingVars.length === 0) {
    console.log('✅ All environment variables are set')
    results.environment = true
  } else {
    console.log(`❌ Missing environment variables: ${missingVars.join(', ')}`)
  }

  // Test MongoDB Configuration
  console.log('\n🗄️  Testing MongoDB Configuration...')
  const mongoUri = process.env.MONGODB_URI
  if (mongoUri && mongoUri.includes('<db_password>')) {
    console.log('⚠️  MongoDB URI contains placeholder <db_password>. Please replace with actual password.')
    console.log('   Connection string format is correct.')
  } else if (mongoUri && mongoUri.startsWith('mongodb+srv://')) {
    console.log('✅ MongoDB connection string format is valid')
    results.mongodb = true
  } else {
    console.log('❌ Invalid MongoDB connection string format')
  }

  // Test News API Configuration
  console.log('\n📰 Testing News API Configuration...')
  try {
    const response = await fetch(`https://newsapi.org/v2/everything?q=technology&apiKey=${process.env.NEWS_API_KEY}&pageSize=1`)
    if (response.ok) {
      const data = await response.json()
      if (data && data.articles) {
        console.log('✅ News API connection successful')
        results.newsapi = true
      } else {
        console.log('❌ News API response format unexpected')
      }
    } else {
      console.log(`❌ News API error: HTTP ${response.status}`)
    }
  } catch (error) {
    console.log(`❌ News API connection failed: ${error.message}`)
  }

  // Test Gemini API Configuration
  console.log('\n🤖 Testing Gemini API Configuration...')
  try {
    const { GoogleGenerativeAI } = require('@google/generative-ai')
    const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY)
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' })
    
    const result = await model.generateContent('Hello, this is a test.')
    const response = await result.response
    const text = response.text()
    
    if (text && text.length > 0) {
      console.log('✅ Gemini API connection successful')
      results.gemini = true
    } else {
      console.log('❌ Gemini API response empty')
    }
  } catch (error) {
    console.log(`❌ Gemini API connection failed: ${error.message}`)
  }

  // Summary
  console.log('\n📊 Setup Test Summary:')
  console.log('========================')
  console.log(`Environment Variables: ${results.environment ? '✅' : '❌'}`)
  console.log(`MongoDB Configuration: ${results.mongodb ? '✅' : '⚠️ '}`)
  console.log(`News API Connection:   ${results.newsapi ? '✅' : '❌'}`)
  console.log(`Gemini API Connection: ${results.gemini ? '✅' : '❌'}`)
  
  const allWorking = results.environment && results.newsapi && results.gemini
  console.log(`\n🎯 Overall Status: ${allWorking ? '✅ READY FOR PHASE 3' : '⚠️  NEEDS ATTENTION'}`)
  
  if (!allWorking) {
    console.log('\n📝 Next Steps:')
    if (!results.mongodb) {
      console.log('- Replace <db_password> in MONGODB_URI with your actual MongoDB password')
    }
    if (!results.newsapi) {
      console.log('- Verify your News API key is correct and has sufficient quota')
    }
    if (!results.gemini) {
      console.log('- Verify your Google API key is correct and has Gemini API access enabled')
    }
  }
}

testSetup().catch(console.error)



