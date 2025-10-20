# Database Schema - Sample Data Structures

## Articles Collection

### Sample Valid Article Document
```json
{
  "_id": ObjectId("..."),
  "title": "OpenAI Releases GPT-4 Turbo with Enhanced Reasoning Capabilities",
  "coverImage": "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800&h=400&fit=crop",
  "publisherName": "TechCrunch",
  "publisherLogo": "https://images.unsplash.com/photo-1611224923853-80b023f02d71?w=100&h=100&fit=crop",
  "authorName": "Sarah Chen",
  "datePosted": ISODate("2024-01-15T00:00:00.000Z"),
  "quickSummary": "OpenAI unveils GPT-4 Turbo with significantly improved reasoning abilities, faster processing, and enhanced multimodal capabilities.",
  "detailedSummary": "OpenAI has officially launched GPT-4 Turbo, representing a major leap forward in artificial intelligence technology. This new model demonstrates remarkable improvements in logical reasoning, mathematical problem-solving, and creative writing capabilities. The enhanced architecture allows for more nuanced understanding of complex queries and provides more accurate, contextually relevant responses across various domains.\n\nThe model also introduces advanced multimodal processing, enabling seamless integration of text, images, and other data types. Early testing shows significant improvements in code generation, scientific analysis, and creative tasks. The release marks a crucial milestone in the evolution of large language models and their practical applications in professional and educational settings.",
  "whyItMatters": "This breakthrough represents a fundamental shift in how AI can assist with complex problem-solving and creative tasks. For AI enthusiasts and learners, GPT-4 Turbo opens new possibilities for understanding machine reasoning, exploring the boundaries of artificial creativity, and developing more sophisticated AI applications. The enhanced capabilities provide a glimpse into the future of human-AI collaboration.",
  "sourceUrl": "https://techcrunch.com/example-article-1",
  "category": "AI",
  "createdAt": ISODate("2024-01-15T10:30:00.000Z"),
  "updatedAt": ISODate("2024-01-15T10:30:00.000Z")
}
```

### Field Validation Rules
- **title**: String, 1-500 characters, required
- **coverImage**: String, must be valid HTTP/HTTPS URL, required
- **publisherName**: String, 1-100 characters, required
- **publisherLogo**: String, must be valid HTTP/HTTPS URL, required
- **authorName**: String, 1-100 characters, required
- **datePosted**: Date, required
- **quickSummary**: String, 10-500 characters, required
- **detailedSummary**: String, 50-2000 characters, required
- **whyItMatters**: String, 20-1000 characters, required
- **sourceUrl**: String, must be valid HTTP/HTTPS URL, required, unique
- **category**: String, must be one of: "AI", "Technology", "Startups", "Funding", "Machine Learning", required
- **createdAt**: Date, required
- **updatedAt**: Date, required

### Indexes
- `title` (ascending)
- `category` (ascending)
- `datePosted` (descending)
- `sourceUrl` (ascending, unique)
- `createdAt` (descending)

---

## Chats Collection

### Sample Valid Chat Document
```json
{
  "_id": ObjectId("..."),
  "sessionId": "chat-session-abc123def456",
  "articleId": "article-123",
  "messages": [
    {
      "text": "Hi! I'm your AI assistant for this article about 'OpenAI Releases GPT-4 Turbo'. Feel free to ask me any questions!",
      "isUser": false,
      "timestamp": ISODate("2024-01-15T10:30:00.000Z")
    },
    {
      "text": "What are the key improvements in GPT-4 Turbo?",
      "isUser": true,
      "timestamp": ISODate("2024-01-15T10:31:00.000Z")
    },
    {
      "text": "GPT-4 Turbo includes enhanced reasoning capabilities, faster processing speeds, and improved multimodal understanding. The model shows significant improvements in logical reasoning, mathematical problem-solving, and creative writing tasks.",
      "isUser": false,
      "timestamp": ISODate("2024-01-15T10:31:30.000Z")
    }
  ],
  "articleTitle": "OpenAI Releases GPT-4 Turbo with Enhanced Reasoning Capabilities",
  "createdAt": ISODate("2024-01-15T10:30:00.000Z"),
  "updatedAt": ISODate("2024-01-15T10:31:30.000Z")
}
```

### Field Validation Rules
- **sessionId**: String, 10-100 characters, required, unique
- **articleId**: String, 1-100 characters, required
- **messages**: Array of message objects, required
  - **text**: String, 1-2000 characters, required
  - **isUser**: Boolean, required
  - **timestamp**: Date, required
- **articleTitle**: String, 1-500 characters, required
- **createdAt**: Date, required
- **updatedAt**: Date, required

### Indexes
- `sessionId` (ascending, unique)
- `articleId` (ascending)
- `createdAt` (descending)
- `updatedAt` (descending)

---

## Validation Features

### Native MongoDB Validation
Both collections use MongoDB's native `$jsonSchema` validation with:
- **validationLevel**: "strict" - All documents must pass validation
- **validationAction**: "error" - Reject documents that fail validation
- **Required Fields**: All specified fields are mandatory
- **Data Types**: Strict type checking for all fields
- **String Lengths**: Minimum and maximum length constraints
- **URL Validation**: Pattern matching for HTTP/HTTPS URLs
- **Enum Values**: Restricted values for category field
- **Array Validation**: Proper structure for messages array

### Error Handling
When validation fails, MongoDB will return detailed error messages indicating:
- Which fields are missing
- Which fields have invalid data types
- Which fields violate length constraints
- Which fields have invalid patterns or enum values

This ensures data integrity at the database level, preventing invalid data from being stored regardless of the application layer.



