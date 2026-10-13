// 입력된 번호를 한국식 하이픈 형식으로 정리 (예: 01012345678 -> 010-1234-5678)
export function formatPhone(input: string): string {
  const d = input.replace(/\D/g, "");
  if (d.startsWith("02")) {
    if (d.length <= 2) return d;
    if (d.length <= 5) return `${d.slice(0, 2)}-${d.slice(2)}`;
    if (d.length <= 9) return `${d.slice(0, 2)}-${d.slice(2, 5)}-${d.slice(5)}`;
    return `${d.slice(0, 2)}-${d.slice(2, 6)}-${d.slice(6, 10)}`;
  }
  if (d.length === 8 && /^1[5-9]/.test(d)) return `${d.slice(0, 4)}-${d.slice(4)}`; // 1588-xxxx
  if (d.length <= 3) return d;
  if (d.length <= 6) return `${d.slice(0, 3)}-${d.slice(3)}`;
  if (d.length <= 10) return `${d.slice(0, 3)}-${d.slice(3, 6)}-${d.slice(6)}`;
  return `${d.slice(0, 3)}-${d.slice(3, 7)}-${d.slice(7, 11)}`;
}

export function digitsOnly(input: string): string {
  return input.replace(/\D/g, "");
}
