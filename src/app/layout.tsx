import type { Metadata } from "next";
import { Inter, Merriweather } from "next/font/google";
import "./globals.css";
import MediumLayout from "@/components/layout/MediumLayout";
import { AuthProvider } from "@/components/providers/AuthProvider";
import { ThemeProvider } from "@/components/providers/ThemeProvider";
import EmailVerificationWrapper from "@/components/auth/EmailVerificationWrapper";
import { getAllUniqueTags } from "@/lib/sanity/queries";

// T004: Load Medium-style fonts
const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-sans",
});

const merriweather = Merriweather({
  weight: ["300", "400", "700", "900"],
  subsets: ["latin"],
  display: "swap",
  variable: "--font-serif",
});

export const metadata: Metadata = {
  title: "Victor's Alpha - 암호화폐 투자 인사이트",
  description: "실패와 성공에서 배우는 암호화폐 투자 전략. DeFi, NFT, 시장 분석까지",
  keywords: ["암호화폐", "투자", "비트코인", "이더리움", "DeFi", "NFT", "블록체인"],
  authors: [{ name: "Victor's Alpha" }],
  openGraph: {
    title: "Victor's Alpha - 암호화폐 투자 인사이트",
    description: "실패와 성공에서 배우는 암호화폐 투자 전략",
    type: "website",
    locale: "ko_KR",
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const tags = await getAllUniqueTags();

  return (
    <html lang="ko" suppressHydrationWarning>
      <body className={`${inter.variable} ${merriweather.variable} font-sans antialiased transition-colors`}>
        <ThemeProvider>
          <AuthProvider>
            <EmailVerificationWrapper>
              <MediumLayout tags={tags}>
                {children}
              </MediumLayout>
            </EmailVerificationWrapper>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
