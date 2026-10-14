import { PhasePlaceholder } from "@/components/PhasePlaceholder";

export default function EventsPage() {
  return (
    <PhasePlaceholder
      phase={6}
      titleBn="ইভেন্ট ও স্কুল নেটওয়ার্ক"
      titleEn="Events & School Network"
      descBn="কেন্দ্রীয় ইভেন্ট ক্যালেন্ডার, QR ই-পাস এবং স্কুল ম্যাথ ক্লাব পার্টনার রেজিস্ট্রি।"
      descEn="Central event calendar, QR e-pass generator and school math club partner registry."
      checklist={[
        { bn: "ইভেন্ট ক্যালেন্ডার ও ই-পাস QR", en: "Event calendar & e-pass QR" },
        { bn: "স্কুল ম্যাথ ক্লাব রেজিস্ট্রেশন", en: "School math club registration" },
        { bn: "ক্যাম্পাস ডিরেক্টরি", en: "Campus directory" },
      ]}
    />
  );
}