import type { ReactNode } from "react";

type Props = {
  href: string;
  children: ReactNode;
  className?: string;
};

function TelegramMark({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
      <path
        d="M19.777 5.145 4.54 10.902c-.623.248-.618.593-.113.748l3.815 1.19 1.48 4.55c.18.497.09.695.51.695.335 0 .483-.155.67-.338l2.804-2.722 5.82 4.26c1.07.59 1.84.28 2.1-.97l3.06-14.42c.38-1.52-.58-2.2-1.57-1.75z"
        fill="currentColor"
      />
    </svg>
  );
}

/**
 * 외부 t.me / https 링크 — 단일 톤, 과한 글로우 제거
 */
export function TelegramCtaButton({ href, children, className = "" }: Props) {
  const url = href.trim();
  const disabled = !url;

  const inner = (
    <>
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-white/10 bg-white/[0.06] text-sky-200">
        <TelegramMark className="h-[18px] w-[18px]" />
      </span>
      <span className="min-w-0 flex-1 text-left text-[13px] font-semibold tracking-wide">{children}</span>
      <span
        className="hidden shrink-0 text-[11px] font-medium text-slate-500 sm:inline"
        aria-hidden
      >
        ↗
      </span>
    </>
  );

  const shell =
    "group relative flex w-full min-h-[48px] items-center gap-3 overflow-hidden rounded-[11px] border px-3.5 py-2.5 text-sm transition duration-200 active:scale-[0.99] sm:w-auto sm:min-w-[220px]";

  const enabled =
    "border-sky-500/25 bg-[#152a42] text-slate-100 shadow-[0_1px_0_rgba(255,255,255,0.06)_inset] hover:border-sky-400/35 hover:bg-[#1a314d]";

  const disabledStyle = "cursor-not-allowed border-white/5 bg-white/[0.03] text-slate-500 opacity-50";

  if (disabled) {
    return (
      <span className={`${shell} ${disabledStyle} ${className}`} aria-disabled role="link">
        {inner}
      </span>
    );
  }

  return (
    <a href={url} target="_blank" rel="noopener noreferrer" className={`${shell} ${enabled} ${className}`}>
      {inner}
    </a>
  );
}
