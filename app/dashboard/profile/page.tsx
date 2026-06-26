'use client';

import { useEffect, useState } from 'react';
import { UserCircle, Mail, Phone, Send, CheckCircle2, XCircle, ChevronDown, ChevronUp, ExternalLink } from 'lucide-react';
import { apiFetch, ApiError } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge, PlanBadge } from '@/components/ui/badge';
import { OtpInput } from '@/components/ui/otp-input';
import { useLang } from '@/app/i18n/LangContext';
import { useCountdown } from '@/hooks/useCountdown';

interface ProfileData {
  id: number;
  name: string | null;
  email: string;
  phone: string | null;
  role: string;
  plan: string | null;
  plan_slug: string | null;
  created_at: string;
  is_email_verified: boolean;
  is_phone_verified: boolean;
  is_telegram_verified: boolean;
  telegram_id: string | null;
  telegram_username: string | null;
}

const TELEGRAM_BOT_USERNAME = 'MINDLURA_BOT';

function formatDate(dateStr: string, lang: string): string {
  try {
    const d = new Date(dateStr);
    return d.toLocaleDateString(lang === 'fa' ? 'fa-IR' : 'en-GB', {
      year: 'numeric', month: 'long', day: 'numeric',
    });
  } catch {
    return dateStr;
  }
}

