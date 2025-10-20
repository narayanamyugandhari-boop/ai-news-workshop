import { GoogleGenerativeAI } from '@google/generative-ai'

const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY

if (!GOOGLE_API_KEY) {
  throw new Error('Please define the GOOGLE_API_KEY environment variable inside .env.local')
}

// Initialize Google GenAI client
const genAI = new GoogleGenerativeAI(GOOGLE_API_KEY)

// Get the generative model (using gemini-1.5-flash for better rate limits)
const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' })

export default model

// Helper function to generate article summary
export async function generateArticleSummary(articleContent: string, type: 'brief' | 'detailed' = 'brief') {
  try {
    const prompt = type === 'brief' 
      ? `Generate a brief, engaging summary (2-3 sentences) of this article for a news card: ${articleContent}`
      : `Generate a detailed, two-paragraph summary of this article. Make it informative and easy to understand: ${articleContent}`

    const result = await model.generateContent(prompt)
    const response = await result.response
    return response.text()
  } catch (error) {
    console.error('Error generating article summary:', error)
    throw error
  }
}

// Helper function to generate "Why it Matters" section
export async function generateWhyItMatters(articleContent: string) {
  try {
    const prompt = `Based on this article content, write a single paragraph explaining "Why it Matters" for AI enthusiasts and learners. Focus on the broader implications and significance: ${articleContent}`

    const result = await model.generateContent(prompt)
    const response = await result.response
    return response.text()
  } catch (error) {
    console.error('Error generating "Why it Matters" section:', error)
    throw error
  }
}

// Helper function for chatbot responses
export async function generateChatbotResponse(question: string, articleContent: string) {
  try {
    const prompt = `You are an AI assistant helping users understand this article: "${articleContent}". 

User's question: "${question}"

Please provide a helpful, accurate response based on the article content. If the question is not related to the article, politely redirect the conversation back to the article topic.`

    const result = await model.generateContent(prompt)
    const response = await result.response
    return response.text()
  } catch (error) {
    console.error('Error generating chatbot response:', error)
    throw error
  }
}
