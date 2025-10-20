# AI News Hub

A modern, responsive news web application built with Next.js, TypeScript, and shadcn/ui. The application features a beautiful design with excellent color contrast and seamless responsiveness across all screen sizes.

## Features

### Core Functionality
- **News Feed**: Displays 20 news cards on the main page
- **Article Pages**: Dedicated pages for each article with detailed content
- **AI Chatbot**: Interactive chatbot for each article page
- **Responsive Design**: Adapts seamlessly to any screen size

### News Categories
- AI
- Technology
- Startups
- Funding
- Machine Learning

### Article Components
Each news card contains:
- Cover image
- Article title
- Publisher name, author, and publication date
- AI-generated summary

Each article page contains:
- Prominent cover image
- Article title
- Publisher information with logo
- AI-generated detailed summary (2 paragraphs)
- "Why it Matters" section
- "Read Original" button linking to source

### AI Chatbot
- Located in bottom-right corner of article pages
- Opens chat window when clicked
- Allows users to ask questions about the specific article
- Provides contextual responses

## Technical Stack

- **Frontend**: Next.js 14 with App Router
- **Styling**: Tailwind CSS with shadcn/ui components
- **Language**: TypeScript
- **Icons**: Lucide React
- **Image Optimization**: Next.js Image component

## Project Structure

```
src/
├── app/
│   ├── article/[id]/
│   │   └── page.tsx          # Dynamic article pages
│   ├── globals.css           # Global styles
│   ├── layout.tsx            # Root layout
│   ├── not-found.tsx         # 404 page
│   └── page.tsx              # Home page
├── components/
│   ├── ui/                   # shadcn/ui components
│   │   ├── avatar.tsx
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── dialog.tsx
│   │   ├── scroll-area.tsx
│   │   └── separator.tsx
│   ├── ArticlePage.tsx       # Article page component
│   ├── ChatBot.tsx           # AI chatbot component
│   └── NewsCard.tsx          # News card component
├── data/
│   └── mockData.ts           # Mock article data
├── lib/
│   └── utils.ts              # Utility functions
└── types/
    └── index.ts              # TypeScript type definitions
```

## Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

## Development Status

This is Phase 1 of the project, focusing on the front-end implementation with mock data. The application includes:

✅ Complete responsive design
✅ Modern UI with shadcn/ui components
✅ 20 news cards with mock data
✅ Individual article pages
✅ AI chatbot interface
✅ Proper image optimization
✅ TypeScript implementation
✅ Mobile-first responsive design

## Future Phases

- **Phase 2**: Integration with News API for real news data
- **Phase 3**: AI API integration for summaries and chatbot
- **Phase 4**: MongoDB database integration
- **Phase 5**: User authentication and personalization

## Design Features

- **Color Contrast**: Excellent contrast ratios for accessibility
- **Responsive Grid**: Adapts from 1 column on mobile to 4 columns on desktop
- **Hover Effects**: Smooth transitions and interactive elements
- **Typography**: Clear hierarchy with proper font weights and sizes
- **Spacing**: Consistent spacing using Tailwind's design system
- **Loading States**: Smooth loading animations and transitions

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## License

This project is for educational and development purposes.



