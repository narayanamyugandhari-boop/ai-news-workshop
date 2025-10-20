#!/usr/bin/env node

require('dotenv').config({ path: '.env.local' })
const mongoose = require('mongoose')

async function testMongoDB() {
  console.log('🔧 Testing MongoDB Connection...\n')
  
  const mongoUri = process.env.MONGODB_URI
  console.log('Connection String:', mongoUri.replace(/\/\/.*@/, '//***:***@'))
  
  try {
    console.log('Attempting to connect...')
    await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 5000, // 5 second timeout
      bufferCommands: false,
    })
    
    console.log('✅ MongoDB connection successful!')
    console.log('Database:', mongoose.connection.db.databaseName)
    console.log('Host:', mongoose.connection.host)
    console.log('Port:', mongoose.connection.port)
    
    // Test a simple operation
    const collections = await mongoose.connection.db.listCollections().toArray()
    console.log('Collections:', collections.map(c => c.name))
    
  } catch (error) {
    console.log('❌ MongoDB connection failed:')
    console.log('Error Type:', error.name)
    console.log('Error Message:', error.message)
    
    if (error.message.includes('authentication failed')) {
      console.log('\n🔍 Authentication Issue:')
      console.log('- Check if the username and password are correct')
      console.log('- Verify the user has proper permissions in MongoDB Atlas')
      console.log('- Ensure the user exists in the correct database')
    }
    
    if (error.message.includes('timeout')) {
      console.log('\n🔍 Network Issue:')
      console.log('- Check if your IP is whitelisted in MongoDB Atlas')
      console.log('- Verify network connectivity')
    }
    
    if (error.message.includes('ENOTFOUND')) {
      console.log('\n🔍 DNS Issue:')
      console.log('- Check if the cluster URL is correct')
      console.log('- Verify the cluster is running')
    }
  } finally {
    await mongoose.disconnect()
    console.log('\nDisconnected from MongoDB')
  }
}

testMongoDB().catch(console.error)



