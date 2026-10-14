"use client";

import Image from "next/image";
import Link from "next/link";
import { Facebook, Globe, Mail, MapPin, Phone } from "lucide-react";
import { useLang } from "@/lib/i18n/LangContext";

export function SiteFooter() {
  const { t } = useLang();

  return (
    <footer className="mt-20 bg-brand-blue text-white">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 md:grid-cols-3">
        <div>
          <Image
            src="/brand/logo.png"
            alt="Prothom Alo Gonit Ishkul"
            width={64}
            height={64}
            className="mb-4 h-16 w-16 rounded-full bg-white object-contain p-1"
          />
          <p className="text-sm leading-relaxed text-white/85">{t("footer.about")}</p>
        </div>

        <div>
          <h3 className="mb-4 text-lg font-bold text-brand-orange">
            {t("footer.quickLinks")}
          </h3>
          <ul className="space-y-2 text-sm text-white/85">
            <li>
              <Link href="/gonit-doot" className="hover:text-brand-orange">
                {t("common.ambassador")}
              </Link>
            </li>
            <li>
              <Link href="/gonit-doot/status" className="hover:text-brand-orange">
                {t("doot.statusBadge")}
              </Link>
            </li>
            <li>
              <Link href="/courses" className="hover:text-brand-orange">
                {t("common.courses")}
              </Link>
            </li>
            <li>
              <Link href="/contests" className="hover:text-brand-orange">
                {t("common.contests")}
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <h3 className="mb-4 text-lg font-bold text-brand-orange">
            {t("footer.contact")}
          </h3>
          <ul className="space-y-3 text-sm text-white/85">
            <li className="flex items-center gap-2">
              <Mail className="h-4 w-4 text-brand-orange" />
              <a href="mailto:gonitishkul@prothomalo.com" className="hover:text-brand-orange">
                gonitishkul@prothomalo.com
              </a>
            </li>
            <li className="flex items-center gap-2">
              <Phone className="h-4 w-4 text-brand-orange" />
              <span>01521-718070</span>
            </li>
            <li className="flex items-center gap-2">
              <Globe className="h-4 w-4 text-brand-orange" />
              <a
                href="https://www.prothomalo.com/topic/%E0%A6%97%E0%A6%A3%E0%A6%BF%E0%A6%A4-%E0%A6%87%E0%A6%B6%E0%A6%95%E0%A7%81%E0%A6%B2"
                target="_blank"
                rel="noreferrer"
                className="hover:text-brand-orange"
              >
                {t("footer.topicPage")}
              </a>
            </li>
            <li className="flex items-center gap-2">
              <Facebook className="h-4 w-4 text-brand-orange" />
              <a
                href="https://www.facebook.com/PA.GonitIshkul/"
                target="_blank"
                rel="noreferrer"
                className="hover:text-brand-orange"
              >
                {t("footer.facebook")}
              </a>
            </li>
            <li className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-brand-orange" />
              <span>Dhaka, Bangladesh</span>
            </li>
          </ul>
        </div>
      </div>
      <div className="border-t border-white/15 py-5 text-center text-xs text-white/70">
        © {new Date().getFullYear()} Prothom Alo Gonit Ishkul. {t("footer.rights")}.
      </div>
    </footer>
  );
}