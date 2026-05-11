import Link from 'next/link';
import { Phone, Mail, MapPin, Clock } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-green-900 text-green-100 mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <img src="/logo-zelenaya.svg" alt="ZELENAYA" className="h-16 w-auto mb-4 brightness-0 invert" />
            <p className="text-green-200 text-sm leading-relaxed">
              Доставляем свежие цветы и красивые букеты по всему городу. Работаем с любовью к каждому клиенту.
            </p>
          </div>

          <div>
            <h3 className="text-white font-semibold mb-4">Навигация</h3>
            <ul className="space-y-2 text-sm">
              <li><Link href="/catalog" className="text-green-200 hover:text-white transition-colors">Каталог цветов</Link></li>
              <li><Link href="/about" className="text-green-200 hover:text-white transition-colors">О компании</Link></li>
              <li><Link href="/order-terms" className="text-green-200 hover:text-white transition-colors">Условия заказа</Link></li>
              <li><Link href="/reviews" className="text-green-200 hover:text-white transition-colors">Отзывы</Link></li>
              <li><Link href="/cart" className="text-green-200 hover:text-white transition-colors">Корзина</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="text-white font-semibold mb-4">Контакты</h3>
            <ul className="space-y-3 text-sm">
              <li className="flex items-center gap-2 text-green-200">
                <Phone size={15} />
                <a href="tel:+79991234567" className="hover:text-white transition-colors">+7 (999) 123-45-67</a>
              </li>
              <li className="flex items-center gap-2 text-green-200">
                <Mail size={15} />
                <a href="mailto:hello@zelenaya.ru" className="hover:text-white transition-colors">hello@zelenaya.ru</a>
              </li>
              <li className="flex items-start gap-2 text-green-200">
                <MapPin size={15} className="mt-0.5 shrink-0" />
                <span>г. Екатеринбург, ул. Цветочная, 12</span>
              </li>
              <li className="flex items-center gap-2 text-green-200">
                <Clock size={15} />
                <span>Пн–Вс: 8:00–22:00</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-green-800 mt-8 pt-6 text-center text-green-300 text-xs">
          © {new Date().getFullYear()} ZELENAYA. Дипломная работа.
        </div>
      </div>
    </footer>
  );
}
