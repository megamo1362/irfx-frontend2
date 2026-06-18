'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, Lock, User, Key, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useRegister } from '@/hooks/use-auth-api';
import { ApiError } from '@/lib/api';
import { useLang } from '@/app/i18n/LangContext';

export function RegisterForm() {
  const [fields, setFields] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    full_name: '',
    invite_code: '',
  });
  const [validationError, setValidationError] = useState<string | null>(null);
  const { mutate: register, isPending, error } = useRegister();
  const { t } = useLang();

  const apiError = error instanceof ApiError ? error.message : error ? t.auth_register_error : null;
  const displayError = validationError ?? apiError;

  const set = (key: keyof typeof fields) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setFields((f) => ({ ...f, [key]: e.target.value }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);

    if (fields.password !== fields.confirmPassword) {
      setValidationError(t.auth_password_mismatch);
      return;
    }
    if (fields.password.length < 8) {
      setValidationError(t.auth_password_too_short);
      return;
    }

    register({
      email: fields.email,
      password: fields.password,
      full_name: fields.full_name || undefined,
      invite_code: fields.invite_code,
    });
  };

  return (
    <motion.form
      onSubmit={handleSubmit}
      className="space-y-4"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="space-y-2">
        <Label htmlFor="reg-name">{t.auth_name_optional}</Label>
        <Input
          id="reg-name"
          type="text"
          value={fields.full_name}
          onChange={set('full_name')}
          placeholder={t.auth_name_placeholder}
          iconLeft={<User className="h-4 w-4" />}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="reg-email">{t.email}</Label>
        <Input
          id="reg-email"
          type="email"
          value={fields.email}
          onChange={set('email')}
          placeholder="user@example.com"
          iconLeft={<Mail className="h-4 w-4" />}
          required
          dir="ltr"
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-2">
          <Label htmlFor="reg-password">{t.password}</Label>
          <Input
            id="reg-password"
            type="password"
            value={fields.password}
            onChange={set('password')}
            placeholder={t.password_min}
            iconLeft={<Lock className="h-4 w-4" />}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="reg-confirm">{t.auth_password_confirm}</Label>
          <Input
            id="reg-confirm"
            type="password"
            value={fields.confirmPassword}
            onChange={set('confirmPassword')}
            placeholder={t.auth_password_confirm_placeholder}
            iconLeft={<Lock className="h-4 w-4" />}
            required
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="reg-invite">{t.auth_invite_code}</Label>
        <Input
          id="reg-invite"
          type="text"
          value={fields.invite_code}
          onChange={set('invite_code')}
          placeholder={t.auth_invite_placeholder}
          iconLeft={<Key className="h-4 w-4" />}
          required
          dir="ltr"
        />
      </div>

      {displayError && (
        <motion.div
          className="flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm bg-[rgba(239,68,68,0.08)] border border-[rgba(239,68,68,0.2)] text-[var(--color-status-error)]"
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <AlertCircle className="h-4 w-4 flex-shrink-0" />
          <span>{displayError}</span>
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
        {t.auth_create_account}
      </Button>
    </motion.form>
  );
}
