// The fixed lists the registration form offers. Each entry keeps a stable key
// for the database and a label per language, so stored records never depend on
// which language the agent happened to be using.

export type Locale = "ar" | "fr";

export type Option = {
  key: string;
  ar: string;
  fr: string;
};

// Arabic marital status changes with gender, so both forms are kept.
export type GenderedOption = {
  key: string;
  ar: { male: string; female: string };
  fr: { male: string; female: string };
};

export const wilayas: Option[] = [
  { key: "hodh_ech_chargui", ar: "الحوض الشرقي", fr: "Hodh Ech Chargui" },
  { key: "hodh_el_gharbi", ar: "الحوض الغربي", fr: "Hodh El Gharbi" },
  { key: "assaba", ar: "لعصابة", fr: "Assaba" },
  { key: "gorgol", ar: "كوركول", fr: "Gorgol" },
  { key: "brakna", ar: "لبراكنة", fr: "Brakna" },
  { key: "trarza", ar: "اترارزة", fr: "Trarza" },
  { key: "adrar", ar: "أدرار", fr: "Adrar" },
  {
    key: "dakhlet_nouadhibou",
    ar: "داخلت نواذيبو",
    fr: "Dakhlet Nouadhibou",
  },
  { key: "tagant", ar: "تكانت", fr: "Tagant" },
  { key: "guidimaka", ar: "كيدي ماغا", fr: "Guidimaka" },
  { key: "tiris_zemmour", ar: "تيرس زمور", fr: "Tiris Zemmour" },
  { key: "inchiri", ar: "إينشيري", fr: "Inchiri" },
  { key: "nouakchott_nord", ar: "نواكشوط الشمالية", fr: "Nouakchott Nord" },
  { key: "nouakchott_ouest", ar: "نواكشوط الغربية", fr: "Nouakchott Ouest" },
  { key: "nouakchott_sud", ar: "نواكشوط الجنوبية", fr: "Nouakchott Sud" },
  { key: "outside", ar: "خارج موريتانيا", fr: "Hors de Mauritanie" },
];

export const educationLevels: Option[] = [
  { key: "none", ar: "بدون", fr: "Aucun" },
  { key: "mahadra", ar: "محظرة", fr: "Mahadra" },
  { key: "primary", ar: "ابتدائي", fr: "Primaire" },
  { key: "middle", ar: "إعدادي", fr: "Collège" },
  { key: "secondary", ar: "ثانوي", fr: "Secondaire" },
  { key: "university", ar: "جامعي", fr: "Universitaire" },
  { key: "postgraduate", ar: "دراسات عليا", fr: "Études supérieures" },
  { key: "other", ar: "أخرى", fr: "Autre" },
];

// Keys match the marital_status check constraint in the database.
export const maritalStatuses: GenderedOption[] = [
  {
    key: "single",
    ar: { male: "أعزب", female: "عزباء" },
    fr: { male: "Célibataire", female: "Célibataire" },
  },
  {
    key: "married",
    ar: { male: "متزوج", female: "متزوجة" },
    fr: { male: "Marié", female: "Mariée" },
  },
  {
    key: "divorced",
    ar: { male: "مطلق", female: "مطلقة" },
    fr: { male: "Divorcé", female: "Divorcée" },
  },
  {
    key: "widowed",
    ar: { male: "أرمل", female: "أرملة" },
    fr: { male: "Veuf", female: "Veuve" },
  },
];

export const wilayaKeys = wilayas.map((wilaya) => wilaya.key);
export const educationKeys = educationLevels.map((level) => level.key);
export const maritalStatusKeys = maritalStatuses.map((status) => status.key);

export function labelFor(option: Option, locale: Locale): string {
  return option[locale];
}

export function maritalLabelFor(
  option: GenderedOption,
  locale: Locale,
  gender: "male" | "female"
): string {
  return option[locale][gender];
}

// Ages at which extra fields appear on a child's form.
export const phoneAndMarriageAge = 15;
export const jobAge = 18;

export const phonePrefix = "+222";
