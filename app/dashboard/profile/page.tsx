'use client';

import { useEffect, useState } from 'react';
import { UserCircle, Mail, Phone, Send, CheckCircle2, XCircle, ExternalLink } from 'lucide-react';
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
  first_name: string | null;
  last_name: string | null;
  date_of_birth: string | null;
  nationality: string | null;
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
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [dob, setDob] = useState('');
  const [nationality, setNationality] = useState('');
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
  const [telegramStep, setTelegramStep] = useState<'idle' | 'waiting_start' | 'otp_input'>('idle');
  const [telegramBotUrl, setTelegramBotUrl] = useState('');
  const [telegramGenerating, setTelegramGenerating] = useState(false);
  const [telegramFinding, setTelegramFinding] = useState(false);
  const [telegramVerifying, setTelegramVerifying] = useState(false);
  const [telegramError, setTelegramError] = useState('');

  useEffect(() => {
    apiFetch<ProfileData>('/profile/me')
      .then(data => {
        setProfile(data);
        setFirstName(data.first_name ?? '');
        setLastName(data.last_name ?? '');
        setDob(data.date_of_birth ?? '');
        setNationality(data.nationality ?? '');
        setPhone(data.phone ?? '');
      })
      .finally(() => setLoading(false));
  }, []);

  // ── Save personal info ──────────────────────────────────
  const handleSave = async () => {
    setSaving(true);
    setSavedMsg(false);
    try {
      await apiFetch('/profile/update', {
        method: 'PUT',
        body: {
          first_name: firstName || null,
          last_name: lastName || null,
          date_of_birth: dob || null,
          nationality: nationality || null,
          phone: phone || null,
        },
      });
      const combined = `${firstName} ${lastName}`.trim() || null;
      setSavedMsg(true);
      setProfile(prev => prev ? {
        ...prev,
        first_name: firstName || null,
        last_name: lastName || null,
        date_of_birth: dob || null,
        nationality: nationality || null,
        name: combined,
        phone: phone || null,
        is_phone_verified: phone !== (prev.phone ?? '') ? false : prev.is_phone_verified,
      } : prev);
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

  // ── Telegram connect ────────────────────────────────────
  const generateTelegramCode = async () => {
    setTelegramGenerating(true);
    setTelegramError('');
    try {
      const res = await apiFetch<{ token: string; bot_url: string }>('/profile/telegram/generate-code', { method: 'POST' });
      setTelegramBotUrl(res.bot_url);
      setTelegramStep('waiting_start');
    } catch {
      // ignore
    } finally {
      setTelegramGenerating(false);
    }
  };

  const sendOtpViaBot = async () => {
    setTelegramFinding(true);
    setTelegramError('');
    try {
      await apiFetch('/profile/telegram/send-otp-via-bot', { method: 'POST' });
      setTelegramStep('otp_input');
    } catch (err) {
      if (err instanceof ApiError && err.status === 400) {
        setTelegramError(t.profile_telegram_expired);
        setTelegramStep('idle');
      } else {
        setTelegramError(t.profile_telegram_not_found);
      }
    } finally {
      setTelegramFinding(false);
    }
  };

  const verifyTelegramOtp = async (otp: string) => {
    setTelegramVerifying(true);
    setTelegramError('');
    try {
      const res = await apiFetch<{ chat_id: string }>('/profile/telegram/verify', { method: 'POST', body: { otp } });
      setProfile(prev => prev ? { ...prev, is_telegram_verified: true, telegram_id: res.chat_id ?? null } : prev);
      setTelegramStep('idle');
    } catch (err) {
      setTelegramError(err instanceof ApiError && err.status === 400 ? t.profile_otp_invalid : t.profile_otp_error);
    } finally {
      setTelegramVerifying(false);
    }
  };

  const disconnectTelegram = async () => {
    try {
      await apiFetch('/profile/update', { method: 'PUT', body: { telegram_username: '' } });
      setProfile(prev => prev ? { ...prev, is_telegram_verified: false, telegram_id: null, telegram_username: null } : prev);
      setTelegramStep('idle');
      setTelegramError('');
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

        {/* First & Last Name */}
        <div className="grid grid-cols-2 gap-3">
          <Input
            label={t.profile_first_name}
            value={firstName}
            onChange={e => setFirstName(e.target.value)}
          />
          <Input
            label={t.profile_last_name}
            value={lastName}
            onChange={e => setLastName(e.target.value)}
          />
        </div>

        {/* Date of Birth */}
        <div className="w-full space-y-1.5">
          <label className="block text-xs font-medium text-[var(--color-text-muted)]">
            {t.profile_dob}
          </label>
          <input
            type="date"
            value={dob}
            onChange={e => setDob(e.target.value)}
            className="w-full h-10 text-sm px-4 rounded-[var(--radius-md)] bg-[rgba(6,13,28,0.6)] border border-[var(--color-border)] text-[var(--color-text-primary)] hover:border-[var(--color-border-hover)] focus:border-[var(--color-border-active)] focus:shadow-[var(--shadow-focus)] outline-none transition-all duration-200"
          />
        </div>

        {/* Nationality */}
        <Input
          label={t.profile_nationality}
          value={nationality}
          onChange={e => setNationality(e.target.value)}
          placeholder={lang === 'fa' ? 'مثال: ایرانی' : 'e.g. Iranian'}
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
        ) : telegramStep === 'idle' ? (
          /* Step 0: Connect button */
          <div className="space-y-2">
            <Button variant="outline" size="sm" loading={telegramGenerating} onClick={generateTelegramCode}>
              <Send className="w-3.5 h-3.5" />
              {t.profile_telegram_connect_btn}
            </Button>
            {telegramError && (
              <p className="text-xs text-[var(--color-danger)]">{telegramError}</p>
            )}
          </div>
        ) : telegramStep === 'waiting_start' ? (
          /* Step 1-2: Open bot + get code */
          <div className="rounded-xl border border-[var(--color-border)] bg-[rgba(0,212,255,0.04)] p-4 space-y-4">
            <ol className="space-y-2.5">
              {[t.profile_telegram_step_open, t.profile_telegram_step_start].map((step, i) => (
                <li key={i} className="flex items-start gap-2.5 text-xs text-[var(--color-text-muted)]">
                  <span className={`w-5 h-5 rounded-full text-[10px] font-bold flex items-center justify-center flex-shrink-0 mt-0.5 ${i === 0 ? 'bg-[var(--color-cyan)] text-black' : 'bg-[rgba(0,212,255,0.2)] text-[var(--color-cyan)]'}`}>
                    {i + 1}
                  </span>
                  {step}
                </li>
              ))}
            </ol>

            <div className="flex items-center gap-2 flex-wrap">
              <a
                href={telegramBotUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[rgba(0,136,204,0.12)] border border-[rgba(0,136,204,0.3)] text-xs font-medium text-[var(--color-cyan)] hover:bg-[rgba(0,136,204,0.22)] transition-colors"
              >
                <Send className="w-3 h-3" />
                {t.profile_telegram_open_bot}
                <ExternalLink className="w-3 h-3" />
              </a>
              <Button variant="primary" size="sm" loading={telegramFinding} onClick={sendOtpViaBot}>
                {t.profile_telegram_get_code}
              </Button>
            </div>

            {telegramError && (
              <p className="text-xs text-[var(--color-danger)]">{telegramError}</p>
            )}

            <button
              type="button"
              onClick={() => { setTelegramStep('idle'); setTelegramError(''); }}
              className="text-xs text-[var(--color-text-muted)] hover:text-[var(--color-text-secondary)] underline"
            >
              {lang === 'fa' ? 'شروع مجدد' : 'Start over'}
            </button>
          </div>
        ) : (
          /* Step 3: Enter OTP from Telegram */
          <div className="rounded-xl border border-[var(--color-border)] bg-[rgba(0,212,255,0.04)] p-4 space-y-3">
            <p className="text-xs text-[var(--color-cyan)]">{t.profile_telegram_otp_sent_tg}</p>
            <OtpInput
              onComplete={verifyTelegramOtp}
              disabled={telegramVerifying}
              error={!!telegramError}
            />
            {telegramError && (
              <p className="text-xs text-[var(--color-danger)] text-center">{telegramError}</p>
            )}
            <button
              type="button"
              onClick={() => { setTelegramStep('idle'); setTelegramError(''); }}
              className="text-xs text-[var(--color-text-muted)] hover:text-[var(--color-text-secondary)] underline"
            >
              {lang === 'fa' ? 'شروع مجدد' : 'Start over'}
            </button>
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
