/**
 * DiceBear API (https://dicebear.com) - 동일 seed면 항상 같은 아바타 생성
 * @param seed 사용자 id, uuid 등 고유 문자열
 * @param style 스타일 (기본: avataaars)
 */
export function getDiceBearAvatarUrl(
  seed: string,
  style: "avataaars" | "lorelei" | "bottts" = "avataaars"
): string {
  const encoded = encodeURIComponent(seed || "anonymous");
  return `https://api.dicebear.com/9.x/${style}/svg?seed=${encoded}`;
}
