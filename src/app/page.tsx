import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowRight, FileText, Video, Brain, Zap, Star, Users, Download, Play } from "lucide-react"
import { auth } from "@clerk/nextjs/server"
import Link from "next/link"
import type { Metadata } from "next"
import { GitHubButtons } from "@/components/github-buttons"

export const metadata: Metadata = {
  title: 'makeitvid - Transform Documents Into Video Overviews',
  description: 'Open-source alternative to NotebookLM. Transform PDFs, research papers, and documents into engaging video summaries with AI-powered narration and visual aids.',
  openGraph: {
    title: 'makeitvid - Transform Documents Into Video Overviews',
    description: 'Open-source alternative to NotebookLM. Create professional video summaries from your documents with AI.',
    type: 'website',
  },
}

export default async function HomePage() {
  const { userId } = await auth()
  
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: 'makeitvid',
    applicationCategory: 'MultimediaApplication',
    operatingSystem: 'Web',
    description: 'Transform documents into engaging video summaries with AI. Open-source alternative to NotebookLM for creating narrated video overviews from PDFs, research papers, and documents.',
    url: 'https://makeitvid.com',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
    },
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: '4.8',
      ratingCount: '150',
    },
    author: {
      '@type': 'Organization',
      name: 'makeitvid',
      url: 'https://makeitvid.com',
    },
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      {/* Header */}
      <header className="border-b border-gray-200 bg-white sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gray-900 rounded-lg flex items-center justify-center">
              <Video className="w-4 h-4 text-white" />
            </div>
            <span className="text-xl font-semibold text-gray-900">makeitvid</span>
          </div>
          <nav className="hidden md:flex items-center space-x-8">
            <a href="#features" className="text-gray-600 hover:text-gray-900 transition-colors font-medium">
              Features
            </a>
            <a href="#how-it-works" className="text-gray-600 hover:text-gray-900 transition-colors font-medium">
              How it Works
            </a>
            <a href="#open-source" className="text-gray-600 hover:text-gray-900 transition-colors font-medium">
              Open Source
            </a>
            {userId ? (
              <Link href="/dashboard">
                <Button size="sm" className="rounded-lg bg-purple-600 hover:bg-purple-700">
                  Dashboard
                </Button>
              </Link>
            ) : (
              <>
                <Link href="/sign-in">
                  <Button variant="outline" size="sm" className="rounded-lg border-gray-300">
                    Sign In
                  </Button>
                </Link>
                <Link href="/sign-up">
                  <Button size="sm" className="rounded-lg bg-purple-600 hover:bg-purple-700">
                    Sign Up
                  </Button>
                </Link>
              </>
            )}
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-6 py-20">
        <div className="max-w-4xl mx-auto text-center">
          <Badge className="mb-8 bg-purple-50 text-purple-700 hover:bg-purple-50 rounded-full px-4 py-2 border border-purple-200">
            <Star className="w-3 h-3 mr-1" />
            Open Source Alternative to NotebookLM
          </Badge>

          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
            Turn Documents Into <span className="text-purple-600">Video Overviews</span>
          </h1>

          <p className="text-xl text-gray-600 mb-10 max-w-2xl mx-auto leading-relaxed">
            makeitvid uses AI to automatically generate engaging video summaries from your documents, research papers,
            and sources. Make complex information digestible and shareable.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16">
            <Link href={userId ? "/dashboard" : "/sign-up"}>
              <Button size="lg" className="bg-gray-900 hover:bg-gray-800 rounded-lg px-8 py-3 text-lg font-medium">
                {userId ? "Go to Dashboard" : "Get Started Free"}
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
            <a href="https://github.com/product-squaads/makeitvid" target="_blank" rel="noopener noreferrer">
              <Button
                variant="outline"
                size="lg"
                className="rounded-lg px-8 py-3 text-lg font-medium border-gray-300 bg-transparent"
              >
                <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                  <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
                </svg>
                View on GitHub
              </Button>
            </a>
          </div>

          {/* Demo Video Placeholder */}
          <div className="relative max-w-4xl mx-auto">
            <div className="aspect-video bg-white rounded-2xl shadow-lg border border-gray-200 flex items-center justify-center">
              <div className="text-center">
                <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-4 mx-auto">
                  <Play className="w-8 h-8 text-gray-600" />
                </div>
                <p className="text-gray-700 font-medium">Demo Video Coming Soon</p>
                <p className="text-sm text-gray-500 mt-1">See makeitvid in action</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Everything you need to create video overviews</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Transform static documents into engaging video content with powerful AI-driven features
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card className="border border-gray-200 shadow-sm bg-white hover:shadow-md transition-all duration-200 rounded-2xl">
              <CardContent className="p-8">
                <div className="w-12 h-12 bg-pink-100 rounded-xl flex items-center justify-center mb-6">
                  <FileText className="w-6 h-6 text-pink-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">Multi-Format Support</h3>
                <p className="text-gray-600 leading-relaxed">
                  Upload PDFs, Word documents, research papers, and more. makeitvid intelligently processes any
                  text-based content.
                </p>
              </CardContent>
            </Card>

            <Card className="border border-gray-200 shadow-sm bg-white hover:shadow-md transition-all duration-200 rounded-2xl">
              <CardContent className="p-8">
                <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mb-6">
                  <Brain className="w-6 h-6 text-green-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">AI-Powered Analysis</h3>
                <p className="text-gray-600 leading-relaxed">
                  Advanced AI extracts key concepts, creates visual aids, and generates natural narration for your
                  content.
                </p>
              </CardContent>
            </Card>

            <Card className="border border-gray-200 shadow-sm bg-white hover:shadow-md transition-all duration-200 rounded-2xl">
              <CardContent className="p-8">
                <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mb-6">
                  <Video className="w-6 h-6 text-purple-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">Narrated Slides</h3>
                <p className="text-gray-600 leading-relaxed">
                  Generate professional video overviews with synchronized narration, visual aids, and key highlights.
                </p>
              </CardContent>
            </Card>

            <Card className="border border-gray-200 shadow-sm bg-white hover:shadow-md transition-all duration-200 rounded-2xl">
              <CardContent className="p-8">
                <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center mb-6">
                  <Zap className="w-6 h-6 text-yellow-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">Customizable Output</h3>
                <p className="text-gray-600 leading-relaxed">
                  Tailor videos for different audiences, languages, or focus areas. Perfect for education, research, and
                  business.
                </p>
              </CardContent>
            </Card>

            <Card className="border border-gray-200 shadow-sm bg-white hover:shadow-md transition-all duration-200 rounded-2xl">
              <CardContent className="p-8">
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mb-6">
                  <Users className="w-6 h-6 text-blue-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">Collaboration Ready</h3>
                <p className="text-gray-600 leading-relaxed">
                  Share projects with your team, create multiple versions, and collaborate on content creation
                  seamlessly.
                </p>
              </CardContent>
            </Card>

            <Card className="border border-gray-200 shadow-sm bg-white hover:shadow-md transition-all duration-200 rounded-2xl">
              <CardContent className="p-8">
                <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center mb-6">
                  <Download className="w-6 h-6 text-indigo-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">Export & Share</h3>
                <p className="text-gray-600 leading-relaxed">
                  Download your video overviews in multiple formats or share them directly with embedded players.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-20 bg-white">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">How makeitvid works</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Transform your documents into engaging videos in just three simple steps
            </p>
          </div>

          <div className="max-w-4xl mx-auto">
            <div className="grid md:grid-cols-3 gap-12">
              <div className="text-center">
                <div className="w-16 h-16 bg-pink-100 rounded-2xl flex items-center justify-center mx-auto mb-6 text-pink-600 text-2xl font-bold">
                  1
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">Upload Documents</h3>
                <p className="text-gray-600">
                  Upload your PDFs, research papers, or any text-based documents to get started.
                </p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center mx-auto mb-6 text-green-600 text-2xl font-bold">
                  2
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">AI Processing</h3>
                <p className="text-gray-600">
                  Our AI analyzes your content, extracts key insights, and creates visual elements automatically.
                </p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 bg-purple-100 rounded-2xl flex items-center justify-center mx-auto mb-6 text-purple-600 text-2xl font-bold">
                  3
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">Generate Video</h3>
                <p className="text-gray-600">
                  Get your professional video overview with narration, slides, and visual aids ready to share.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Open Source Section */}
      <section id="open-source" className="py-20 bg-gray-900 text-white">
        <div className="container mx-auto px-6 text-center">
          <div className="max-w-3xl mx-auto">
            <svg className="w-16 h-16 mx-auto mb-6 text-gray-400" fill="currentColor" viewBox="0 0 24 24">
              <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
            </svg>
            <h2 className="text-4xl font-bold mb-6">Built for the Community</h2>
            <p className="text-xl text-gray-300 mb-8 leading-relaxed">
              makeitvid is completely open source, giving you full control over your data and the ability to customize
              the platform for your specific needs. Join our growing community of contributors.
            </p>

            <div className="grid md:grid-cols-3 gap-8 mb-12">
              <div>
                <div className="text-3xl font-bold text-white mb-2">100%</div>
                <div className="text-gray-400">Open Source</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-white mb-2">MIT</div>
                <div className="text-gray-400">License</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-white mb-2">Self-Host</div>
                <div className="text-gray-400">Ready</div>
              </div>
            </div>

            <GitHubButtons />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-purple-600 text-white">
        <div className="container mx-auto px-6 text-center">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-4xl font-bold mb-6">Ready to transform your documents?</h2>
            <p className="text-xl mb-8 text-purple-100">
              Join thousands of researchers, educators, and content creators who are already using makeitvid to make
              their information more accessible and engaging.
            </p>
            <Link href={userId ? "/dashboard" : "/sign-up"}>
              <Button
                size="lg"
                className="bg-white text-purple-600 hover:bg-gray-100 rounded-lg px-8 py-3 text-lg font-semibold"
              >
                {userId ? "Go to Dashboard" : "Get Started Today"}
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 py-12">
        <div className="container mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-3 mb-4 md:mb-0">
              <div className="w-8 h-8 bg-gray-900 rounded-lg flex items-center justify-center">
                <Video className="w-4 h-4 text-white" />
              </div>
              <span className="text-xl font-semibold text-gray-900">makeitvid</span>
            </div>
            <div className="flex items-center space-x-8">
              <a href="#" className="text-gray-600 hover:text-gray-900 transition-colors">
                Privacy
              </a>
              <a href="#" className="text-gray-600 hover:text-gray-900 transition-colors">
                Terms
              </a>
              <a href="#" className="text-gray-600 hover:text-gray-900 transition-colors">
                GitHub
              </a>
              <a href="#" className="text-gray-600 hover:text-gray-900 transition-colors">
                Documentation
              </a>
            </div>
          </div>
          <div className="border-t border-gray-200 mt-8 pt-8 text-center text-gray-500">
            <p>&copy; 2025 makeitvid. Open source under MIT License.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
