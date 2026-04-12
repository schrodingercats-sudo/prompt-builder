import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: '15 ChatGPT Prompt Tips You Should Know in 2025',
  description:
    'Unlock ChatGPT\'s full potential with these proven prompt strategies. Copy-paste templates included for coding, writing, and analysis.',
  keywords: [
    'chatgpt prompt tips',
    'chatgpt tips and tricks',
    'best chatgpt prompts',
    'chatgpt prompt templates',
    'how to use chatgpt effectively',
  ],
  alternates: {
    canonical: 'https://promptimizer-pi.vercel.app/blog/chatgpt-prompt-tips',
  },
  openGraph: {
    title: '15 ChatGPT Prompt Tips You Should Know',
    description: 'Proven prompt strategies with copy-paste templates.',
    type: 'article',
    publishedTime: '2025-01-05T00:00:00.000Z',
  },
};

function JsonLd() {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: '15 ChatGPT Prompt Tips You Should Know in 2025',
    description: 'Proven prompt strategies with copy-paste templates.',
    author: { '@type': 'Organization', name: 'Promptimzer' },
    publisher: { '@type': 'Organization', name: 'Promptimzer' },
    datePublished: '2025-01-05',
    mainEntityOfPage: 'https://promptimizer-pi.vercel.app/blog/chatgpt-prompt-tips',
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

export default function BlogPost() {
  const tips = [
    { title: 'Be Specific About the Role', example: '"Act as a senior React developer reviewing code for performance issues" instead of "review this code"' },
    { title: 'Set the Output Format', example: '"Respond in JSON with keys: summary, actionItems, priority"' },
    { title: 'Use Delimiters for Input', example: 'Wrap your input in triple backticks or XML tags to separate instructions from content' },
    { title: 'Ask for Step-by-Step Reasoning', example: '"Think through this problem step by step before giving your answer"' },
    { title: 'Specify What NOT to Do', example: '"Do NOT include explanations. Only output the code." Negative constraints reduce noise.' },
    { title: 'Provide Examples (Few-Shot)', example: 'Show 2-3 examples of desired input→output pairs before your actual query' },
    { title: 'Set Length Constraints', example: '"Explain in 3 sentences" or "Write a 200-word summary" to control output verbosity' },
    { title: 'Use Temperature Wisely', example: 'Low temperature (0.1-0.3) for factual/code tasks, higher (0.7-0.9) for creative writing' },
    { title: 'Break Complex Tasks Into Steps', example: 'Instead of one huge prompt, chain multiple focused prompts together' },
    { title: 'Ask ChatGPT to Ask Questions', example: '"Before answering, ask me 3 clarifying questions about my requirements"' },
    { title: 'Use Markdown in Prompts', example: 'Structure your prompts with headers, bullet points, and code blocks for clarity' },
    { title: 'Request Self-Criticism', example: '"After generating your answer, list 3 potential issues or improvements"' },
    { title: 'Iterate Don\'t Restart', example: 'Build on previous responses: "Good, now make it more concise" rather than starting over' },
    { title: 'Use System-Level Instructions', example: 'Set persistent behavior with system messages: "Always respond in bullet points"' },
    { title: 'Automate with Promptimzer', example: 'Use tools like Promptimzer to automatically optimize your prompts using AI analysis' },
  ];

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

        <article className="max-w-3xl mx-auto px-6 py-16">
          <header className="mb-12">
            <div className="flex gap-2 mb-4">
              <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-green-100 text-green-700">ChatGPT</span>
              <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-gray-100 text-gray-600">Tips</span>
              <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-gray-100 text-gray-600">Templates</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 tracking-tight leading-tight">
              15 ChatGPT Prompt Tips You Should Know
            </h1>
            <div className="mt-4 flex items-center gap-3 text-sm text-gray-500">
              <time dateTime="2025-01-05">January 5, 2025</time>
              <span>·</span>
              <span>6 min read</span>
            </div>
          </header>

          <p className="text-lg text-gray-700 leading-relaxed mb-10">
            These 15 tips will immediately improve the quality of responses you get from ChatGPT.
            Each tip includes a practical example you can copy and adapt for your own use.
          </p>

          <ol className="space-y-8">
            {tips.map((tip, i) => (
              <li key={i} className="border border-gray-200 rounded-xl p-6 hover:border-gray-300 transition-colors">
                <h3 className="text-lg font-bold text-gray-900">
                  <span className="text-violet-600 mr-2">{i + 1}.</span>
                  {tip.title}
                </h3>
                <p className="mt-3 text-gray-600 text-sm leading-relaxed bg-gray-50 rounded-lg p-4 font-mono">
                  {tip.example}
                </p>
              </li>
            ))}
          </ol>

          <div className="mt-16 p-8 bg-gray-50 rounded-xl text-center border border-gray-200">
            <h3 className="text-xl font-bold text-gray-900">Skip the manual work.</h3>
            <p className="mt-2 text-gray-600">Promptimzer applies all these techniques automatically — paste your prompt, get an optimized version in seconds.</p>
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
