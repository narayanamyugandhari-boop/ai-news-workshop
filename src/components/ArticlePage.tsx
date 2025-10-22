'use client'

import type { Article } from '@/types'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { ChatBot } from '@/components/ChatBot'
import Image from 'next/image'
import Link from 'next/link'
import { ArrowLeft, ExternalLink } from 'lucide-react'

interface ArticlePageProps {
  article: Article
}

export function ArticlePage({ article }: ArticlePageProps) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Back Button */}
      <Link href="/" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors">
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to News
      </Link>

      {/* Article Header */}
      <div className="space-y-6">
        {/* Cover Image */}
        <div className="relative h-64 md:h-96 w-full overflow-hidden rounded-lg">
          <Image
            src={article.coverImage}
            alt={article.title}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 70vw"
            priority
          />
          <div className="absolute top-4 left-4">
            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-primary text-primary-foreground">
              {article.category}
            </span>
          </div>
        </div>

        {/* Title */}
        <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold leading-tight text-foreground">
          {article.title}
        </h1>

        {/* Publisher Info */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <Avatar className="h-12 w-12">
                <AvatarImage src={article.publisherLogo} alt={article.publisherName} />
                <AvatarFallback>
                  {article.publisherName.substring(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <h3 className="font-semibold text-foreground">{article.publisherName}</h3>
                <p className="text-sm text-muted-foreground">
                  By {article.authorName} • {formatDate(article.datePosted)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Separator />

      {/* Article Content */}
      <div className="space-y-8">
        {/* AI-Generated Summary */}
        <Card>
          <CardHeader>
            <h2 className="text-2xl font-semibold text-foreground">AI Summary</h2>
          </CardHeader>
          <CardContent>
            <div className="prose prose-gray max-w-none">
              {article.detailedSummary.split('\n\n').map((paragraph, index) => (
                <p key={index} className="text-base leading-relaxed text-foreground mb-4">
                  {paragraph}
                </p>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Why It Matters Section */}
        <Card className="border-primary/20 bg-primary/5">
          <CardHeader>
            <h2 className="text-2xl font-semibold text-primary">Why It Matters</h2>
          </CardHeader>
          <CardContent>
            <p className="text-base leading-relaxed text-foreground">
              {article.whyItMatters}
            </p>
          </CardContent>
        </Card>

        {/* Read Original Button */}
        <div className="text-center">
          <Button asChild size="lg" className="gap-2">
            <a href={article.sourceUrl} target="_blank" rel="noopener noreferrer">
              Read Original Article
              <ExternalLink className="h-4 w-4" />
            </a>
          </Button>
        </div>
      </div>

      {/* ChatBot */}
      <ChatBot article={article} />
    </div>
  )
}