export default function ProfilePage() {
  const { t, lang } = useLang();

  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);

  // Personal info
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [saving, setSaving] = useState(false);
  const [savedMsg, setSavedMsg] = useState(false);

  // Email OTP
  const [emailOtpVisible, setEmailOtpVisible] = useState(false);
  const [emailSending, setEmailSending] = useState(false);
  const [emailVerifying, setEmailVerifying] = useState(false);
  const [emailOtpError, setEmailOtpError] = useState('');
  const [emailOtpSentMsg, setEmailOtpSentMsg] = useState(false);
  const emailCountdown = useCountdown(60);

  // Phone OTP
  const [phoneOtpVisible, setPhoneOtpVisible] = useState(false);
  const [phoneSending, setPhoneSending] = useState(false);
  const [phoneVerifying, setPhoneVerifying] = useState(false);
  const [phoneOtpError, setPhoneOtpError] = useState('');
  const [phoneOtpSentMsg, setPhoneOtpSentMsg] = useState(false);
  const phoneCountdown = useCountdown(60);

  // Telegram
  const [telegramId, setTelegramId] = useState('');
  const [telegramHowOpen, setTelegramHowOpen] = useState(false);
  const [telegramSending, setTelegramSending] = useState(false);
  const [telegramVerifying, setTelegramVerifying] = useState(false);
  const [telegramOtpVisible, setTelegramOtpVisible] = useState(false);
  const [telegramBotError, setTelegramBotError] = useState(false);
  const [telegramOtpError, setTelegramOtpError] = useState('');
  const [telegramOtpSentMsg, setTelegramOtpSentMsg] = useState(false);

  useEffect(() => {
    apiFetch<ProfileData>('/profile/me')
      .then(data => {
        setProfile(data);
        setName(data.name ?? '');
        setPhone(data.phone ?? '');
        setTelegramId(data.telegram_id ?? data.telegram_username ?? '');
      })
      .finally(() => setLoading(false));
  }, []);

  // ── Save personal info ──────────────────────────────────
  const handleSave = async () => {
    setSaving(true);
    setSavedMsg(false);
    try {
      await apiFetch('/profile/update', { method: 'PUT', body: { name, phone: phone || null } });
      setSavedMsg(true);
      setProfile(prev => prev ? { ...prev, name, phone: phone || null, is_phone_verified: phone !== (prev.phone ?? '') ? false : prev.is_phone_verified } : prev);
      setTimeout(() => setSavedMsg(false), 3000);
    } catch {
      // ignore, user can retry
    } finally {
      setSaving(false);
    }
  };

  // ── Email OTP ───────────────────────────────────────────
  const sendEmailOtp = async () => {
    setEmailSending(true);
    setEmailOtpError('');
    setEmailOtpSentMsg(false);
    try {
      await apiFetch('/profile/email/send-otp', { method: 'POST' });
      setEmailOtpVisible(true);
      setEmailOtpSentMsg(true);
      emailCountdown.start();
    } catch {
      setEmailOtpError(t.profile_otp_error);
    } finally {
      setEmailSending(false);
    }
  };

  const verifyEmailOtp = async (otp: string) => {
    setEmailVerifying(true);
    setEmailOtpError('');
    try {
      await apiFetch('/profile/email/verify', { method: 'POST', body: { otp } });
      setProfile(prev => prev ? { ...prev, is_email_verified: true } : prev);
      setEmailOtpVisible(false);
      setEmailOtpSentMsg(false);
    } catch (err) {
      setEmailOtpError(err instanceof ApiError && err.status === 400 ? t.profile_otp_invalid : t.profile_otp_error);
    } finally {
      setEmailVerifying(false);
    }
  };

  // ── Phone OTP ───────────────────────────────────────────
  const sendPhoneOtp = async () => {
    setPhoneSending(true);
    setPhoneOtpError('');
    setPhoneOtpSentMsg(false);
    try {
      await apiFetch('/profile/phone/send-otp', { method: 'POST', body: { phone } });
      setPhoneOtpVisible(true);
      setPhoneOtpSentMsg(true);
      phoneCountdown.start();
    } catch {
      setPhoneOtpError(t.profile_otp_error);
    } finally {
      setPhoneSending(false);
    }
  };

  const verifyPhoneOtp = async (otp: string) => {
    setPhoneVerifying(true);
    setPhoneOtpError('');
    try {
      await apiFetch('/profile/phone/verify', { method: 'POST', body: { otp } });
      setProfile(prev => prev ? { ...prev, is_phone_verified: true } : prev);
      setPhoneOtpVisible(false);
      setPhoneOtpSentMsg(false);
    } catch (err) {
      setPhoneOtpError(err instanceof ApiError && err.status === 400 ? t.profile_otp_invalid : t.profile_otp_error);
    } finally {
      setPhoneVerifying(false);
    }
  };

  // ── Telegram OTP ────────────────────────────────────────
  const sendTelegramOtp = async () => {
    setTelegramSending(true);
    setTelegramOtpError('');
    setTelegramBotError(false);
    setTelegramOtpSentMsg(false);
    try {
      await apiFetch('/profile/telegram/send-otp', { method: 'POST', body: { telegram_id: telegramId } });
      setTelegramOtpVisible(true);
      setTelegramOtpSentMsg(true);
    } catch {
      setTelegramBotError(true);
    } finally {
      setTelegramSending(false);
    }
  };

  const verifyTelegramOtp = async (otp: string) => {
    setTelegramVerifying(true);
    setTelegramOtpError('');
    try {
      await apiFetch('/profile/telegram/verify', { method: 'POST', body: { otp } });
      setProfile(prev => prev ? { ...prev, is_telegram_verified: true, telegram_id: telegramId } : prev);
      setTelegramOtpVisible(false);
      setTelegramOtpSentMsg(false);
    } catch (err) {
      setTelegramOtpError(err instanceof ApiError && err.status === 400 ? t.profile_otp_invalid : t.profile_otp_error);
    } finally {
      setTelegramVerifying(false);
    }
  };

  const disconnectTelegram = async () => {
    try {
      await apiFetch('/profile/update', { method: 'PUT', body: { telegram_username: '' } });
      setProfile(prev => prev ? { ...prev, is_telegram_verified: false, telegram_id: null, telegram_username: null } : prev);
      setTelegramId('');
      setTelegramOtpVisible(false);
    } catch {
      // ignore
    }
  };

  if (loading) {
    return (
      <div className="max-w-lg space-y-4">
        {[...Array(3)].map((_, i) => <div key={i} className="skeleton h-48 rounded-2xl" />)}
      </div>
    );
  }

  const roleLabels: Record<string, string> = {
    admin: t.role_admin,
    coach: t.role_coach,
    client: t.role_client_full,
  };

  return (
    <div className="max-w-lg space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[var(--color-text-primary)]">{t.profile_title}</h1>
      </div>

      {/* ── Card 1: Personal Information ─────────────────── */}
      <section className="glass rounded-2xl p-5 border border-[var(--color-border)] space-y-5">
        <div className="flex items-center gap-2">
          <UserCircle className="w-4 h-4 text-[var(--color-cyan)]" />
          <h2 className="text-sm font-semibold text-[var(--color-text-primary)] uppercase tracking-wider">
            {t.profile_personal_info}
          </h2>
        </div>

        {/* Full Name */}
        <Input
          label={t.profile_name}
          value={name}
          onChange={e => setName(e.target.value)}
        />

        {/* Email + verification */}
        <div className="space-y-2">
          <Input
            label={t.profile_email}
            value={profile?.email ?? ''}
            readOnly
            className="opacity-60 cursor-not-allowed"
          />

          {/* Email verification status */}
          <div className="flex items-center gap-2 flex-wrap">
            {profile?.is_email_verified ? (
              <Badge variant="green" dot>
                <CheckCircle2 className="w-3 h-3" />
                {t.profile_email_verified}
              </Badge>
            ) : (
              <>
                <Badge variant="yellow" dot>
                  <XCircle className="w-3 h-3" />
                  {t.profile_email_not_verified}
                </Badge>

                {!emailOtpVisible && (
                  <Button
                    variant="outline"
                    size="sm"
                    loading={emailSending}
                    onClick={sendEmailOtp}
                  >
                    <Mail className="w-3.5 h-3.5" />
                    {t.profile_email_send_otp}
                  </Button>
                )}
              </>
            )}
          </div>

          {/* Email OTP input */}
          {emailOtpVisible && !profile?.is_email_verified && (
            <div className="rounded-xl border border-[var(--color-border)] bg-[rgba(0,212,255,0.04)] p-4 space-y-3">
              {emailOtpSentMsg && (
                <p className="text-xs text-[var(--color-cyan)]">{t.profile_email_otp_sent}</p>
              )}
              <OtpInput
                onComplete={verifyEmailOtp}
                disabled={emailVerifying}
                error={!!emailOtpError}
              />
              {emailOtpError && (
                <p className="text-xs text-[var(--color-danger)] text-center">{emailOtpError}</p>
              )}
              <div className="flex justify-center">
                {emailCountdown.isActive ? (
                  <span className="text-xs text-[var(--color-text-muted)]">
                    {lang === 'fa' ? `ارسال مجدد در ${emailCountdown.seconds} ثانیه` : `Resend in ${emailCountdown.seconds}s`}
                  </span>
                ) : (
                  <Button variant="ghost" size="sm" loading={emailSending} onClick={sendEmailOtp}>
                    {t.profile_email_resend_otp}
                  </Button>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Phone + verification */}
        <div className="space-y-2">
          <Input
            label={t.profile_phone}
            value={phone}
            onChange={e => setPhone(e.target.value)}
            placeholder={t.profile_phone_placeholder}
          />

          <div className="flex items-center gap-2 flex-wrap">
            {profile?.is_phone_verified ? (
              <Badge variant="green" dot>
                <CheckCircle2 className="w-3 h-3" />
                {t.profile_phone_verified}
              </Badge>
            ) : (
              <>
                <Badge variant="yellow" dot>
                  <XCircle className="w-3 h-3" />
                  {t.profile_phone_not_verified}
                </Badge>

                {!phoneOtpVisible && phone && (
                  <Button
                    variant="outline"
                    size="sm"
                    loading={phoneSending}
                    onClick={sendPhoneOtp}
                  >
                    <Phone className="w-3.5 h-3.5" />
                    {t.profile_phone_send_otp}
                  </Button>
                )}
              </>
            )}
          </div>

          {/* Phone OTP input */}
          {phoneOtpVisible && !profile?.is_phone_verified && (
            <div className="rounded-xl border border-[var(--color-border)] bg-[rgba(0,212,255,0.04)] p-4 space-y-3">
              {phoneOtpSentMsg && (
                <p className="text-xs text-[var(--color-cyan)]">{t.profile_phone_otp_sent}</p>
              )}
              <p className="text-xs text-[var(--color-text-muted)] text-center">{t.profile_phone_sms_soon}</p>
              <OtpInput
                onComplete={verifyPhoneOtp}
                disabled={phoneVerifying}
                error={!!phoneOtpError}
              />
              {phoneOtpError && (
                <p className="text-xs text-[var(--color-danger)] text-center">{phoneOtpError}</p>
              )}
              <div className="flex justify-center">
                {phoneCountdown.isActive ? (
                  <span className="text-xs text-[var(--color-text-muted)]">
                    {lang === 'fa' ? `ارسال مجدد در ${phoneCountdown.seconds} ثانیه` : `Resend in ${phoneCountdown.seconds}s`}
                  </span>
                ) : (
                  <Button variant="ghost" size="sm" loading={phoneSending} onClick={sendPhoneOtp}>
                    {t.profile_phone_resend_otp}
                  </Button>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Save button */}
        <div className="flex items-center gap-3 pt-1">
          <Button variant="primary" size="md" loading={saving} onClick={handleSave}>
            {t.profile_save}
          </Button>
          {savedMsg && (
            <span className="text-xs text-[var(--color-success)] flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              {t.profile_saved}
            </span>
          )}
        </div>
      </section>

      {/* ── Card 2: Telegram ─────────────────────────────── */}
      <section className="glass rounded-2xl p-5 border border-[var(--color-border)] space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Send className="w-4 h-4 text-[var(--color-cyan)]" />
            <h2 className="text-sm font-semibold text-[var(--color-text-primary)] uppercase tracking-wider">
              {t.profile_telegram_title}
            </h2>
          </div>
          {profile?.is_telegram_verified ? (
            <Badge variant="green" dot>
              <CheckCircle2 className="w-3 h-3" />
              {t.profile_telegram_verified}
            </Badge>
          ) : (
            <Badge variant="gray" dot>
              {t.profile_telegram_not_verified}
            </Badge>
          )}
        </div>

        <p className="text-xs text-[var(--color-text-muted)]">{t.profile_telegram_desc}</p>

        {profile?.is_telegram_verified ? (
          /* Connected state */
          <div className="space-y-3">
            <div className="rounded-xl bg-[rgba(34,197,94,0.06)] border border-[rgba(34,197,94,0.2)] px-4 py-3">
              <p className="text-sm text-[var(--color-text-primary)] font-mono">
                {profile.telegram_id || profile.telegram_username}
              </p>
            </div>
            <Button variant="danger" size="sm" onClick={disconnectTelegram}>
              {t.profile_telegram_disconnect}
            </Button>
          </div>
        ) : (
          /* Not connected state */
          <div className="space-y-3">
            <Input
              label={t.profile_telegram_id_label}
              value={telegramId}
              onChange={e => {
                setTelegramId(e.target.value);
                setTelegramBotError(false);
                setTelegramOtpVisible(false);
              }}
              placeholder={t.profile_telegram_id_placeholder}
            />

            {/* Collapsible help */}
            <button
              type="button"
              onClick={() => setTelegramHowOpen(v => !v)}
              className="flex items-center gap-1.5 text-xs text-[var(--color-cyan)] hover:underline"
            >
              {telegramHowOpen ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
              {t.profile_telegram_how}
            </button>
            {telegramHowOpen && (
              <div className="rounded-xl bg-[rgba(0,212,255,0.04)] border border-[var(--color-border)] px-4 py-3 space-y-2">
                <p className="text-xs text-[var(--color-text-muted)]">{t.profile_telegram_how_desc}</p>
                <a
                  href="https://t.me/userinfobot"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-xs text-[var(--color-cyan)] hover:underline"
                >
                  @userinfobot <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            )}

            {/* Bot error warning */}
            {telegramBotError && (
              <div className="rounded-xl bg-[rgba(245,158,11,0.08)] border border-[rgba(245,158,11,0.25)] px-4 py-3 flex items-center justify-between gap-3">
                <p className="text-xs text-[var(--color-warning)]">{t.profile_telegram_bot_error}</p>
                <a
                  href={`https://t.me/${TELEGRAM_BOT_USERNAME}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-xs font-semibold text-[var(--color-cyan)] hover:underline flex-shrink-0"
                >
                  {t.profile_telegram_bot_link} <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            )}

            <Button
              variant="outline"
              size="sm"
              loading={telegramSending}
              disabled={!telegramId.trim()}
              onClick={sendTelegramOtp}
            >
              <Send className="w-3.5 h-3.5" />
              {t.profile_telegram_send_otp}
            </Button>

            {/* Telegram OTP input */}
            {telegramOtpVisible && (
              <div className="rounded-xl border border-[var(--color-border)] bg-[rgba(0,212,255,0.04)] p-4 space-y-3">
                {telegramOtpSentMsg && (
                  <p className="text-xs text-[var(--color-cyan)] text-center">{t.profile_telegram_otp_sent}</p>
                )}
                <OtpInput
                  onComplete={verifyTelegramOtp}
                  disabled={telegramVerifying}
                  error={!!telegramOtpError}
                />
                {telegramOtpError && (
                  <p className="text-xs text-[var(--color-danger)] text-center">{telegramOtpError}</p>
                )}
              </div>
            )}
          </div>
        )}
      </section>

      {/* ── Card 3: Account Information ──────────────────── */}
      <section className="glass rounded-2xl p-5 border border-[var(--color-border)] space-y-4">
        <h2 className="text-sm font-semibold text-[var(--color-text-primary)] uppercase tracking-wider">
          {t.profile_account_info}
        </h2>

        <div className="grid grid-cols-1 gap-3">
          <div className="flex items-center justify-between py-2 border-b border-[var(--color-border)]">
            <span className="text-xs text-[var(--color-text-muted)]">{t.profile_role}</span>
            <Badge variant="outline">{roleLabels[profile?.role ?? 'client'] ?? profile?.role}</Badge>
          </div>

          <div className="flex items-center justify-between py-2 border-b border-[var(--color-border)]">
            <span className="text-xs text-[var(--color-text-muted)]">{t.profile_plan}</span>
            {profile?.plan_slug ? (
              <PlanBadge slug={profile.plan_slug} />
            ) : (
              <span className="text-xs text-[var(--color-text-muted)]">—</span>
            )}
          </div>

          <div className="flex items-center justify-between py-2">
            <span className="text-xs text-[var(--color-text-muted)]">{t.profile_member_since}</span>
            <span className="text-xs text-[var(--color-text-secondary)]">
              {profile?.created_at ? formatDate(profile.created_at, lang) : '—'}
            </span>
          </div>
        </div>
      </section>
    </div>
  );
}
