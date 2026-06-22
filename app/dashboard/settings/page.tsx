'use client';

import { Moon, Sun, Globe } from 'lucide-react';
import { useLang } from '@/app/i18n/LangContext';
import { useTheme } from '@/app/i18n/ThemeContext';
import type { Lang } from '@/app/i18n/translations';
import type { Theme } from '@/app/i18n/ThemeContext';

function OptionButton<T extends string>({
  value,
  current,
  onChange,
  icon,
  label,
}: {
  value: T;
  current: T;
  onChange: (v: T) => void;
  icon?: React.ReactNode;
  label: string;
}) {
  const active = value === current;
  return (
    <button
      type="button"
      onClick={() => onChange(value)}
      className={`flex items-center gap-3 w-full px-4 py-3 rounded-xl border transition-all text-sm font-medium ${
        active
          ? 'border-[var(--color-cyan)] bg-[var(--color-cyan-dim)] text-[var(--color-cyan)]'
          : 'border-[var(--color-border)] bg-transparent text-[var(--color-text-secondary)] hover:border-[var(--color-border-hover)] hover:text-[var(--color-text-primary)]'
      }`}
    >
      {icon && <span className="w-5 h-5 flex-shrink-0">{icon}</span>}
      <span>{label}</span>
      {active && (
        <span className="ml-auto w-2 h-2 rounded-full bg-[var(--color-cyan)]" />
      )}
    </button>
  );
}

export default function SettingsPage() {
  const { t, lang, setLang } = useLang();
  const { theme, setTheme } = useTheme();

  return (
    <div className="max-w-lg space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-[var(--color-text-primary)]">{t.settings_title}</h1>
        <p className="text-sm text-[var(--color-text-muted)] mt-1">{t.settings_desc}</p>
      </div>

      {/* Appearance */}
      <section className="glass rounded-2xl p-5 border border-[var(--color-border)] space-y-4">
        <div className="flex items-center gap-2 mb-1">
          <Sun className="w-4 h-4 text-[var(--color-cyan)]" />
          <h2 className="text-sm font-semibold text-[var(--color-text-primary)] uppercase tracking-wider">
            {t.settings_appearance_section}
          </h2>
        </div>
        <p className="text-xs text-[var(--color-text-muted)] -mt-2">{t.settings_theme_label}</p>
        <div className="grid grid-cols-2 gap-3">
          <OptionButton<Theme>
            value="dark"
            current={theme}
            onChange={setTheme}
            icon={<Moon className="w-4 h-4" />}
            label={t.settings_theme_dark}
          />
          <OptionButton<Theme>
            value="light"
            current={theme}
            onChange={setTheme}
            icon={<Sun className="w-4 h-4" />}
            label={t.settings_theme_light}
          />
        </div>
      </section>

      {/* Language */}
      <section className="glass rounded-2xl p-5 border border-[var(--color-border)] space-y-4">
        <div className="flex items-center gap-2 mb-1">
          <Globe className="w-4 h-4 text-[var(--color-cyan)]" />
          <h2 className="text-sm font-semibold text-[var(--color-text-primary)] uppercase tracking-wider">
            {t.settings_language_section}
          </h2>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <OptionButton<Lang>
            value="en"
            current={lang}
            onChange={setLang}
            label={t.settings_lang_en}
          />
          <OptionButton<Lang>
            value="fa"
            current={lang}
            onChange={setLang}
            label={t.settings_lang_fa}
          />
        </div>
      </section>
    </div>
  );
}
