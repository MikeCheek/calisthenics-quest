"use client";

import { useEffect, useRef } from "react";
import { useAuth } from "@/context/AuthContext";
import { useLanguage } from "@/context/LanguageContext";

export default function LocaleSync() {
  const { userDoc } = useAuth();
  const { setLocale } = useLanguage();
  const synced = useRef(false);

  useEffect(() => {
    if (synced.current) return;
    if (userDoc?.locale === "en" || userDoc?.locale === "it") {
      setLocale(userDoc.locale);
      synced.current = true;
    }
  }, [userDoc, setLocale]);

  return null;
}
