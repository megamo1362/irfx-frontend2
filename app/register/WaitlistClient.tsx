'use client';

import { useState } from 'react';
import Link from 'next/link';

const displayFont = "'Fraunces', serif";
const accent = '#8B7CF6';
const accentBlue = '#38BDF8';

type FormState = 'idle' | 'loading' | 'success' | 'error';

const FA = {
  badge: 'به زودی',
  heading: 'مایندلورا در حال توسعه نهایی است',
  sub: 'اولین نفری باش که دسترسی می‌گیری — Early Access کاملاً رایگانه',
  placeholder: 'آدرس ایمیل شما',
  button: 'ثبت در لیست انتظار',
  success: 'ثبت شدی. به زودی خبرت میکنیم.',
  back: '→ بازگشت به خانه',
};

const EN = {
  badge: 'Coming Soon',
  heading: 'Mindlura is in final development.',
  sub: 'Be the first to get access — Early Access is completely free.',
  placeholder: 'Your email address',
  button: 'Join the Waitlist',
  success: "You're in. We'll reach out when we're ready.",
  back: '← Back to Home',
};

export default function WaitlistClient({ faFirst }: { faFirst: boolean }) {
  const [lang, setLang] = useState<'fa' | 'en'>(faFirst ? 'fa' : 'en');
  const [email, setEmail] = useState('');
  const [state, setState] = useState<FormState>('idle');

  const isFa = lang === 'fa';
  const c = isFa ? FA : EN;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.includes('@') || !email.includes('.')) return;
    setState('loading');
    try {
      const res = await fetch('/api/waitlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, lang, timestamp: new Date().toISOString() }),
      });
      const data = await res.json();
      setState(data.success ? 'success' : 'error');
    } catch {
      setState('error');
    }
  }

  function switchLang() {
    setLang(isFa ? 'en' : 'fa');
    setState('idle');
  }

  return (
    <div
      dir={isFa ? 'rtl' : 'ltr'}
      style={{
        backgroundColor: '#0A0E17',
        color: '#E9ECF3',
        minHeight: '100vh',
        fontFamily: isFa ? "'Vazirmatn', sans-serif" : "'Inter', sans-serif",
      }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,400;0,9..144,500;0,9..144,600&family=Inter:wght@400;500;600&family=Vazirmatn:wght@400;500;600&display=swap');
        input::placeholder { color: #5A6178; }
        input:focus { border-color: ${accent} !important; }
      `}</style>

      <div style={{ maxWidth: '560px', margin: '0 auto', padding: '40px 24px 80px' }}>

        {/* Top bar: back link + lang toggle */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '56px' }}>
          <Link href="/" style={{ fontSize: '13px', color: '#5A6178', textDecoration: 'none' }}>
            {c.back}
          </Link>
          <button
            onClick={switchLang}
            style={{
              background: 'none',
              border: '1px solid #232332',
              borderRadius: '100px',
              padding: '4px 14px',
              fontSize: '12px',
              color: '#7C8296',
              cursor: 'pointer',
              fontFamily: isFa ? "'Inter', sans-serif" : "'Vazirmatn', sans-serif",
            }}
          >
            {isFa ? 'English' : 'فارسی'}
          </button>
        </div>

        {/* Badge */}
        <span
          style={{
            display: 'inline-block',
            fontSize: '11px',
            padding: '4px 14px',
            borderRadius: '100px',
            border: `1px solid ${accent}`,
            color: accent,
            marginBottom: '24px',
            letterSpacing: '0.06em',
            textTransform: 'uppercase',
          }}
        >
          {c.badge}
        </span>

        <h1
          style={{
            fontFamily: displayFont,
            fontSize: 'clamp(1.6rem, 4vw, 2.25rem)',
            fontWeight: 500,
            color: '#E9ECF3',
            lineHeight: 1.2,
            marginBottom: '14px',
          }}
        >
          {c.heading}
        </h1>

        <p style={{ color: '#7C8296', fontSize: '15px', lineHeight: 1.7, marginBottom: '40px', maxWidth: '440px' }}>
          {c.sub}
        </p>

        {state === 'success' ? (
          <p style={{ color: accentBlue, fontSize: '16px', fontStyle: 'italic' }}>{c.success}</p>
        ) : (
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxWidth: '380px' }}>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={c.placeholder}
              required
              style={{
                background: '#12121C',
                border: '1px solid #232332',
                borderRadius: '6px',
                padding: '12px 16px',
                color: '#E9ECF3',
                fontSize: '14px',
                outline: 'none',
                width: '100%',
                boxSizing: 'border-box',
                direction: isFa ? 'rtl' : 'ltr',
              }}
            />
            {state === 'error' && (
              <p style={{ color: '#f87171', fontSize: '13px', margin: 0 }}>
                {isFa ? 'خطا رخ داد. دوباره امتحان کن.' : 'Something went wrong. Please try again.'}
              </p>
            )}
            <button
              type="submit"
              disabled={state === 'loading'}
              style={{
                background: accent,
                color: '#0A0E17',
                border: 'none',
                borderRadius: '6px',
                padding: '12px 24px',
                fontSize: '14px',
                fontWeight: 600,
                cursor: state === 'loading' ? 'not-allowed' : 'pointer',
                opacity: state === 'loading' ? 0.7 : 1,
                boxShadow: '0 0 24px rgba(139,124,246,0.45)',
                transition: 'opacity 0.2s',
              }}
            >
              {state === 'loading' ? '...' : c.button}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
