import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import { ToastProvider } from "@/context/ToastContext";
import { LanguageProvider } from "@/context/LanguageContext";
import { TrainingSessionProvider } from "@/context/TrainingSessionContext";
import PWARegister from "@/components/PWARegister";
import ReminderScheduler from "@/components/ReminderScheduler";
import PingsListener from "@/components/PingsListener";
import TrainingSessionOverlays from "@/components/TrainingSessionOverlays";
import LocaleSync from "@/components/LocaleSync";
import DemoBadge from "@/components/DemoBadge";
import RemoteConfigLoader from "@/components/RemoteConfigLoader";
import SkipLink from "@/components/SkipLink";
import { SPLASH_IMAGES } from "@/lib/splashImages";
import TitleSync from "@/components/TitleSync";
import AchievementWatcher from "@/components/AchievementWatcherLazy";
import OnlineStatus from "@/components/OnlineStatus";
import StatusIcon from "@/components/StatusIcon";
import QuickActions from "@/components/nav/QuickActions";
import ScrollToHash from "@/components/ScrollToHash";
import { SITE_DESCRIPTION, SITE_KEYWORDS, SITE_NAME, SITE_TITLE, SITE_URL } from "@/lib/site";

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: SITE_TITLE, template: `%s · ${SITE_NAME}` },
  description: SITE_DESCRIPTION,
  applicationName: SITE_NAME,
  keywords: SITE_KEYWORDS,
  category: "fitness",
  manifest: "/manifest.json",
  // the share picture comes from app/opengraph-image.tsx
  openGraph: {
    type: "website",
    siteName: SITE_NAME,
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    url: "/",
    locale: "en_US",
    alternateLocale: ["it_IT"],
  },
  twitter: { card: "summary_large_image", title: SITE_TITLE, description: SITE_DESCRIPTION },
  formatDetection: { telephone: false },
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "BarQuests",
    startupImage: SPLASH_IMAGES,
  },
  other: {
    // Chromium's older/alternate check for standalone display, alongside
    // the manifest — belt-and-suspenders so an installed PWA never shows
    // the browser's address bar regardless of exact engine/version.
    "mobile-web-app-capable": "yes",
  },
  icons: {
    icon: [
      { url: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [{ url: "/icons/apple-touch-icon.png", sizes: "180x180", type: "image/png" }],
  },
};

export const viewport: Viewport = {
  themeColor: "#09090b",
  width: "device-width",
  initialScale: 1,
  // no maximumScale: people must be able to pinch-zoom (WCAG 1.4.4)
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={inter.variable} suppressHydrationWarning>
      <body className="font-sans min-h-screen antialiased" suppressHydrationWarning>
        <ToastProvider>
          <LanguageProvider>
            <SkipLink />
            <TitleSync />
            <AuthProvider>
              <TrainingSessionProvider>
                {children}
                <ReminderScheduler />
                <PingsListener />
                <AchievementWatcher />
                <OnlineStatus />
                <StatusIcon />
                <QuickActions />
                <ScrollToHash />
                <TrainingSessionOverlays />
                <LocaleSync />
              </TrainingSessionProvider>
            </AuthProvider>
          </LanguageProvider>
        </ToastProvider>
        <PWARegister />
        <DemoBadge />
        <RemoteConfigLoader />
      </body>
    </html>
  );
}
