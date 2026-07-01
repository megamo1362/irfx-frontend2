'use client';

import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { LoginForm } from '@/components/auth/login-form';
import { useLang } from '@/app/i18n/LangContext';
import { LangToggle } from '@/app/i18n/LangToggle';

export default function LoginPage() {
  const { t, lang } = useLang();
  const isFa = lang === 'fa';

  return (
    <>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,500&family=Vazirmatn:wght@400;500;600&display=swap');`}</style>
      <motion.div
        className="w-full max-w-md"
        dir={isFa ? 'rtl' : 'ltr'}
        initial={{ opacity: 0, y: 20, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      >
        {/* Logo */}
        <div className="text-center mb-6">
          <motion.div
            className="flex justify-center mb-2"
            animate={{ filter: [
              'drop-shadow(0 0 12px rgba(0,212,255,0.4)) drop-shadow(0 0 24px rgba(124,58,237,0.2))',
              'drop-shadow(0 0 24px rgba(0,212,255,0.7)) drop-shadow(0 0 48px rgba(124,58,237,0.4))',
              'drop-shadow(0 0 12px rgba(0,212,255,0.4)) drop-shadow(0 0 24px rgba(124,58,237,0.2))',
            ]}}
            transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut' }}
          >
            <Image src="/logo-login-dark.png" alt="MINDLURA" width={260} height={260} className="object-contain w-36 sm:w-48 lg:w-64" priority />
          </motion.div>
        </div>

        {/* Heading */}
        <div className="mb-6" style={{ textAlign: isFa ? 'right' : 'left' }}>
          <p style={{ fontSize: '11px', letterSpacing: '0.1em', textTransform: 'uppercase', color: '#7C8296', marginBottom: '8px', fontFamily: "'Inter', sans-serif" }}>
            {isFa ? 'روانشناسی معاملات' : 'Trading Psychology'}
          </p>
          <h1 style={{ fontFamily: "'Fraunces', serif", fontSize: 'clamp(1.6rem, 4vw, 2rem)', fontWeight: 500, color: '#E9ECF3', lineHeight: 1.2, margin: 0 }}>
            {isFa ? '«خوش آمدید»' : 'Welcome back.'}
          </h1>
        </div>

        {/* Card */}
        <div className="glass-elevated rounded-2xl p-6 border border-[var(--color-border)]">
          <LoginForm />
        </div>

      {/* Switch to register */}
      <p className="text-center text-sm text-[var(--color-text-muted)] mt-5">
        {t.auth_no_account}{' '}
        <Link href="/register" className="text-[var(--color-primary)] hover:underline font-medium">
          {t.auth_register_tab}
        </Link>
      </p>

      {/* Footer */}
      <div className="flex items-center justify-between mt-6">
        <p className="text-xs text-[var(--color-text-muted)]">
          MINDLURA · AI Fintech Trading &amp; Psychology
        </p>
        <LangToggle />
      </div>
    </motion.div>
    </>
  );
}
