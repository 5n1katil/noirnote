/**
 * NoirNote — Text key resolver
 *
 * Dot-notation string keys'i (örn: "cases.case001.title") actual text değerlerine çevirir.
 */

import { textsTR } from "./texts.tr";

/**
 * Text key'i (dot notation) gerçek metne çevir
 * Örnek: "cases.case001.title" -> textsTR.cases.case001.title
 */
export function getText(key: string): string {
  const keys = key.split(".");
  let value: any = textsTR;

  for (const k of keys) {
    if (value && typeof value === "object" && k in value) {
      value = value[k as keyof typeof value];
    } else {
      return key; // Fallback: key bulunamazsa key'i döndür
    }
  }

  return typeof value === "string" ? value : key;
}

