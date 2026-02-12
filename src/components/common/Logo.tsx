import { Link } from "react-router";

type LogoVariant = "light" | "dark" | "auth";

interface LogoProps {
  /** light: 다크 텍스트(라이트 배경), dark: 흰 텍스트(다크 배경), auth: 로그인 페이지용 큰 사이즈 흰 텍스트 */
  variant?: LogoVariant;
  /** true면 아이콘만 표시 (사이드바 접힌 상태) */
  iconOnly?: boolean;
  /** 링크 비활성화 (이미 Link로 감싸진 경우) */
  noLink?: boolean;
  className?: string;
}

const variantStyles: Record<
  LogoVariant,
  { iconSize: number; textClassName: string }
> = {
  light: {
    iconSize: 32,
    textClassName:
      "text-gray-900 dark:text-white font-semibold text-lg tracking-tight",
  },
  dark: {
    iconSize: 32,
    textClassName: "text-white font-semibold text-lg tracking-tight",
  },
  auth: {
    iconSize: 48,
    textClassName: "text-white font-semibold text-2xl tracking-tight",
  },
};

export default function Logo({
  variant = "light",
  iconOnly = false,
  noLink = false,
  className = "",
}: LogoProps) {
  const { iconSize, textClassName } = variantStyles[variant];

  const content = (
    <>
      <img
        src="/images/logo/logo-icon.svg"
        alt=""
        width={iconSize}
        height={iconSize}
        className="shrink-0"
      />
      {!iconOnly && (
        <span className={textClassName}>JARVIS</span>
      )}
    </>
  );

  const wrapperClassName = `inline-flex items-center gap-2 ${className}`.trim();

  if (noLink) {
    return <div className={wrapperClassName}>{content}</div>;
  }

  return (
    <Link to="/" className={wrapperClassName} aria-label="JARVIS 홈">
      {content}
    </Link>
  );
}
