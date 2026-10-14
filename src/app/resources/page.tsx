import { PhasePlaceholder } from "@/components/PhasePlaceholder";

export default function ResourcesPage() {
  return (
    <PhasePlaceholder
      phase={4}
      titleBn="রিসোর্স ও অলিম্পিয়াড লাইব্রেরি"
      titleEn="Resource & Olympiad Library"
      descBn="BdMO বিগত সালের প্রশ্নপত্র, উত্তরপত্র, স্টাডি ট্র্যাক এবং KaTeX/LaTeX সমীকরণ রেন্ডারিং।"
      descEn="Downloadable BdMO past papers, answer keys, study tracks and global KaTeX/LaTeX rendering."
      checklist={[
        { bn: "BdMO প্রশ্নপত্র ও উত্তরপত্র ডাউনলোড", en: "Downloadable BdMO papers & answer keys" },
        { bn: "স্টাডি ট্র্যাক ও বইয়ের তালিকা", en: "Study tracks & recommended booklists" },
        { bn: "KaTeX / LaTeX রেন্ডারার", en: "KaTeX / LaTeX renderer" },
      ]}
    />
  );
}