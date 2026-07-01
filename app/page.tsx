"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  TrendingUp,
  Brain,
  NotebookPen,
  Clock,
  Repeat,
  Coins,
  Users,
  Sparkles,
  ArrowRight,
  Menu,
  X,
  Quote,
  Bot,
} from "lucide-react";
/* ----------------------------------------------------------------
   TOKENS — Quiet Luxury / Private Wealth direction
   canvas   #0A0E17   surface  #12121C   line  #232332
   text     #E9ECF3   muted    #7C8296
   gold (coach)   #38BDF8     violet (trader)  #8B7CF6
   display: Fraunces (serif)  |  body: Inter  |  fa: Vazirmatn  |  data: JetBrains Mono
   signature: engraved candlestick → pulse line, thin stroke, no glow
------------------------------------------------------------------*/

const COPY = {
  en: {
    dir: "ltr",
    nav: { features: "Features", how: "Process", pricing: "Pricing", coaches: "For Coaches", blog: "Blog", faq: "FAQ", login: "Log in", start: "Get Started" },
    toggle: { trader: "Trader", coach: "Coach" },
    hero: {
      trader: {
        eyebrow: "Trading Psychology, Quantified",
        title: "Understand why you lose money — not just where.",
        sub: "Mindlura reads your MT5 history and builds a behavioral profile as considered as the decisions it describes.",
        cta1: "Start Free Trial",
        cta2: "See the Process",
      },
      coach: {
        eyebrow: "Coaching, Backed by Data",
        title: "Coach smarter. See what your clients can't see.",
        sub: "A behavioral profile built from real trades, not memory of them — for coaches who take the work seriously.",
        cta1: "Start Coaching for Free",
        cta2: "See the Coach Dashboard",
      },
    },
    trust: ["Read-only Investor Password", "Native MT5 Integration", "Built from Inside a Brokerage"],
    founder: {
      eyebrow: "From Inside the Brokerage",
      title: "Built by someone who has seen the other side of the trade.",
      body: "Before Mindlura, our founder managed trading infrastructure at a forex brokerage — watching, from the inside, how traders actually behave under pressure. Mindlura is what that vantage point makes possible.",
    },
    stats: [
      { n: "6", l: "Behavioral Signals" },
      { n: "3", l: "Coach Hierarchy Tiers" },
      { n: "0", l: "Trade Access Required" },
      { n: "MT5", l: "Native Integration" },
    ],
    problem: {
      title: "The patterns you can feel but can't prove",
      items: [
        { t: "Overtrading", d: "One more trade to make it back. We flag the sessions where your trade count spikes against your own baseline." },
        { t: "Cutting Winners Short", d: "Fear closes good trades early. We measure your MFE against your actual exit to show what you're leaving behind." },
        { t: "Revenge Trading", d: "One bad trade shouldn't become five. We detect the pattern in your history before it repeats." },
      ],
    },
    features: {
      title: "Everything your trade history isn't telling you",
      items: [
        { t: "MAE / MFE Analysis", d: "The gap between your best possible exit and your real one.", icon: "trend" },
        { t: "Psychology Score", d: "A single number tracking behavioral discipline over time.", icon: "brain" },
        { t: "Emotion-Aware Journal", d: "The feeling behind the trade, not just the numbers.", icon: "journal" },
        { t: "Session & Time Analysis", d: "The hours where your edge actually shows up.", icon: "clock" },
        { t: "Pattern Detection", d: "Consecutive losses, revenge entries, fatigue — caught automatically.", icon: "repeat" },
        { t: "Cost Analysis", d: "Spread, swap, commission — what's really eating your edge.", icon: "coins" },
      ],
    },
    ai: {
      trader: {
        eyebrow: "Mindlura AI",
        title: "Insight that reads your trades, not just your numbers.",
        badge: "In Development",
        items: [
          { t: "AI Coach", d: "Ask why last Tuesday went wrong and get an answer grounded in your real trade data — not a generic tip.", icon: "bot" },
          { t: "AI Psychology Analysis", d: "Automated, plain-language breakdowns of what's driving your Psychology Score — updated with every new trade.", icon: "brain" },
        ],
      },
      coach: {
        eyebrow: "Mindlura AI",
        title: "Insight that reads every client's behavior, not just their numbers.",
        badge: "In Development",
        items: [
          { t: "AI Client Briefing", d: "Before every session, get a one-page summary of what changed in each client's behavior since you last talked.", icon: "bot" },
          { t: "AI Risk Flagging", d: "See which clients are showing overtrading, revenge trading, or fatigue this week — before they tell you.", icon: "brain" },
        ],
      },
    },
    how: {
      title: "From MT5 history to clear insight",
      steps: [
        { t: "Connect", d: "Link your MT5 account with a read-only Investor Password. No trade access, no risk." },
        { t: "Analyze", d: "Mindlura processes your full trade history and builds your behavioral profile automatically." },
        { t: "Improve", d: "Specific, dated insight — not generic advice — about what's actually costing you." },
      ],
    },
    coachSection: {
      eyebrow: "Built for Coaches & Teams",
      title: "One dashboard, every client's behavior",
      sub: "Coaches manage every client's behavioral profile in one place. Joining a coach is always the client's choice — Mindlura works just as well on your own.",
      cta: "Explore Coach Tools",
      note: "Optional — clients choose whether to join a coach.",
    },
    testimonial: {
      eyebrow: "Early Access",
      title: "The words of early traders and coaches will live here.",
      sub: "We're building this section with real accounts, not invented ones — check back soon.",
    },
    pricing: {
      title: "Plans that grow with you",
      cards: [
        { name: "Trial", tag: "Try it free" },
        { name: "Basic", tag: "For independent traders" },
        { name: "Pro", tag: "For serious traders & small teams" },
        { name: "Elite", tag: "White-glove, for coaches & prop teams" },
      ],
      cta: "See full pricing",
    },
    finalCta: {
      title: "Your trade history already knows your patterns.",
      sub: "It's time you did too.",
      button: "Start Free Trial",
    },
    comparison: {
      title: "Why Mindlura",
      cols: ["Manual Journal", "Generic Analytics", "Mindlura"],
      rows: [
        { label: "MT5 native connection",          checks: [false, false, true] },
        { label: "Behavioral pattern detection",   checks: [false, false, true] },
        { label: "Psychology Score over time",     checks: [false, false, true] },
        { label: "Emotion-aware journal",          checks: [true,  false, true] },
        { label: "Coach-client hierarchy",         checks: [false, false, true] },
      ],
    },
    blog: {
      title: "From the Mindlura Journal",
      cta: "Read all articles",
      cards: [
        { category: "Psychology",         title: "Why you close winning trades too early — and how to see it in your data",              desc: "MFE analysis reveals the gap between your best possible exit and your real one." },
        { category: "Behavioral Analysis",title: "Revenge trading: what your MT5 history shows that you don't remember",                 desc: "The pattern is always in the data. Here's what to look for." },
        { category: "For Coaches",        title: "How to run a behavioral review session using your client's trade history",             desc: "A practical framework for coaches who want data, not memory." },
      ],
    },
    faq: {
      title: "Common questions",
      items: [
        { q: "Is my trading account safe?",                       a: "Mindlura connects using a read-only Investor Password. We can see your trade history — nothing else. We cannot place, modify, or close trades." },
        { q: "Which brokers and platforms are supported?",        a: "Mindlura currently supports MetaTrader 5 (MT5). Support for cTrader is in development." },
        { q: "Do I need a coach to use Mindlura?",               a: "No. Mindlura works fully as a standalone tool. Joining a coach is always optional and always your choice." },
        { q: "What does the Psychology Score measure?",           a: "It tracks behavioral discipline over time — flagging patterns like overtrading, revenge entries, and cutting winners short — and compresses them into a single number you can watch improve." },
        { q: "How long does the analysis take after I connect?",  a: "Your full behavioral profile is built automatically within minutes of connecting your MT5 account." },
      ],
    },
    footer: {
      tagline: "Trading psychology, made visible.",
      cols: [
        { h: "Product", items: ["Features", "Pricing", "For Coaches", "Security"] },
        { h: "Company", items: ["About", "Contact", "Blog"] },
        { h: "Legal", items: ["Privacy", "Terms"] },
      ],
      rights: "All rights reserved.",
    },
  },
  fa: {
    dir: "rtl",
    nav: { features: "ویژگی‌ها", how: "فرآیند", pricing: "قیمت‌گذاری", coaches: "برای کوچ‌ها", blog: "بلاگ", faq: "سوالات متداول", login: "ورود", start: "شروع کنید" },
    toggle: { trader: "تریدر", coach: "کوچ" },
    hero: {
      trader: {
        eyebrow: "روان‌شناسی معاملاتی، قابل اندازه‌گیری",
        title: "بفهمید چرا ضرر می‌کنید؛ نه فقط کجا",
        sub: "مایندلورا تاریخچه MT5 شما را می‌خواند و پروفایل رفتاری‌ای می‌سازد که به‌اندازه تصمیم‌هایی که توصیف می‌کند، سنجیده است.",
        cta1: "شروع دوره آزمایشی رایگان",
        cta2: "مشاهده فرآیند",
      },
      coach: {
        eyebrow: "کوچینگ، پشتیبانی‌شده با داده",
        title: "هوشمندانه‌تر کوچینگ کنید؛ چیزی را ببینید که کلاینت‌هایتان نمی‌بینند",
        sub: "پروفایل رفتاری‌ای بر اساس معاملات واقعی، نه حافظه‌اش از آن‌ها؛ برای کوچ‌هایی که این کار را جدی می‌گیرند.",
        cta1: "شروع رایگان کوچینگ",
        cta2: "مشاهده داشبورد کوچ",
      },
    },
    trust: ["Investor Password فقط‌خواندنی", "اتصال بومی MT5", "ساخته‌شده از درون یک بروکری"],
    founder: {
      eyebrow: "از درون بروکری",
      title: "ساخته‌شده توسط کسی که آن‌طرف معامله را هم دیده است",
      body: "پیش از مایندلورا، بنیان‌گذار آن زیرساخت معاملاتی یک بروکر فارکس را مدیریت می‌کرد؛ و از درون دید که تریدرها واقعاً تحت فشار چگونه رفتار می‌کنند. مایندلورا حاصل همان زاویه دید است.",
    },
    stats: [
      { n: "۶", l: "سیگنال رفتاری" },
      { n: "۳", l: "سطح سلسله‌مراتب کوچ" },
      { n: "۰", l: "دسترسی به معامله" },
      { n: "MT5", l: "اتصال بومی" },
    ],
    problem: {
      title: "الگوهایی که حسش می‌کنید، اما نمی‌توانید اثباتش کنید",
      items: [
        { t: "بیش‌معامله‌گری", d: "یک معامله دیگر برای جبران. جلساتی که تعداد معاملات‌تان نسبت به میانگین خودتان جهش می‌کند را علامت‌گذاری می‌کنیم." },
        { t: "بستن زودهنگام معاملات سودده", d: "ترس، معاملات خوب را زود می‌بندد. حداکثر سود ممکن را با خروج واقعی شما مقایسه می‌کنیم." },
        { t: "معامله انتقامی", d: "یک معامله بد نباید به پنج معامله تبدیل شود. این الگو را در تاریخچه شما قبل از تکرار شناسایی می‌کنیم." },
      ],
    },
    features: {
      title: "هر آنچه تاریخچه معاملات‌تان نمی‌گوید",
      items: [
        { t: "تحلیل MAE / MFE", d: "فاصله بین بهترین خروج ممکن و خروج واقعی‌تان.", icon: "trend" },
        { t: "امتیاز روان‌شناختی", d: "یک عدد واحد که نظم رفتاری شما را در طول زمان نشان می‌دهد.", icon: "brain" },
        { t: "ژورنال هوشمند احساسی", d: "حسی که پشت معامله بود، نه فقط اعداد.", icon: "journal" },
        { t: "تحلیل جلسه و زمان", d: "ساعت‌هایی که مزیت واقعی شما در آن‌ها ظاهر می‌شود.", icon: "clock" },
        { t: "شناسایی الگو", d: "ضررهای پیاپی، ورود انتقامی، خستگی؛ به‌صورت خودکار شناسایی می‌شود.", icon: "repeat" },
        { t: "تحلیل هزینه", d: "اسپرد، سواپ، کمیسیون؛ چه چیزی واقعاً مزیت شما را می‌خورد.", icon: "coins" },
      ],
    },
    ai: {
      trader: {
        eyebrow: "هوش مصنوعی مایندلورا",
        title: "بینشی که معاملات شما را می‌خواند، نه فقط اعدادتان را",
        badge: "در دست ساخت",
        items: [
          { t: "کوچ هوش مصنوعی", d: "بپرسید چرا سه‌شنبه گذشته اشتباه پیش رفت و پاسخی مبتنی بر داده واقعی معاملات‌تان بگیرید؛ نه یک نکته کلی.", icon: "bot" },
          { t: "آنالیز روان‌شناسی با هوش مصنوعی", d: "تحلیل خودکار و قابل‌فهم از آنچه امتیاز روان‌شناختی شما را شکل می‌دهد؛ با هر معامله جدید به‌روزرسانی می‌شود.", icon: "brain" },
        ],
      },
      coach: {
        eyebrow: "هوش مصنوعی مایندلورا",
        title: "بینشی که رفتار هر کلاینت را می‌خواند، نه فقط اعدادش را",
        badge: "در دست ساخت",
        items: [
          { t: "بریفینگ کلاینت با هوش مصنوعی", d: "پیش از هر جلسه، یک خلاصه یک‌صفحه‌ای از آنچه در رفتار هر کلاینت از آخرین گفتگو تغییر کرده دریافت کنید.", icon: "bot" },
          { t: "پرچم‌گذاری ریسک با هوش مصنوعی", d: "ببینید کدام کلاینت‌ها این هفته بیش‌معامله‌گری، معامله انتقامی یا خستگی نشان می‌دهند؛ پیش از اینکه خودشان بگویند.", icon: "brain" },
        ],
      },
    },
    how: {
      title: "از تاریخچه MT5 تا بینش روشن",
      steps: [
        { t: "اتصال", d: "حساب MT5 خود را با Investor Password فقط‌خواندنی متصل کنید؛ بدون دسترسی به معامله، بدون ریسک." },
        { t: "تحلیل", d: "مایندلورا تاریخچه کامل معاملات شما را پردازش کرده و پروفایل رفتاری‌تان را خودکار می‌سازد." },
        { t: "بهبود", d: "بینش دقیق و مشخص؛ نه توصیه کلی؛ درباره آنچه واقعاً برای شما هزینه دارد." },
      ],
    },
    coachSection: {
      eyebrow: "ساخته‌شده برای کوچ‌ها و تیم‌ها",
      title: "یک داشبورد، رفتار همه کلاینت‌ها",
      sub: "کوچ‌ها پروفایل رفتاری هر کلاینت را در یک‌جا مدیریت می‌کنند. پیوستن به یک کوچ همیشه انتخاب خود کلاینت است؛ مایندلورا به‌تنهایی هم به همان خوبی کار می‌کند.",
      cta: "ابزارهای کوچ را ببینید",
      note: "اختیاری — کلاینت انتخاب می‌کند که به یک کوچ بپیوندد یا نه.",
    },
    testimonial: {
      eyebrow: "دسترسی زودهنگام",
      title: "حرف‌های تریدرها و کوچ‌های اولیه، اینجا خواهند بود",
      sub: "این بخش را با حساب‌های واقعی می‌سازیم، نه ساختگی؛ به‌زودی برمی‌گردیم.",
    },
    pricing: {
      title: "پلن‌هایی که با شما رشد می‌کنند",
      cards: [
        { name: "Trial", tag: "رایگان امتحان کنید" },
        { name: "Basic", tag: "برای تریدرهای مستقل" },
        { name: "Pro", tag: "برای تریدرهای حرفه‌ای و تیم‌های کوچک" },
        { name: "Elite", tag: "خدمات ویژه، برای کوچ‌ها و تیم‌های پراپ" },
      ],
      cta: "مشاهده کامل قیمت‌گذاری",
    },
    finalCta: {
      title: "تاریخچه معاملات شما الگوهایتان را از قبل می‌داند.",
      sub: "وقتشه شما هم بدانید.",
      button: "شروع دوره آزمایشی رایگان",
    },
    comparison: {
      title: "چرا مایندلورا",
      cols: ["ژورنال دستی", "آنالیتیکس معمولی", "مایندلورا"],
      rows: [
        { label: "اتصال بومی MT5",                 checks: [false, false, true] },
        { label: "شناسایی الگوی رفتاری",           checks: [false, false, true] },
        { label: "امتیاز روان‌شناختی در طول زمان", checks: [false, false, true] },
        { label: "ژورنال هوشمند احساسی",           checks: [true,  false, true] },
        { label: "ساختار کوچ-کلاینت",              checks: [false, false, true] },
      ],
    },
    blog: {
      title: "از ژورنال مایندلورا",
      cta: "مشاهده همه مقالات",
      cards: [
        { category: "روان‌شناسی",    title: "چرا معاملات سودده را زود می‌بندیم — و چگونه آن را در داده‌ها ببینیم",       desc: "تحلیل MFE فاصله بین بهترین خروج ممکن و خروج واقعی را نشان می‌دهد." },
        { category: "تحلیل رفتاری", title: "معامله انتقامی: آنچه تاریخچه MT5 نشان می‌دهد که خودتان یادتان نیست",       desc: "الگو همیشه در داده‌ها هست. اینجا نشان می‌دهیم کجا باید نگاه کنید." },
        { category: "برای کوچ‌ها",  title: "چگونه یک جلسه بررسی رفتاری با تاریخچه معاملات کلاینت برگزار کنیم",         desc: "یک چارچوب عملی برای کوچ‌هایی که داده می‌خواهند، نه حافظه." },
      ],
    },
    faq: {
      title: "سوالات رایج",
      items: [
        { q: "آیا حساب معاملاتی‌ام امن است؟",                   a: "مایندلورا با Investor Password فقط‌خواندنی متصل می‌شود. ما فقط تاریخچه معاملات شما را می‌بینیم — نه چیز دیگری. هیچ‌گونه دسترسی برای ثبت، تغییر یا بستن معامله نداریم." },
        { q: "کدام بروکرها و پلتفرم‌ها پشتیبانی می‌شوند؟",      a: "مایندلورا در حال حاضر از MetaTrader 5 پشتیبانی می‌کند. پشتیبانی از cTrader در دست توسعه است." },
        { q: "آیا برای استفاده از مایندلورا به کوچ نیاز دارم؟", a: "نه. مایندلورا به‌تنهایی و بدون کوچ هم کامل کار می‌کند. پیوستن به یک کوچ کاملاً اختیاری است." },
        { q: "امتیاز روان‌شناختی چه چیزی را اندازه می‌گیرد؟",   a: "نظم رفتاری شما را در طول زمان رصد می‌کند؛ الگوهایی مثل بیش‌معامله‌گری، ورود انتقامی و بستن زودهنگام معاملات سودده را شناسایی کرده و همه را در یک عدد واحد خلاصه می‌کند." },
        { q: "تحلیل چقدر طول می‌کشد؟",                          a: "پروفایل رفتاری کامل شما چند دقیقه پس از اتصال حساب MT5 به‌صورت خودکار ساخته می‌شود." },
      ],
    },
    footer: {
      tagline: "روان‌شناسی معاملاتی، قابل مشاهده.",
      cols: [
        { h: "محصول", items: ["ویژگی‌ها", "قیمت‌گذاری", "برای کوچ‌ها", "امنیت"] },
        { h: "شرکت", items: ["درباره ما", "تماس با ما", "بلاگ"] },
        { h: "قوانین", items: ["حریم خصوصی", "شرایط استفاده"] },
      ],
      rights: "تمامی حقوق محفوظ است.",
    },
  },
};

