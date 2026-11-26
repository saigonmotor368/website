const DIGITS = ["không", "một", "hai", "ba", "bốn", "năm", "sáu", "bảy", "tám", "chín"];
const SCALES = ["", "nghìn", "triệu", "tỷ", "nghìn tỷ", "triệu tỷ"];

function readThreeDigits(num: number, showZeroHundreds: boolean): string {
  const hundreds = Math.floor(num / 100);
  const tens = Math.floor((num % 100) / 10);
  const ones = num % 10;
  const parts: string[] = [];

  if (hundreds > 0 || showZeroHundreds) {
    parts.push(`${DIGITS[hundreds]} trăm`);
    if (tens === 0 && ones > 0) {
      parts.push("lẻ");
    }
  }

  if (tens > 1) {
    parts.push(`${DIGITS[tens]} mươi`);
    if (ones === 1) {
      parts.push("mốt");
    } else if (ones === 4) {
      parts.push("tư");
    } else if (ones === 5) {
      parts.push("lăm");
    } else if (ones > 0) {
      parts.push(DIGITS[ones]);
    }
  } else if (tens === 1) {
    parts.push("mười");
    if (ones === 5) {
      parts.push("lăm");
    } else if (ones > 0) {
      parts.push(DIGITS[ones]);
    }
  } else if (ones > 0) {
    parts.push(DIGITS[ones]);
  }

  return parts.join(" ");
}

/**
 * Convert an integer VND amount into standard Vietnamese accounting words.
 */
export function formatMoneyToVietnameseWords(amount: number): string {
  const rounded = Math.round(Number(amount) || 0);
  if (rounded <= 0) return "Không đồng";

  const groups: number[] = [];
  let remaining = rounded;
  while (remaining > 0) {
    groups.push(remaining % 1000);
    remaining = Math.floor(remaining / 1000);
  }

  const segments: string[] = [];
  for (let i = groups.length - 1; i >= 0; i -= 1) {
    const groupVal = groups[i];
    if (groupVal === 0) continue;
    const isHighestGroup = i === groups.length - 1;
    const text = readThreeDigits(groupVal, !isHighestGroup);
    const scale = SCALES[i] ? ` ${SCALES[i]}` : "";
    segments.push(`${text}${scale}`);
  }

  const joined = segments.join(" ").replace(/\s+/g, " ").trim();
  if (!joined) return "Không đồng";
  return `${joined.charAt(0).toUpperCase()}${joined.slice(1)} đồng chẵn`;
}
