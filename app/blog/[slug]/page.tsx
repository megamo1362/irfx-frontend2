import Link from 'next/link';
import { MDXRemote } from 'next-mdx-remote/rsc';
import { getAllPosts, getPostBySlug } from '@/lib/blog';
import type { Metadata } from 'next';

const displayFont = "'Fraunces', serif";
const accent = '#8B7CF6';

const mdxComponents = {
  h1: ({ children }: { children: React.ReactNode }) => (
    <h1 style={{ fontFamily: displayFont, fontSize: '1.75rem', fontWeight: 500, color: '#E9ECF3', margin: '2rem 0 1rem' }}>{children}</h1>
  ),
  h2: ({ children }: { children: React.ReactNode }) => (
    <h2 style={{ fontFamily: displayFont, fontSize: '1.35rem', fontWeight: 500, color: '#E9ECF3', margin: '2rem 0 0.75rem' }}>{children}</h2>
  ),
  h3: ({ children }: { children: React.ReactNode }) => (
    <h3 style={{ fontFamily: displayFont, fontSize: '1.1rem', fontWeight: 500, color: '#E9ECF3', margin: '1.5rem 0 0.5rem' }}>{children}</h3>
  ),
  p: ({ children }: { children: React.ReactNode }) => (
    <p style={{ color: '#C7CBE0', lineHeight: 1.8, marginBottom: '1rem', fontSize: '15px' }}>{children}</p>
  ),
  ul: ({ children }: { children: React.ReactNode }) => (
    <ul style={{ color: '#C7CBE0', paddingLeft: '1.5rem', marginBottom: '1rem', lineHeight: 1.8 }}>{children}</ul>
  ),
  ol: ({ children }: { children: React.ReactNode }) => (
    <ol style={{ color: '#C7CBE0', paddingLeft: '1.5rem', marginBottom: '1rem', lineHeight: 1.8 }}>{children}</ol>
  ),
  li: ({ children }: { children: React.ReactNode }) => (
    <li style={{ marginBottom: '0.4rem', fontSize: '15px' }}>{children}</li>
  ),
  strong: ({ children }: { children: React.ReactNode }) => (
    <strong style={{ color: '#E9ECF3', fontWeight: 600 }}>{children}</strong>
  ),
  em: ({ children }: { children: React.ReactNode }) => (
    <em style={{ color: '#C7CBE0', fontStyle: 'italic' }}>{children}</em>
  ),
  a: ({ href, children }: { href?: string; children: React.ReactNode }) => (
    <a href={href} style={{ color: accent, textDecoration: 'underline' }}>{children}</a>
  ),
  blockquote: ({ children }: { children: React.ReactNode }) => (
    <blockquote style={{ borderLeft: `3px solid ${accent}`, paddingLeft: '1rem', color: '#7C8296', margin: '1.5rem 0', fontStyle: 'italic' }}>{children}</blockquote>
  ),
  code: ({ children }: { children: React.ReactNode }) => (
    <code style={{ fontFamily: "'JetBrains Mono', monospace", background: '#12121C', padding: '0.15rem 0.4rem', borderRadius: '4px', color: '#38BDF8', fontSize: '0.85em' }}>{children}</code>
  ),
  pre: ({ children }: { children: React.ReactNode }) => (
    <pre style={{ background: '#12121C', border: '1px solid #232332', padding: '1rem', borderRadius: '8px', overflow: 'auto', marginBottom: '1.25rem' }}>{children}</pre>
  ),
  hr: () => <div style={{ height: '1px', backgroundColor: '#232332', margin: '2rem 0' }} />,
};

export async function generateStaticParams() {
  return getAllPosts().map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  return {
    title: `${post.title} | Mindlura Blog`,
    description: post.description,
  };
}

export default async function PostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  const isFa = post.lang === 'fa';

  return (
    <div style={{ backgroundColor: '#0A0E17', color: '#E9ECF3', minHeight: '100vh', fontFamily: isFa ? "'Vazirmatn', sans-serif" : "'Inter', sans-serif" }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,400;0,9..144,500;0,9..144,600&family=Inter:wght@400;500;600&family=Vazirmatn:wght@400;500;600&family=JetBrains+Mono:wght@500&display=swap');`}</style>

      <div style={{ maxWidth: '720px', margin: '0 auto', padding: '80px 24px' }} dir={isFa ? 'rtl' : 'ltr'}>

        {/* Back link */}
        <div style={{ marginBottom: '40px' }}>
          <Link href="/blog" style={{ fontSize: '13px', color: '#5A6178', textDecoration: 'none' }}>
            {isFa ? '← بلاگ' : '← Blog'}
          </Link>
        </div>

        {/* Category */}
        <div style={{ fontSize: '11px', color: accent, textTransform: 'uppercase', letterSpacing: '0.08em', fontFamily: "'JetBrains Mono', monospace", marginBottom: '16px' }}>
          {post.category}
        </div>

        {/* Title */}
        <h1 style={{ fontFamily: displayFont, fontWeight: 500, fontSize: 'clamp(1.5rem, 4vw, 2.25rem)', lineHeight: 1.2, marginBottom: '20px', color: '#E9ECF3' }}>
          {post.title}
        </h1>

        {/* Meta */}
        <div style={{ display: 'flex', gap: '16px', fontSize: '13px', color: '#5A6178', marginBottom: '48px' }}>
          <span>{post.date}</span>
          <span>·</span>
          <span>{post.readingTime}</span>
        </div>

        <div style={{ height: '1px', backgroundColor: '#232332', marginBottom: '48px' }} />

        {/* MDX content */}
        <article>
          <MDXRemote source={post.content} components={mdxComponents as never} />
        </article>

        <div style={{ height: '1px', backgroundColor: '#232332', margin: '64px 0 48px' }} />

        {/* CTA banner */}
        <div style={{ background: '#12121C', border: '1px solid #232332', borderRadius: '12px', padding: '32px', textAlign: 'center' }}>
          <p style={{ fontFamily: displayFont, fontSize: '1.1rem', color: '#E9ECF3', marginBottom: '20px', lineHeight: 1.4 }}>
            {isFa
              ? 'روان‌شناسی معاملاتی‌تان را با مایندلورا رصد کنید'
              : 'Track your trading psychology with Mindlura'}
          </p>
          <Link
            href="/register"
            style={{ display: 'inline-block', backgroundColor: accent, color: '#0A0E17', padding: '10px 28px', borderRadius: '4px', fontSize: '14px', textDecoration: 'none', fontWeight: 500 }}
          >
            {isFa ? 'شروع دوره آزمایشی' : 'Start Free Trial'}
          </Link>
        </div>

      </div>
    </div>
  );
}
