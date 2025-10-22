'use client'

import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import type { Article } from '@/types'
import Image from 'next/image'
import Link from 'next/link'

interface NewsCardProps {
  article: Article
}

export function NewsCard({ article }: NewsCardProps) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const truncateText = (text: string, maxLength: number) => {
    if (text.length <= maxLength) return text
    return text.substring(0, maxLength).trim() + '...'
  }

  return (
    <Link href={`/article/${article._id}`} className="block h-full">
      <Card className="h-full flex flex-col hover:shadow-lg transition-shadow duration-200 cursor-pointer group">
        <div className="relative h-48 w-full overflow-hidden rounded-t-lg">
          <Image
            src={article.coverImage}
            alt={article.title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-200"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
          <div className="absolute top-3 left-3">
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary text-primary-foreground">
              {article.category}
            </span>
          </div>
        </div>
        
        <CardHeader className="flex-1">
          <h3 className="text-lg font-semibold leading-tight line-clamp-2 group-hover:text-primary transition-colors">
            {article.title}
          </h3>
        </CardHeader>
        
        <CardContent className="flex-1">
          <p className="text-sm text-muted-foreground line-clamp-3">
            {truncateText(article.quickSummary, 120)}
          </p>
        </CardContent>
        
        <CardFooter className="pt-0">
          <div className="flex items-center space-x-3 w-full">
            <Avatar className="h-8 w-8">
              <AvatarImage src={article.publisherLogo} alt={article.publisherName} />
              <AvatarFallback className="text-xs">
                {article.publisherName.substring(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-foreground truncate">
                {article.publisherName}
              </p>
              <p className="text-xs text-muted-foreground truncate">
                {article.authorName} • {formatDate(article.datePosted)}
              </p>
            </div>
          </div>
        </CardFooter>
      </Card>
    </Link>
  )
}
