'use client';

import Image from 'next/image';
import { motion } from 'framer-motion';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { LoginForm } from '@/components/auth/login-form';
import { RegisterForm } from '@/components/auth/register-form';
import { useLang } from '@/app/i18n/LangContext';

export default function LoginPage() {
  const { t } = useLang();

  return (
    <motion.div
      className="w-full max-w-md"
      initial={{ opacity: 0, y: 20, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
    >
      {/* Logo */}
      <div className="text-center mb-8">
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
        <p className="text-sm text-[var(--color-text-muted)] mt-1">
          AI Fintech Trading & Psychology
        </p>
      </div>

      {/* Card */}
      <div className="glass-elevated rounded-2xl p-6 border border-[var(--color-border)]">
        <Tabs defaultValue="login">
          <TabsList variant="pills" className="w-full mb-6">
            <TabsTrigger value="login" className="flex-1">{t.auth_login_tab}</TabsTrigger>
            <TabsTrigger value="register" className="flex-1">{t.auth_register_tab}</TabsTrigger>
          </TabsList>

          <TabsContent value="login">
            <LoginForm />
          </TabsContent>

          <TabsContent value="register">
            <RegisterForm />
          </TabsContent>
        </Tabs>
      </div>

      {/* Footer */}
      <p className="text-center text-xs text-[var(--color-text-muted)] mt-6">
        MINDLURA · AI Fintech Trading & Psychology
      </p>
    </motion.div>
  );
}
