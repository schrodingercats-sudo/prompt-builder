import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'How to Write Better AI Prompts: The Complete Guide (2025)',
  description:
    'Master AI prompt engineering with our step-by-step guide. Learn proven techniques to write better prompts for ChatGPT, Claude, Gemini and get perfect outputs every time.',
  keywords: [
    'how to write better ai prompts',
    'prompt engineering guide',
    'chatgpt prompt tips',
    'better ai prompts',
    'prompt writing guide',
  ],
  alternates: {
    canonical: 'https://promptimizer-pi.vercel.app/blog/how-to-write-better-ai-prompts',
  },
  openGraph: {
    title: 'How to Write Better AI Prompts — Complete Guide',
    description: 'Master the art of prompt engineering with proven techniques used by top AI engineers.',
    type: 'article',
    publishedTime: '2025-01-15T00:00:00.000Z',
  },
};

function JsonLd() {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: 'How to Write Better AI Prompts: The Complete Guide',
    description:
      'Master AI prompt engineering with our step-by-step guide.',
    author: { '@type': 'Organization', name: 'Promptimzer' },
    publisher: { '@type': 'Organization', name: 'Promptimzer' },
    datePublished: '2025-01-15',
    mainEntityOfPage: 'https://promptimizer-pi.vercel.app/blog/how-to-write-better-ai-prompts',
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

export default function BlogPost() {
  return (
    <>
      <JsonLd />
      <main className="min-h-screen bg-white">
        <nav className="border-b border-gray-200 bg-white/80 backdrop-blur-sm sticky top-0 z-50">
          <div className="max-w-3xl mx-auto px-6 py-4 flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2">
              <img src="/favicon.png" alt="Promptimzer" className="h-8 w-8" />
              <span className="font-bold text-lg text-gray-800">Promptimzer</span>
            </Link>
            <Link
              href="/blog"
              className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
            >
              ← All Posts
            </Link>
          </div>
        </nav>

        <article className="max-w-3xl mx-auto px-6 py-16 prose prose-gray prose-lg">
          <header className="not-prose mb-12">
            <div className="flex gap-2 mb-4">
              <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-violet-100 text-violet-700">Prompt Engineering</span>
              <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-gray-100 text-gray-600">Beginner</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 tracking-tight leading-tight">
              How to Write Better AI Prompts: The Complete Guide
            </h1>
            <div className="mt-4 flex items-center gap-3 text-sm text-gray-500">
              <time dateTime="2025-01-15">January 15, 2025</time>
              <span>·</span>
              <span>8 min read</span>
            </div>
          </header>

          <p>
            Writing effective prompts is the single most impactful skill for getting great outputs from AI models like ChatGPT, Claude, and Google Gemini. Whether you&apos;re a developer building AI-powered applications or a professional looking to save time, this guide will transform how you interact with AI.
          </p>

          <h2>Why Prompt Quality Matters</h2>
          <p>
            A well-crafted prompt can be the difference between a useless response and a production-ready output. Studies show that optimized prompts can improve AI output quality by up to <strong>40%</strong>. That&apos;s the gap between &quot;write me a function&quot; and a detailed specification that produces tested, documented code.
          </p>

          <h2>The 5 Pillars of Great Prompts</h2>

          <h3>1. Be Specific About the Task</h3>
          <p>
            Vague prompts produce vague results. Instead of &quot;make a website,&quot; try: &quot;Create a responsive landing page for a SaaS product with a hero section, three feature cards, and a pricing table using React and Tailwind CSS.&quot;
          </p>

          <h3>2. Provide Context</h3>
          <p>
            AI models don&apos;t know your project, your audience, or your constraints unless you tell them. Include relevant background, target audience, technical stack, and any constraints upfront.
          </p>

          <h3>3. Specify the Output Format</h3>
          <p>
            Tell the AI exactly what format you want: JSON, markdown, code with comments, a bullet-point list, or a structured essay. The more specific you are about format, the less post-processing you&apos;ll need.
          </p>

          <h3>4. Include Examples</h3>
          <p>
            Few-shot prompting — providing 1–3 examples of the desired output — is one of the most powerful techniques. It&apos;s especially effective for formatting, tone, and style consistency.
          </p>

          <h3>5. Iterate and Refine</h3>
          <p>
            The best prompts are rarely written in one shot. Use tools like <Link href="/" className="text-violet-600 hover:text-violet-800 font-semibold">Promptimzer</Link> to automatically analyze and improve your prompts, getting suggestions you might not have thought of.
          </p>

          <h2>Common Prompt Mistakes to Avoid</h2>
          <ul>
            <li><strong>Being too brief</strong> — A one-line prompt rarely produces quality output</li>
            <li><strong>Not specifying constraints</strong> — Length limits, language, libraries, etc.</li>
            <li><strong>Ignoring the model&apos;s strengths</strong> — Each model has different capabilities</li>
            <li><strong>Not testing variations</strong> — Small wording changes can dramatically change output</li>
          </ul>

          <h2>Try Promptimzer for Free</h2>
          <p>
            Ready to level up your prompts? <Link href="/" className="text-violet-600 hover:text-violet-800 font-semibold">Promptimzer</Link> automatically optimizes your prompts using AI, giving you better results from any model. It&apos;s free to start — no credit card required.
          </p>

          <div className="not-prose mt-12 p-8 bg-gray-50 rounded-xl text-center border border-gray-200">
            <h3 className="text-xl font-bold text-gray-900">Stop writing bad prompts.</h3>
            <p className="mt-2 text-gray-600">Let Promptimzer optimize them for you — free.</p>
            <Link
              href="/"
              className="mt-4 inline-block px-6 py-3 bg-gray-900 text-white font-semibold rounded-lg hover:bg-gray-800 transition-colors"
            >
              Try Promptimzer Free →
            </Link>
          </div>
        </article>

        <footer className="border-t border-gray-200 py-8 text-center text-sm text-gray-500">
          <p>&copy; {new Date().getFullYear()} Promptimzer. All rights reserved.</p>
        </footer>
      </main>
    </>
  );
}
