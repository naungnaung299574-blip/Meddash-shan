import type { Metadata } from "next";
import "./globals.css"; // Tailwind နှင့် Custom CSS များပါဝင်မည်

export const metadata: Metadata = {
  title: "MedDash Cloud Pro Edition",
  description: "ရှမ်းပြည်နယ်(တောင်ပိုင်း)ပြည်နယ်ကုသရေးဦးစီးဌာန",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="my">
      <head>
        {/* FontAwesome */}
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" />
        {/* Pyidaungsu Font */}
        <style>
          {`@import url('https://mmwebfonts.comquas.com/fonts/?font=pyidaungsu');`}
        </style>
      </head>
      <body className="bg-slate-50 text-slate-900 overflow-x-hidden" style={{ fontFamily: "'Pyidaungsu', sans-serif" }}>
        {children}
      </body>
    </html>
  );
}