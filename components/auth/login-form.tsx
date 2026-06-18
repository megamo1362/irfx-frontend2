'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, Lock, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useLogin } from '@/hooks/use-auth-api';
import { ApiError } from '@/lib/api';
import { useLang } from '@/app/i18n/LangContext';

export function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { mutate: login, isPending, error } = useLogin();
  const { t } = useLang();

  const errorMessage = error instanceof ApiError ? error.message : error ? t.auth_login_error : null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    login({ email, password });
  };

  return (
    <motion.form
      onSubmit={handleSubmit}
      className="space-y-5"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="space-y-2">
        <Label htmlFor="login-email">{t.email}</Label>
        <Input
          id="login-email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="user@example.com"
          iconLeft={<Mail className="h-4 w-4" />}
          required
          autoComplete="email"
          inputSize="lg"
          dir="ltr"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="login-password">{t.password}</Label>
        <Input
          id="login-password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder={t.password}
          iconLeft={<Lock className="h-4 w-4" />}
          required
          autoComplete="current-password"
          inputSize="lg"
        />
      </div>

      {errorMessage && (
        <motion.div
          className="flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm bg-[rgba(239,68,68,0.08)] border border-[rgba(239,68,68,0.2)] text-[var(--color-status-error)]"
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <AlertCircle className="h-4 w-4 flex-shrink-0" />
          <span>{errorMessage}</span>
        </motion.div>
      )}

      <Button
        type="submit"
        variant="primary"
        size="lg"
        className="w-full"
        loading={isPending}
        disabled={isPending}
      >
        {t.auth_login_btn}
      </Button>
    </motion.form>
  );
}
