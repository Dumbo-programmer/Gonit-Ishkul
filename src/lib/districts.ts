export type Division =
  | "Dhaka"
  | "Chattogram"
  | "Rajshahi"
  | "Khulna"
  | "Barishal"
  | "Sylhet"
  | "Rangpur"
  | "Mymensingh";

export interface District {
  bn: string;
  en: string;
  division: Division;
}

export const DIVISIONS: { bn: string; en: Division }[] = [
  { en: "Dhaka", bn: "ঢাকা" },
  { en: "Chattogram", bn: "চট্টগ্রাম" },
  { en: "Rajshahi", bn: "রাজশাহী" },
  { en: "Khulna", bn: "খুলনা" },
  { en: "Barishal", bn: "বরিশাল" },
  { en: "Sylhet", bn: "সিলেট" },
  { en: "Rangpur", bn: "রংপুর" },
  { en: "Mymensingh", bn: "ময়মনসিংহ" },
];

export const DISTRICTS: District[] = [
  // Dhaka
  { en: "Dhaka", bn: "ঢাকা", division: "Dhaka" },
  { en: "Faridpur", bn: "ফরিদপুর", division: "Dhaka" },
  { en: "Gazipur", bn: "গাজীপুর", division: "Dhaka" },
  { en: "Gopalganj", bn: "গোপালগঞ্জ", division: "Dhaka" },
  { en: "Kishoreganj", bn: "কিশোরগঞ্জ", division: "Dhaka" },
  { en: "Madaripur", bn: "মাদারীপুর", division: "Dhaka" },
  { en: "Manikganj", bn: "মানিকগঞ্জ", division: "Dhaka" },
  { en: "Munshiganj", bn: "মুন্সিগঞ্জ", division: "Dhaka" },
  { en: "Narayanganj", bn: "নারায়ণগঞ্জ", division: "Dhaka" },
  { en: "Narsingdi", bn: "নরসিংদী", division: "Dhaka" },
  { en: "Rajbari", bn: "রাজবাড়ী", division: "Dhaka" },
  { en: "Shariatpur", bn: "শরীয়তপুর", division: "Dhaka" },
  { en: "Tangail", bn: "টাঙ্গাইল", division: "Dhaka" },
  // Chattogram
  { en: "Bandarban", bn: "বান্দরবান", division: "Chattogram" },
  { en: "Brahmanbaria", bn: "ব্রাহ্মণবাড়িয়া", division: "Chattogram" },
  { en: "Chandpur", bn: "চাঁদপুর", division: "Chattogram" },
  { en: "Chattogram", bn: "চট্টগ্রাম", division: "Chattogram" },
  { en: "Cumilla", bn: "কুমিল্লা", division: "Chattogram" },
  { en: "Cox's Bazar", bn: "কক্সবাজার", division: "Chattogram" },
  { en: "Feni", bn: "ফেনী", division: "Chattogram" },
  { en: "Khagrachhari", bn: "খাগড়াছড়ি", division: "Chattogram" },
  { en: "Lakshmipur", bn: "লক্ষ্মীপুর", division: "Chattogram" },
  { en: "Noakhali", bn: "নোয়াখালী", division: "Chattogram" },
  { en: "Rangamati", bn: "রাঙ্গামাটি", division: "Chattogram" },
  // Rajshahi
  { en: "Bogura", bn: "বগুড়া", division: "Rajshahi" },
  { en: "Chapainawabganj", bn: "চাঁপাইনবাবগঞ্জ", division: "Rajshahi" },
  { en: "Joypurhat", bn: "জয়পুরহাট", division: "Rajshahi" },
  { en: "Naogaon", bn: "নওগাঁ", division: "Rajshahi" },
  { en: "Natore", bn: "নাটোর", division: "Rajshahi" },
  { en: "Pabna", bn: "পাবনা", division: "Rajshahi" },
  { en: "Rajshahi", bn: "রাজশাহী", division: "Rajshahi" },
  { en: "Sirajganj", bn: "সিরাজগঞ্জ", division: "Rajshahi" },
  // Khulna
  { en: "Bagerhat", bn: "বাগেরহাট", division: "Khulna" },
  { en: "Chuadanga", bn: "চুয়াডাঙ্গা", division: "Khulna" },
  { en: "Jashore", bn: "যশোর", division: "Khulna" },
  { en: "Jhenaidah", bn: "ঝিনাইদহ", division: "Khulna" },
  { en: "Khulna", bn: "খুলনা", division: "Khulna" },
  { en: "Kushtia", bn: "কুষ্টিয়া", division: "Khulna" },
  { en: "Magura", bn: "মাগুরা", division: "Khulna" },
  { en: "Meherpur", bn: "মেহেরপুর", division: "Khulna" },
  { en: "Narail", bn: "নড়াইল", division: "Khulna" },
  { en: "Satkhira", bn: "সাতক্ষীরা", division: "Khulna" },
  // Barishal
  { en: "Barguna", bn: "বরগুনা", division: "Barishal" },
  { en: "Barishal", bn: "বরিশাল", division: "Barishal" },
  { en: "Bhola", bn: "ভোলা", division: "Barishal" },
  { en: "Jhalokati", bn: "ঝালকাঠি", division: "Barishal" },
  { en: "Patuakhali", bn: "পটুয়াখালী", division: "Barishal" },
  { en: "Pirojpur", bn: "পিরোজপুর", division: "Barishal" },
  // Sylhet
  { en: "Habiganj", bn: "হবিগঞ্জ", division: "Sylhet" },
  { en: "Moulvibazar", bn: "মৌলভীবাজার", division: "Sylhet" },
  { en: "Sunamganj", bn: "সুনামগঞ্জ", division: "Sylhet" },
  { en: "Sylhet", bn: "সিলেট", division: "Sylhet" },
  // Rangpur
  { en: "Dinajpur", bn: "দিনাজপুর", division: "Rangpur" },
  { en: "Gaibandha", bn: "গাইবান্ধা", division: "Rangpur" },
  { en: "Kurigram", bn: "কুড়িগ্রাম", division: "Rangpur" },
  { en: "Lalmonirhat", bn: "লালমনিরহাট", division: "Rangpur" },
  { en: "Nilphamari", bn: "নীলফামারী", division: "Rangpur" },
  { en: "Panchagarh", bn: "পঞ্চগড়", division: "Rangpur" },
  { en: "Rangpur", bn: "রংপুর", division: "Rangpur" },
  { en: "Thakurgaon", bn: "ঠাকুরগাঁও", division: "Rangpur" },
  // Mymensingh
  { en: "Jamalpur", bn: "জামালপুর", division: "Mymensingh" },
  { en: "Mymensingh", bn: "ময়মনসিংহ", division: "Mymensingh" },
  { en: "Netrokona", bn: "নেত্রকোণা", division: "Mymensingh" },
  { en: "Sherpur", bn: "শেরপুর", division: "Mymensingh" },
];

export const DISTRICT_BY_EN = new Map(DISTRICTS.map((d) => [d.en, d]));

export const DIVISION_COLORS: Record<Division, string> = {
  Dhaka: "#FF781E",
  Chattogram: "#1B4594",
  Rajshahi: "#7952B3",
  Khulna: "#ED1C24",
  Barishal: "#9E80D2",
  Sylhet: "#0E7490",
  Rangpur: "#B45309",
  Mymensingh: "#15803D",
};
