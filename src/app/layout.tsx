import type { Metadata } from "next";
import { Great_Vibes, Cinzel, Lato } from "next/font/google";
import "./globals.css";

const greatVibes = Great_Vibes({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-great-vibes",
});

const cinzel = Cinzel({
  subsets: ["latin"],
  variable: "--font-cinzel",
});

const lato = Lato({
  weight: ["300", "400", "700"],
  subsets: ["latin"],
  variable: "--font-lato",
});


export const metadata: Metadata = {
  title: "Convite de Casamento",
  description: "Junte-se a nós neste dia especial",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body
        className={`${greatVibes.variable} ${cinzel.variable} ${lato.variable} antialiased bg-[#fdfbf7] text-[#4a4a4a]`}
      >
        {children}
      </body>
    </html>
  );
}
