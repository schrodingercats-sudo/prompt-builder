import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Prompt Engineering Guide for Developers (2025)',
  description:
    'From zero-shot to chain-of-thought: a developer\'s field guide to every prompting technique that matters for building AI-driven applications.',
  keywords: [
    'prompt engineering for developers',
    'prompt engineering techniques',
    'chain of thought prompting',
    'few shot prompting',
    'zero shot prompting',
    'ai prompt techniques',
  ],
  alternates: {
    canonical: 'https://promptimizer-pi.vercel.app/blog/prompt-engineering-guide',
  },
  openGraph: {
    title: 'Prompt Engineering Guide for Developers (2025)',
    description: 'A developer\'s field guide to every prompting technique that matters.',
    type: 'article',
    publishedTime: '2025-01-10T00:00:00.000Z',
  },
};

function JsonLd() {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: 'Prompt Engineering Guide for Developers (2025)',
    description: 'A developer\'s field guide to every prompting technique.',
    author: { '@type': 'Organization', name: 'Promptimzer' },
    publisher: { '@type': 'Organization', name: 'Promptimzer' },
    datePublished: '2025-01-10',
    mainEntityOfPage: 'https://promptimizer-pi.vercel.app/blog/prompt-engineering-guide',
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
            <Link href="/blog" className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors">← All Posts</Link>
          </div>
        </nav>

        <article className="max-w-3xl mx-auto px-6 py-16 prose prose-gray prose-lg">
          <header className="not-prose mb-12">
            <div className="flex gap-2 mb-4">
              <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-blue-100 text-blue-700">Developer Guide</span>
              <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-gray-100 text-gray-600">Advanced</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 tracking-tight leading-tight">
              Prompt Engineering Guide for Developers (2025)
            </h1>
            <div className="mt-4 flex items-center gap-3 text-sm text-gray-500">
              <time dateTime="2025-01-10">January 10, 2025</time>
              <span>·</span>
              <span>12 min read</span>
            </div>
          </header>

          <p>
            As AI models become integral to modern software development, <strong>prompt engineering</strong> has emerged as a critical skill. This guide covers every technique you need — from the basics to advanced strategies used in production applications.
          </p>

          <h2>What is Prompt Engineering?</h2>
          <p>
            Prompt engineering is the practice of designing and refining the text instructions (prompts) you give to large language models (LLMs) to produce desired outputs. It&apos;s the bridge between your intent and the model&apos;s capability.
          </p>

          <h2>Core Prompting Techniques</h2>

          <h3>Zero-Shot Prompting</h3>
          <p>
            The simplest approach — you give the model a task without any examples. Zero-shot works best for straightforward tasks where the instructions are unambiguous.
          </p>
          <pre><code>{`Classify the following text as positive, negative, or neutral:
"The product arrived on time and works perfectly."

→ Positive`}</code></pre>

          <h3>Few-Shot Prompting</h3>
          <p>
            Provide 2-5 examples of input-output pairs before your actual query. This dramatically improves consistency, especially for formatting, style, and domain-specific tasks.
          </p>
          <pre><code>{`Convert these sentences to formal tone:

Casual: "Hey, can you look at this bug?"
Formal: "Could you please review this defect?"

Casual: "This is broken, fix it ASAP"
Formal: "This component has a critical issue requiring immediate attention"

Casual: "Let's grab lunch and talk about the project"
Formal:`}</code></pre>

          <h3>Chain-of-Thought (CoT)</h3>
          <p>
            Ask the model to reason step-by-step before giving its final answer. CoT is essential for math, logic, and complex reasoning tasks where intermediate steps matter.
          </p>

          <h3>Role-Based Prompting</h3>
          <p>
            Assign the model a specific persona or role. This shapes tone, depth, and perspective. For example: &quot;You are a senior software architect reviewing code for security vulnerabilities.&quot;
          </p>

          <h2>Production Prompting Patterns</h2>

          <h3>Structured Output</h3>
          <p>
            Always specify the exact output format when building applications. Request JSON, YAML, or markdown with a schema to avoid parsing headaches.
          </p>

          <h3>Guardrails &amp; Validation</h3>
          <p>
            Add explicit constraints to prevent hallucinations and off-topic responses. Include statements like &quot;If you don&apos;t know the answer, say &apos;I don&apos;t know&apos;&quot; and &quot;Only use information from the provided context.&quot;
          </p>

          <h3>Prompt Chaining</h3>
          <p>
            Break complex tasks into multiple prompts where each step&apos;s output feeds into the next. This is more reliable than a single monolithic prompt.
          </p>

          <h2>Tools for Prompt Optimization</h2>
          <p>
            Manual prompt iteration is slow. Tools like <Link href="/" className="text-violet-600 hover:text-violet-800 font-semibold">Promptimzer</Link> use AI to automatically analyze, score, and improve your prompts — saving hours of trial-and-error testing.
          </p>

          <div className="not-prose mt-12 p-8 bg-gray-50 rounded-xl text-center border border-gray-200">
            <h3 className="text-xl font-bold text-gray-900">Let AI optimize your prompts.</h3>
            <p className="mt-2 text-gray-600">Stop guessing. Let Promptimzer auto-enhance your prompts for better results.</p>
            <Link href="/" className="mt-4 inline-block px-6 py-3 bg-gray-900 text-white font-semibold rounded-lg hover:bg-gray-800 transition-colors">
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
