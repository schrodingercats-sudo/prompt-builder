import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Blog — AI Prompt Engineering Tips & Guides',
  description:
    'Learn how to write better AI prompts with Promptimzer. Expert guides on prompt engineering for ChatGPT, Claude, Gemini and more.',
  keywords: [
    'prompt engineering blog',
    'ai prompt tips',
    'chatgpt prompt guide',
    'prompt writing tips',
    'ai prompt best practices',
  ],
  alternates: {
    canonical: 'https://promptimizer-pi.vercel.app/blog',
  },
};

const posts = [
  {
    slug: 'how-to-write-better-ai-prompts',
    title: 'How to Write Better AI Prompts: The Complete Guide',
    excerpt:
      'Master the art of prompt engineering with our step-by-step guide. Learn the techniques that top AI engineers use to get perfect outputs every time.',
    date: '2025-01-15',
    readTime: '8 min read',
    tags: ['Prompt Engineering', 'AI Tips', 'Beginner'],
  },
  {
    slug: 'prompt-engineering-guide',
    title: 'Prompt Engineering Guide for Developers (2025)',
    excerpt:
      'From zero-shot to chain-of-thought: a developer\'s field guide to every prompting technique that matters for building AI-driven applications.',
    date: '2025-01-10',
    readTime: '12 min read',
    tags: ['Developer Guide', 'Advanced', 'Techniques'],
  },
  {
    slug: 'chatgpt-prompt-tips',
    title: '15 ChatGPT Prompt Tips You Should Know',
    excerpt:
      'Unlock ChatGPT\'s full potential with these proven prompt strategies. Copy-paste templates included for coding, writing, and analysis.',
    date: '2025-01-05',
    readTime: '6 min read',
    tags: ['ChatGPT', 'Tips', 'Templates'],
  },
];

export default function BlogPage() {
  return (
    <main className="min-h-screen bg-white">
      <nav className="border-b border-gray-200 bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <img src="/favicon.png" alt="Promptimzer" className="h-8 w-8" />
            <span className="font-bold text-lg text-gray-800">Promptimzer</span>
          </Link>
          <Link
            href="/"
            className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
          >
            ← Back to App
          </Link>
        </div>
      </nav>

      <header className="max-w-5xl mx-auto px-6 py-16 text-center">
        <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 tracking-tight">
          The Promptimzer Blog
        </h1>
        <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto">
          Expert guides on prompt engineering, AI tips, and getting better results from ChatGPT, Claude, Gemini & every other LLM.
        </p>
      </header>

      <section className="max-w-5xl mx-auto px-6 pb-20">
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {posts.map((post) => (
            <article
              key={post.slug}
              className="group border border-gray-200 rounded-xl p-6 hover:border-gray-400 hover:shadow-lg transition-all duration-300"
            >
              <div className="flex flex-wrap gap-2 mb-4">
                {post.tags.map((tag) => (
                  <span
                    key={tag}
                    className="text-xs font-medium px-2.5 py-1 rounded-full bg-gray-100 text-gray-600"
                  >
                    {tag}
                  </span>
                ))}
              </div>
              <h2 className="text-xl font-bold text-gray-900 group-hover:text-violet-600 transition-colors">
                <Link href={`/blog/${post.slug}`}>{post.title}</Link>
              </h2>
              <p className="mt-3 text-gray-600 text-sm leading-relaxed">
                {post.excerpt}
              </p>
              <div className="mt-5 flex items-center text-xs text-gray-400 gap-3">
                <time dateTime={post.date}>
                  {new Date(post.date).toLocaleDateString('en-US', {
                    month: 'long',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                </time>
                <span>·</span>
                <span>{post.readTime}</span>
              </div>
            </article>
          ))}
        </div>
      </section>

      <footer className="border-t border-gray-200 py-8 text-center text-sm text-gray-500">
        <p>&copy; {new Date().getFullYear()} Promptimzer. All rights reserved.</p>
      </footer>
    </main>
  );
}