const ICONS = { trend: TrendingUp, brain: Brain, journal: NotebookPen, clock: Clock, repeat: Repeat, coins: Coins, bot: Bot };

// Matches the order of footer cols in COPY (Product | Company | Legal)
const FOOTER_HREFS = [
  ["#features", "/pricing", "#coaches", "/security"],
  ["/about", "/contact", "/blog"],
  ["/privacy", "/terms"],
];

export default function MindluraLandingLuxury() {
  const [lang, setLang] = useState<"en" | "fa">("en");
  const [audience, setAudience] = useState<"trader" | "coach">("trader");
  const [menuOpen, setMenuOpen] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const t = COPY[lang];
  const isFa = lang === "fa";
  const accent = audience === "trader" ? "#8B7CF6" : "#38BDF8";
  const accentGlow = audience === "trader" ? "rgba(139,124,246,0.5)" : "rgba(56,189,248,0.5)";

  const bodyFont = isFa ? "'Vazirmatn', sans-serif" : "'Inter', sans-serif";
  const displayFont = isFa ? "'Vazirmatn', sans-serif" : "'Fraunces', serif";

  return (
    <div dir={t.dir} style={{ backgroundColor: "#0A0E17", color: "#E9ECF3", fontFamily: bodyFont, minHeight: "100vh" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,400;0,9..144,500;0,9..144,600;1,9..144,500&family=Inter:wght@400;500;600;700&family=Vazirmatn:wght@400;500;600;700&family=JetBrains+Mono:wght@500&display=swap');
        @media (prefers-reduced-motion: reduce) { * { transition: none !important; } }
        .ml-focus:focus-visible { outline: 1px solid ${accent}; outline-offset: 4px; }
        .ml-glow { box-shadow: 0 0 28px ${accentGlow}; }
        .ml-underline { position:relative; }
        .ml-underline::after { content:''; position:absolute; left:0; right:0; bottom:-6px; height:1px; background:${accent}; transform:scaleX(0); transition:transform .35s ease; }
        .ml-underline.active::after { transform:scaleX(1); }
        .hairline { height:1px; background:#232332; }
      `}</style>

      {/* ---------------- HEADER ---------------- */}
      <header className="sticky top-0 z-50" style={{ backgroundColor: "rgba(10,10,15,0.9)", backdropFilter: "blur(8px)" }}>
        <div className="hairline" />
        <div className="max-w-screen-2xl mx-auto px-6 py-5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <img src="/logo.png" alt="Mindlura" className="w-9 h-9" style={{ filter: `drop-shadow(0 0 6px ${accent}80)` }} />
            <span className="text-lg" style={{ fontFamily: displayFont, letterSpacing: "0.01em" }}>Mindlura</span>
          </div>

          <nav className="hidden md:flex items-center gap-9 text-sm" style={{ color: "#7C8296" }}>
            <a href="#features" className="hover:text-[#E9ECF3] transition-colors ml-focus">{t.nav.features}</a>
            <a href="#how" className="hover:text-[#E9ECF3] transition-colors ml-focus">{t.nav.how}</a>
            <a href="#pricing" className="hover:text-[#E9ECF3] transition-colors ml-focus">{t.nav.pricing}</a>
            <a href="#coaches" className="hover:text-[#E9ECF3] transition-colors ml-focus">{t.nav.coaches}</a>
            <Link href="/blog" className="hover:text-[#E9ECF3] transition-colors ml-focus">{t.nav.blog}</Link>
            <a href="#faq" className="hover:text-[#E9ECF3] transition-colors ml-focus">{t.nav.faq}</a>
          </nav>

          <div className="hidden md:flex items-center gap-6">
            <button onClick={() => setLang(isFa ? "en" : "fa")} className="text-xs italic ml-focus" style={{ fontFamily: displayFont, color: "#7C8296" }}>
              {isFa ? "English" : "فارسی"}
            </button>
            <Link href="/login" className="text-sm ml-focus" style={{ color: "#C7CBE0" }}>{t.nav.login}</Link>
            <Link href="/register" className="text-sm px-5 py-2 ml-focus" style={{ border: `1px solid ${accent}`, color: "#E9ECF3" }}>
              {t.nav.start}
            </Link>
          </div>

          <button className="md:hidden ml-focus" onClick={() => setMenuOpen(!menuOpen)} aria-label="Menu">
            {menuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
        {menuOpen && (
          <div className="md:hidden px-6 pb-5 flex flex-col gap-3 text-sm" style={{ color: "#C7CBE0" }}>
            <a href="#features">{t.nav.features}</a>
            <a href="#how">{t.nav.how}</a>
            <a href="#pricing">{t.nav.pricing}</a>
            <a href="#coaches">{t.nav.coaches}</a>
            <Link href="/blog">{t.nav.blog}</Link>
            <a href="#faq">{t.nav.faq}</a>
            <button onClick={() => setLang(isFa ? "en" : "fa")} className="text-left italic" style={{ fontFamily: displayFont }}>{isFa ? "English" : "فارسی"}</button>
          </div>
        )}
      </header>

      {/* ---------------- HERO ---------------- */}
      <section className="max-w-screen-2xl mx-auto px-6 pt-20 pb-16 grid md:grid-cols-[1.1fr_0.9fr] gap-14 items-start">
        <div className={isFa ? "md:order-2" : ""}>
          {/* Audience toggle — editorial tabs */}
          <div className="flex items-center gap-6 mb-10 text-sm">
            {(["trader", "coach"] as const).map((a) => (
              <button
                key={a}
                onClick={() => setAudience(a)}
                className={`ml-underline ml-focus pb-1 ${audience === a ? "active" : ""}`}
                style={{ color: audience === a ? "#E9ECF3" : "#5A6178", fontFamily: displayFont, fontStyle: "italic" }}
              >
                {a === "trader" ? t.toggle.trader : t.toggle.coach}
              </button>
            ))}
          </div>

          <p className="text-sm italic mb-5" style={{ color: accent, fontFamily: displayFont }}>
            {t.hero[audience].eyebrow}
          </p>
          <h1 className="text-4xl md:text-[3.4rem] leading-[1.12] mb-7" style={{ fontFamily: displayFont, fontWeight: 500 }}>
            {t.hero[audience].title}
          </h1>
          <p className="text-base leading-relaxed mb-10 max-w-md" style={{ color: "#7C8296" }}>
            {t.hero[audience].sub}
          </p>

          <div className="flex flex-wrap items-center gap-8">
            <Link href="/register" className="px-7 py-3 text-sm ml-focus ml-glow" style={{ backgroundColor: accent, color: "#0A0E17" }}>
              {t.hero[audience].cta1}
            </Link>
            <a href="#how" className="text-sm flex items-center gap-2 ml-focus" style={{ color: "#C7CBE0" }}>
              {t.hero[audience].cta2}
              <ArrowRight size={14} className={isFa ? "rotate-180" : ""} />
            </a>
          </div>
        </div>

        <div className={`flex items-center justify-center pt-10 ${isFa ? "md:order-1" : ""}`}>
          <CandlePulseMotif accent={accent} />
        </div>
      </section>

      <div className="max-w-screen-2xl mx-auto px-6"><div className="hairline" /></div>

      {/* ---------------- TRUST BAR ---------------- */}
      <section className="max-w-screen-2xl mx-auto px-6 py-7">
        <div className="flex flex-wrap items-center justify-between gap-x-10 gap-y-3 text-xs" style={{ color: "#5A6178" }}>
          {t.trust.map((item, i) => (
            <span key={i}>{item}</span>
          ))}
        </div>
      </section>

      {/* ---------------- AI ---------------- */}
      <section className="max-w-screen-2xl mx-auto px-6 py-16">
        <div className="hairline mb-16" />
        <div className="flex items-center gap-3 mb-4 flex-wrap">
          <p className="text-sm italic" style={{ color: accent, fontFamily: displayFont }}>{t.ai[audience].eyebrow}</p>
          <span className="text-[10px] uppercase tracking-wide px-2 py-0.5" style={{ border: `1px solid ${accent}`, color: accent }}>
            {t.ai[audience].badge}
          </span>
        </div>
        <h2 className="text-2xl md:text-3xl mb-12 max-w-lg" style={{ fontFamily: displayFont, fontWeight: 500 }}>{t.ai[audience].title}</h2>
        <div className="grid md:grid-cols-2 gap-6">
          {t.ai[audience].items.map((item, i) => {
            const Icon = ICONS[item.icon as keyof typeof ICONS];
            return (
              <div key={i} className="p-6" style={{ border: "1px solid #232332" }}>
                <Icon size={20} strokeWidth={1.4} style={{ color: accent }} className="mb-4" />
                <h3 className="text-lg mb-2" style={{ fontFamily: displayFont, fontWeight: 500 }}>{item.t}</h3>
                <p className="text-sm leading-relaxed" style={{ color: "#7C8296" }}>{item.d}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* ---------------- STATS ---------------- */}
      <section className="max-w-screen-2xl mx-auto px-6 py-16">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {t.stats.map((s, i) => (
            <div key={i}>
              <div className="text-3xl mb-2" style={{ fontFamily: "'JetBrains Mono', monospace", color: accent }}>{s.n}</div>
              <div className="text-xs" style={{ color: "#7C8296" }}>{s.l}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ---------------- FOUNDER ---------------- */}
      <section className="max-w-screen-2xl mx-auto px-6 py-16">
        <div className="hairline mb-16" />
        <div className="grid md:grid-cols-[0.4fr_0.6fr] gap-10">
          <p className="text-sm italic" style={{ color: accent, fontFamily: displayFont }}>{t.founder.eyebrow}</p>
          <div>
            <h2 className="text-2xl md:text-3xl mb-5 max-w-lg" style={{ fontFamily: displayFont, fontWeight: 500 }}>{t.founder.title}</h2>
            <p className="text-sm leading-relaxed max-w-lg" style={{ color: "#7C8296" }}>{t.founder.body}</p>
          </div>
        </div>
      </section>

      {/* ---------------- PROBLEM / SOLUTION ---------------- */}
      <section className="max-w-screen-2xl mx-auto px-6 py-16">
        <div className="hairline mb-16" />
        <h2 className="text-2xl md:text-3xl mb-14 max-w-lg" style={{ fontFamily: displayFont, fontWeight: 500 }}>{t.problem.title}</h2>
        <div>
          {t.problem.items.map((item, i) => (
            <div key={i} className="grid md:grid-cols-[80px_1fr] gap-6 py-7" style={{ borderBottom: i < t.problem.items.length - 1 ? "1px solid #1C1C28" : "none" }}>
              <div className="text-sm" style={{ fontFamily: "'JetBrains Mono', monospace", color: accent }}>{String(i + 1).padStart(2, "0")}</div>
              <div>
                <h3 className="text-lg mb-1.5" style={{ fontFamily: displayFont, fontWeight: 500 }}>{item.t}</h3>
                <p className="text-sm leading-relaxed max-w-lg" style={{ color: "#7C8296" }}>{item.d}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ---------------- COMPARISON ---------------- */}
      <section className="max-w-screen-2xl mx-auto px-6 py-16">
        <div className="hairline mb-16" />
        <h2 className="text-2xl md:text-3xl mb-14 max-w-lg" style={{ fontFamily: displayFont, fontWeight: 500 }}>{t.comparison.title}</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm" style={{ borderCollapse: "collapse" }}>
            <thead>
              <tr>
                <th className="text-left pb-6 pr-8" style={{ color: "#5A6178", fontWeight: 400 }}></th>
                {t.comparison.cols.map((col, ci) => (
                  <th key={ci} className="pb-6 px-6 text-center font-medium"
                    style={{
                      color: ci === 2 ? accent : "#7C8296",
                      borderBottom: ci === 2 ? `1px solid ${accent}` : "1px solid #232332",
                      fontFamily: ci === 2 ? "'JetBrains Mono', monospace" : "inherit",
                    }}>
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {t.comparison.rows.map((row, ri) => (
                <tr key={ri} style={{ borderBottom: "1px solid #1C1C28" }}>
                  <td className="py-4 pr-8 text-sm" style={{ color: "#C7CBE0" }}>{row.label}</td>
                  {row.checks.map((checked, ci) => (
                    <td key={ci} className="py-4 px-6 text-center text-base"
                      style={{ color: checked ? accent : "#2A2A3A" }}>
                      {checked ? "✓" : "✕"}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* ---------------- FEATURES ---------------- */}
      <section id="features" className="max-w-screen-2xl mx-auto px-6 py-16">
        <div className="hairline mb-16" />
        <h2 className="text-2xl md:text-3xl mb-14 max-w-lg" style={{ fontFamily: displayFont, fontWeight: 500 }}>{t.features.title}</h2>
        <div className="grid md:grid-cols-3 gap-x-8 gap-y-10">
          {t.features.items.map((item, i) => {
            const Icon = ICONS[item.icon as keyof typeof ICONS];
            return (
              <div key={i}>
                <Icon size={18} style={{ color: accent }} className="mb-4" strokeWidth={1.5} />
                <h3 className="text-base mb-1.5" style={{ fontFamily: displayFont, fontWeight: 500 }}>{item.t}</h3>
                <p className="text-sm leading-relaxed" style={{ color: "#7C8296" }}>{item.d}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* ---------------- HOW IT WORKS ---------------- */}
      <section id="how" className="max-w-screen-2xl mx-auto px-6 py-16">
        <div className="hairline mb-16" />
        <h2 className="text-2xl md:text-3xl mb-14 max-w-lg" style={{ fontFamily: displayFont, fontWeight: 500 }}>{t.how.title}</h2>
        <div className="grid md:grid-cols-3 gap-10">
          {t.how.steps.map((step, i) => (
            <div key={i}>
              <div className="text-xs mb-4" style={{ fontFamily: "'JetBrains Mono', monospace", color: accent }}>{String(i + 1).padStart(2, "0")}</div>
              <h3 className="text-lg mb-2" style={{ fontFamily: displayFont, fontWeight: 500 }}>{step.t}</h3>
              <p className="text-sm leading-relaxed max-w-xs" style={{ color: "#7C8296" }}>{step.d}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ---------------- COACH SECTION ---------------- */}
      <section id="coaches" className="max-w-screen-2xl mx-auto px-6 py-16">
        <div className="hairline mb-16" />
        <div className="grid md:grid-cols-2 gap-14 items-center">
          <div>
            <p className="text-sm italic mb-4" style={{ color: "#38BDF8", fontFamily: displayFont }}>{t.coachSection.eyebrow}</p>
            <h2 className="text-2xl md:text-3xl mb-5 max-w-md" style={{ fontFamily: displayFont, fontWeight: 500 }}>{t.coachSection.title}</h2>
            <p className="text-sm leading-relaxed mb-8 max-w-md" style={{ color: "#7C8296" }}>{t.coachSection.sub}</p>
            <Link href="/register" className="text-sm inline-flex items-center gap-2 ml-focus" style={{ color: "#38BDF8" }}>
              {t.coachSection.cta}
              <ArrowRight size={14} className={isFa ? "rotate-180" : ""} />
            </Link>
          </div>
          <div className="flex flex-col items-center justify-center gap-4">
            <RoleHierarchy isFa={isFa} />
            <p className="text-xs italic text-center" style={{ color: "#5A6178", fontFamily: displayFont }}>{t.coachSection.note}</p>
          </div>
        </div>
      </section>

      {/* ---------------- BLOG PREVIEW ---------------- */}
      <section className="max-w-screen-2xl mx-auto px-6 py-16">
        <div className="hairline mb-16" />
        <div className="flex items-end justify-between mb-12 flex-wrap gap-4">
          <h2 className="text-2xl md:text-3xl" style={{ fontFamily: displayFont, fontWeight: 500 }}>{t.blog.title}</h2>
          <Link href="/blog" className="text-sm ml-focus" style={{ color: accent }}>{t.blog.cta} →</Link>
        </div>
        <div className="grid md:grid-cols-3 gap-8">
          {t.blog.cards.map((card, i) => (
            <div key={i} className="flex flex-col" style={{ borderTop: "1px solid #232332", paddingTop: "20px" }}>
              <span className="text-xs mb-3 uppercase tracking-wide" style={{ color: accent, fontFamily: "'JetBrains Mono', monospace" }}>{card.category}</span>
              <h3 className="text-base mb-3 leading-snug flex-1" style={{ fontFamily: displayFont, fontWeight: 500 }}>{card.title}</h3>
              <p className="text-xs leading-relaxed mb-4" style={{ color: "#7C8296" }}>{card.desc}</p>
              <Link href="/blog" className="text-xs ml-focus" style={{ color: accent }}>→</Link>
            </div>
          ))}
        </div>
      </section>

      {/* ---------------- TESTIMONIAL PLACEHOLDER ---------------- */}
      <section className="max-w-screen-2xl mx-auto px-6 py-16">
        <div className="hairline mb-16" />
        <div className="text-center max-w-xl mx-auto">
          <Quote size={26} strokeWidth={1.2} style={{ color: accent, margin: "0 auto 20px" }} />
          <p className="text-xs italic mb-4" style={{ color: accent, fontFamily: displayFont }}>{t.testimonial.eyebrow}</p>
          <h3 className="text-xl md:text-2xl mb-4" style={{ fontFamily: displayFont, fontWeight: 500 }}>{t.testimonial.title}</h3>
          <p className="text-sm" style={{ color: "#5A6178" }}>{t.testimonial.sub}</p>
        </div>
      </section>

      {/* ---------------- PRICING TEASER ---------------- */}
      <section id="pricing" className="max-w-screen-2xl mx-auto px-6 py-16">
        <div className="hairline mb-16" />
        <h2 className="text-2xl md:text-3xl mb-14" style={{ fontFamily: displayFont, fontWeight: 500 }}>{t.pricing.title}</h2>
        <div className="grid md:grid-cols-4 gap-8 mb-10">
          {t.pricing.cards.map((card, i) => (
            <div key={i} style={{ borderTop: i === 3 ? `1px solid #38BDF8` : "1px solid #232332", paddingTop: "20px" }}>
              <h3 className="text-base mb-2" style={{ fontFamily: "'JetBrains Mono', monospace" }}>{card.name}</h3>
              <p className="text-xs leading-relaxed" style={{ color: "#7C8296" }}>{card.tag}</p>
            </div>
          ))}
        </div>
        <Link href="/pricing" className="text-sm underline ml-focus" style={{ color: accent }}>{t.pricing.cta}</Link>
      </section>

      {/* ---------------- FAQ ---------------- */}
      <section id="faq" className="max-w-screen-2xl mx-auto px-6 py-16">
        <div className="hairline mb-16" />
        <h2 className="text-2xl md:text-3xl mb-12" style={{ fontFamily: displayFont, fontWeight: 500 }}>{t.faq.title}</h2>
        <div>
          {t.faq.items.map((item, i) => (
            <div key={i} style={{ borderBottom: "1px solid #1C1C28" }}>
              <button
                className="w-full flex items-center justify-between py-5 text-left ml-focus"
                onClick={() => setOpenFaq(openFaq === i ? null : i)}
              >
                <span className="text-sm font-medium pr-8" style={{ fontFamily: displayFont, color: "#E9ECF3" }}>{item.q}</span>
                <span className="text-lg flex-shrink-0" style={{ color: accent, fontFamily: "'JetBrains Mono', monospace", lineHeight: 1 }}>
                  <span aria-hidden="true" dangerouslySetInnerHTML={{ __html: openFaq === i ? "&#x2212;" : "&#x002B;" }} />
                </span>
              </button>
              {openFaq === i && (
                <p className="pb-5 text-sm leading-relaxed max-w-2xl" style={{ color: "#7C8296" }}>{item.a}</p>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* ---------------- FINAL CTA ---------------- */}
      <section className="max-w-screen-2xl mx-auto px-6 py-24 text-center">
        <div className="hairline mb-16 max-w-xs mx-auto" style={{ backgroundColor: accent, opacity: 0.5 }} />
        <h2 className="text-2xl md:text-4xl mb-3 max-w-2xl mx-auto" style={{ fontFamily: displayFont, fontWeight: 500 }}>{t.finalCta.title}</h2>
        <p className="text-base mb-10" style={{ color: "#7C8296" }}>{t.finalCta.sub}</p>
        <Link href="/register" className="inline-flex items-center gap-2 px-8 py-3.5 text-sm ml-focus ml-glow" style={{ backgroundColor: accent, color: "#0A0E17" }}>
          {t.finalCta.button}
          <ArrowRight size={16} className={isFa ? "rotate-180" : ""} />
        </Link>
      </section>

      {/* ---------------- FOOTER ---------------- */}
      <footer>
        <div className="hairline" />
        <div className="max-w-screen-2xl mx-auto px-6 py-14 grid md:grid-cols-4 gap-10">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <img src="/logo.png" alt="Mindlura" className="w-7 h-7" />
              <span style={{ fontFamily: displayFont }}>Mindlura</span>
            </div>
            <p className="text-sm" style={{ color: "#5A6178" }}>{t.footer.tagline}</p>
          </div>
          {t.footer.cols.map((col, i) => (
            <div key={i}>
              <h4 className="text-xs mb-3 uppercase tracking-wide" style={{ color: "#7C8296" }}>{col.h}</h4>
              <ul className="space-y-2 text-sm" style={{ color: "#5A6178" }}>
                {col.items.map((item, j) => (
                  <li key={j}>
                    <Link href={FOOTER_HREFS[i][j]} className="hover:text-[#C7CBE0] transition-colors">{item}</Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="hairline" />
        <div className="max-w-screen-2xl mx-auto px-6 py-6 text-xs text-center" style={{ color: "#5A6178" }}>
          © 2026 Mindlura — {t.footer.rights}
        </div>
      </footer>
    </div>
  );
}

/* ---------------- Signature: engraved candlestick → pulse line ---------------- */
function CandlePulseMotif({ accent }: { accent: string }) {
  const candles = [
    { h: 22, up: true }, { h: 34, up: false }, { h: 16, up: true },
    { h: 42, up: true }, { h: 26, up: false }, { h: 48, up: true },
  ];
  return (
    <svg viewBox="0 0 380 200" className="w-full max-w-sm" style={{ opacity: 0.95, filter: `drop-shadow(0 0 10px ${accent}90)` }}>
      {candles.map((c, i) => (
        <rect key={i} x={20 + i * 34} y={100 - c.h / 2} width="6" height={c.h} fill={accent} opacity={c.up ? 0.9 : 0.45} />
      ))}
      <path
        d="M 240 100 L 280 100 L 300 70 L 320 130 L 340 100 L 370 100"
        fill="none" stroke={accent} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" opacity="0.95"
      />
    </svg>
  );
}

/* ---------------- Role hierarchy diagram ---------------- */
function RoleHierarchy({ isFa }: { isFa: boolean }) {
  const labels = isFa
    ? { coach: "کوچ", client: "کلاینت" }
    : { coach: "Coach", client: "Client" };
  return (
    <div className="flex flex-col items-center gap-4">
      <RoleNode label={labels.coach} icon={Users} />
      <div className="w-px h-8" style={{ backgroundColor: "#232332" }} />
      <div className="flex gap-5">
        {[0, 1, 2].map((i) => <RoleNode key={i} label={labels.client} icon={Sparkles} small />)}
      </div>
    </div>
  );
}

function RoleNode({ label, icon: Icon, small }: { label: string; icon: React.ElementType; small?: boolean }) {
  return (
    <div className={`flex flex-col items-center justify-center ${small ? "w-16 h-16" : "w-24 h-16"}`} style={{ border: "1px solid #232332" }}>
      <Icon size={small ? 13 : 16} strokeWidth={1.3} style={{ color: "#7C8296" }} />
      <span className="text-[10px] mt-1.5" style={{ color: "#5A6178" }}>{label}</span>
    </div>
  );
}
