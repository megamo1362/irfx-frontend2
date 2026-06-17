import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center">
      <div className="font-mono text-[120px] leading-none font-bold gradient-text-cyber opacity-50 select-none">
        404
      </div>
      <h1 className="text-xl font-semibold text-[var(--color-text-primary)] mt-4 mb-2">
        صفحه پیدا نشد
      </h1>
      <p className="text-sm text-[var(--color-text-muted)] mb-8 max-w-xs">
        صفحه‌ای که دنبالش می‌گردی وجود ندارد یا منتقل شده.
      </p>
      <Link href="/admin" className="btn-primary px-6 py-2.5 rounded-xl text-sm font-medium ml-3">
        پنل ادمین
      </Link>
      <Link href="/dashboard" className="btn-primary px-6 py-2.5 rounded-xl text-sm font-medium opacity-60 mt-3">
        داشبورد
      </Link>
    </div>
  );
}
