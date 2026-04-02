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

export function TelegramCtaButton({ href, children, className = "" }: Props) {
  const url = href.trim();
  const disabled = !url;

  const inner = (
    <>
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-[#2AABEE]/20 bg-[#2AABEE]/10 text-[#4DC4FF]">
        <TelegramMark className="h-[18px] w-[18px]" />
      </span>
      <span className="min-w-0 flex-1 text-left text-[13px] font-semibold tracking-wide">{children}</span>
      <span
        className="hidden shrink-0 text-[11px] font-medium text-zinc-600 sm:inline"
        aria-hidden
      >
        ↗
      </span>
    </>
  );

  const shell =
    "group relative flex w-full min-h-[48px] items-center gap-3 overflow-hidden rounded-xl border px-3.5 py-2.5 text-sm transition-all duration-200 active:scale-[0.99] sm:w-auto sm:min-w-[220px]";

  const enabled =
    "border-[#2AABEE]/15 bg-[#2AABEE]/[0.06] text-zinc-200 backdrop-blur-xl hover:border-[#2AABEE]/30 hover:bg-[#2AABEE]/[0.12] hover:shadow-[0_0_16px_rgba(42,171,238,0.15)]";

  const disabledStyle = "cursor-not-allowed border-white/5 bg-white/[0.02] text-zinc-600 opacity-50";

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
