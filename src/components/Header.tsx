'use client';

import Link from 'next/link';
import { ShoppingBag, Phone, Menu, X } from 'lucide-react';
import { useCart } from './CartProvider';
import { useState } from 'react';

export default function Header() {
  const { totalItems } = useCart();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center">
            <img src="/logo-zelenaya.svg" alt="ZELENAYA" className="h-12 w-auto" />
          </Link>

          <nav className="hidden md:flex items-center gap-8">
            <Link href="/catalog" className="text-gray-600 hover:text-green-600 transition-colors text-sm font-medium">
              Каталог
            </Link>
            <Link href="/about" className="text-gray-600 hover:text-green-600 transition-colors text-sm font-medium">
              О компании
            </Link>
            <Link href="/order-terms" className="text-gray-600 hover:text-green-600 transition-colors text-sm font-medium">
              Условия заказа
            </Link>
            <Link href="/reviews" className="text-gray-600 hover:text-green-600 transition-colors text-sm font-medium">
              Отзывы
            </Link>
          </nav>

          <div className="flex items-center gap-4">
            <a href="tel:+79991234567" className="hidden md:flex items-center gap-1.5 text-sm text-gray-600 hover:text-green-600 transition-colors">
              <Phone size={16} />
              <span>+7 (999) 123-45-67</span>
            </a>

            <Link href="/cart" className="relative p-2 text-gray-600 hover:text-green-600 transition-colors">
              <ShoppingBag size={22} />
              {totalItems > 0 && (
                <span className="absolute -top-0.5 -right-0.5 bg-green-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-medium">
                  {totalItems > 9 ? '9+' : totalItems}
                </span>
              )}
            </Link>

            <button
              className="md:hidden p-2 text-gray-600"
              onClick={() => setMenuOpen(!menuOpen)}
            >
              {menuOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>

        {menuOpen && (
          <div className="md:hidden border-t border-gray-100 py-4 space-y-3">
            <Link href="/catalog" className="block py-2 text-gray-700 hover:text-green-600 font-medium" onClick={() => setMenuOpen(false)}>Каталог</Link>
            <Link href="/about" className="block py-2 text-gray-700 hover:text-green-600 font-medium" onClick={() => setMenuOpen(false)}>О компании</Link>
            <Link href="/order-terms" className="block py-2 text-gray-700 hover:text-green-600 font-medium" onClick={() => setMenuOpen(false)}>Условия заказа</Link>
            <Link href="/reviews" className="block py-2 text-gray-700 hover:text-green-600 font-medium" onClick={() => setMenuOpen(false)}>Отзывы</Link>
            <a href="tel:+79991234567" className="flex items-center gap-2 py-2 text-gray-700">
              <Phone size={16} /> +7 (999) 123-45-67
            </a>
          </div>
        )}
      </div>
    </header>
  );
}
