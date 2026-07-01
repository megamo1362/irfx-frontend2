import Link from 'next/link';
import { getAllPosts } from '@/lib/blog';

const displayFont = "'Fraunces', serif";

export const metadata = {
  title: 'Blog | Mindlura',
  description: 'Trading psychology articles, behavioral analysis, and coach resources from Mindlura.',
};

export default async function BlogPage({
  searchParams,
}: {
  searchParams: Promise<{ lang?: string }>;
}) {
  const { lang: langParam } = await searchParams;
  const lang = langParam === 'fa' ? 'fa' : 'en';
  const isFa = lang === 'fa';

  const posts = getAllPosts().filter((p) => p.lang === lang);

  return (
    <div style={{ backgroundColor: '#0A0E17', color: '#E9ECF3', minHeight: '100vh', fontFamily: "'Inter', sans-serif" }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,400;0,9..144,500;0,9..144,600&family=Inter:wght@400;500;600&family=Vazirmatn:wght@400;500;600&display=swap');`}</style>

      <div style={{ maxWidth: '860px', margin: '0 auto', padding: '80px 24px' }} dir={isFa ? 'rtl' : 'ltr'}>

        {/* Header */}
        <div style={{ marginBottom: '16px' }}>
          <Link href="/" style={{ fontSize: '13px', color: '#5A6178', textDecoration: 'none' }}>← Mindlura</Link>
        </div>
        <h1 style={{ fontFamily: displayFont, fontWeight: 500, fontSize: '2rem', marginBottom: '8px' }}>
          {isFa ? 'بلاگ' : 'Journal'}
        </h1>
        <p style={{ color: '#7C8296', fontSize: '15px', marginBottom: '48px' }}>
          {isFa ? 'مقالات روان‌شناسی معاملاتی، تحلیل رفتاری، و منابع کوچ' : 'Trading psychology, behavioral analysis, and coach resources.'}
        </p>

        {/* Lang toggle */}
        <div style={{ display: 'flex', gap: '16px', marginBottom: '40px', fontSize: '13px' }}>
          <Link href="/blog" style={{ color: !isFa ? '#8B7CF6' : '#5A6178', borderBottom: !isFa ? '1px solid #8B7CF6' : 'none', paddingBottom: '2px', textDecoration: 'none' }}>English</Link>
          <Link href="/blog?lang=fa" style={{ color: isFa ? '#8B7CF6' : '#5A6178', borderBottom: isFa ? '1px solid #8B7CF6' : 'none', paddingBottom: '2px', textDecoration: 'none', fontFamily: "'Vazirmatn', sans-serif" }}>فارسی</Link>
        </div>

        {/* Divider */}
        <div style={{ height: '1px', backgroundColor: '#232332', marginBottom: '40px' }} />

        {/* Post list */}
        {posts.length === 0 ? (
          <p style={{ color: '#5A6178', fontSize: '15px' }}>
            {isFa ? 'هنوز پستی منتشر نشده.' : 'No posts published yet.'}
          </p>
        ) : (
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '40px' }}>
            {posts.map((post) => (
              <li key={post.slug}>
                <div style={{ fontSize: '11px', color: '#8B7CF6', textTransform: 'uppercase', letterSpacing: '0.08em', fontFamily: "'JetBrains Mono', monospace", marginBottom: '8px' }}>
                  {post.category}
                </div>
                <Link href={`/blog/${post.slug}`} style={{ textDecoration: 'none' }}>
                  <h2 style={{ fontFamily: displayFont, fontWeight: 500, fontSize: '1.25rem', color: '#E9ECF3', marginBottom: '8px', lineHeight: 1.3 }}>
                    {post.title}
                  </h2>
                </Link>
                <p style={{ color: '#7C8296', fontSize: '14px', lineHeight: 1.6, marginBottom: '12px' }}>
                  {post.description}
                </p>
                <div style={{ display: 'flex', gap: '16px', fontSize: '12px', color: '#5A6178' }}>
                  <span>{post.date}</span>
                  <span>·</span>
                  <span>{post.readingTime}</span>
                </div>
                <div style={{ height: '1px', backgroundColor: '#232332', marginTop: '40px' }} />
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
