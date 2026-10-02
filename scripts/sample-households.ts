// Invented households used only by npm run seed-households.
// No real person, NNI or phone number appears here.

export type SeedHousehold = {
  familyName: string;
  smallFamily: string;
  wilaya: string;
  city: string;
  status: "draft" | "complete";
  father: string;
  mother: string;
  children: string[];
};

export const sampleHouseholds: SeedHousehold[] = [
  {
    familyName: "أسرة محمد ولد أحمد",
    smallFamily: "أولاد الشيخ",
    wilaya: "nouakchott_nord",
    city: "نواكشوط",
    status: "complete",
    father: "محمد ولد أحمد",
    mother: "مريم بنت سيدي",
    children: ["أحمد ولد محمد", "فاطمة بنت محمد", "سالم ولد محمد"],
  },
  {
    familyName: "أسرة سيدي ولد المختار",
    smallFamily: "أولاد محمدن",
    wilaya: "nouakchott_ouest",
    city: "نواكشوط",
    status: "complete",
    father: "سيدي ولد المختار",
    mother: "خديجة بنت أحمدو",
    children: ["المختار ولد سيدي", "عائشة بنت سيدي"],
  },
  {
    familyName: "أسرة عبد الله ولد بابا",
    smallFamily: "أولاد البخاري",
    wilaya: "dakhlet_nouadhibou",
    city: "نواذيبو",
    status: "complete",
    father: "عبد الله ولد بابا",
    mother: "زينب بنت محمود",
    children: [
      "بابا ولد عبد الله",
      "مريم بنت عبد الله",
      "أحمد ولد عبد الله",
      "سلمى بنت عبد الله",
    ],
  },
  {
    familyName: "أسرة أحمدو ولد سالم",
    smallFamily: "أولاد سالم",
    wilaya: "brakna",
    city: "ألاك",
    status: "complete",
    father: "أحمدو ولد سالم",
    mother: "توتة بنت اليدالي",
    children: ["سالم ولد أحمدو"],
  },
  {
    familyName: "أسرة الداه ولد محمد الأمين",
    smallFamily: "أولاد الداه",
    wilaya: "trarza",
    city: "روصو",
    status: "complete",
    father: "الداه ولد محمد الأمين",
    mother: "أم كلثوم بنت الشيخ",
    children: ["محمد الأمين ولد الداه", "حواء بنت الداه"],
  },
  {
    familyName: "أسرة سيد أحمد ولد عالي",
    smallFamily: "أولاد سيدي",
    wilaya: "tagant",
    city: "تجكجة",
    status: "draft",
    father: "سيد أحمد ولد عالي",
    mother: "منت فاطمة بنت عالي",
    children: ["عالي ولد سيد أحمد"],
  },
];
