import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'ZELENAYA — Цветочный магазин',
  description: 'Свежие цветы, красивые букеты и оперативная доставка. Дарим цветы с любовью.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru">
      <body className="min-h-screen flex flex-col bg-[#f7fbf4]">
        {children}
      </body>
    </html>
  );
}
