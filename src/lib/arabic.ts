// Makes Arabic text comparable for search. The same name gets typed with
// different alef and hamza forms, with or without diacritics, and sometimes
// with Arabic-Indic digits, so all of those are folded to one spelling before
// anything is compared.

const diacritics = /[ً-ٰٟ]/g;
const tatweel = /ـ/g;
const arabicIndicDigits = "٠١٢٣٤٥٦٧٨٩";
const easternArabicDigits = "۰۱۲۳۴۵۶۷۸۹";

export function normalizeArabic(value: string): string {
  return value
    .normalize("NFKC")
    .replace(diacritics, "")
    .replace(tatweel, "")
    .replace(/[أإآٱ]/g, "ا")
    .replace(/ى/g, "ي")
    .replace(/ة/g, "ه")
    .replace(/ؤ/g, "و")
    .replace(/ئ/g, "ي")
    .replace(/[٠-٩]/g, (digit) => String(arabicIndicDigits.indexOf(digit)))
    .replace(/[۰-۹]/g, (digit) => String(easternArabicDigits.indexOf(digit)))
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim();
}

export function matchesSearch(text: string, query: string): boolean {
  const needle = normalizeArabic(query);

  if (needle.length === 0) {
    return true;
  }

  return normalizeArabic(text).includes(needle);
}
