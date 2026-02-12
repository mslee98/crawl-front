/**
 * DiceBear API (https://dicebear.com) 프로필 이미지 URL 생성
 * - 동일 seed면 항상 같은 아바타가 생성되므로 user.id를 seed로 사용
 * - 사용처: UserDropdown(헤더), AppSidebar(사이드바 하단), UserMetaCard(프로필 페이지)
 *
 * @param seed 사용자 id, uuid 등 고유 문자열 (같으면 같은 이미지)
 * @param style avataaars(캐릭터) | lorelei | bottts (기본: avataaars)
 * @returns SVG 이미지 URL (img src에 그대로 사용 가능)
 */
export function getDiceBearAvatarUrl(
  seed: string,
  style: "avataaars" | "lorelei" | "bottts" = "avataaars"
): string {
  const encoded = encodeURIComponent(seed || "anonymous");
  return `https://api.dicebear.com/9.x/${style}/svg?seed=${encoded}`;
}
