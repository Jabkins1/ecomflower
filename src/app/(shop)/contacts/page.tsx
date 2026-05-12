import { Phone, MapPin, Clock, Navigation, MessageCircle, Send } from 'lucide-react';

export default function ContactsPage() {
  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
      <div className="text-center mb-10">
        <p className="text-green-500 font-medium text-sm uppercase tracking-widest mb-3">Контакты</p>
        <h1 className="text-4xl font-bold text-gray-900 mb-3">Как нас найти</h1>
        <p className="text-gray-500 max-w-2xl mx-auto">
          Приходите в наш магазин или свяжитесь с нами любым удобным способом
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_1fr] gap-8 mb-10">
        {/* Info cards */}
        <div className="space-y-4">
          <div className="bg-white rounded-3xl p-6 shadow-sm">
            <div className="flex items-start gap-4">
              <div className="bg-green-50 p-3 rounded-2xl shrink-0">
                <MapPin className="text-green-500" size={24} />
              </div>
              <div>
                <h3 className="font-bold text-gray-900 mb-1">Адрес</h3>
                <p className="text-gray-600">г. Екатеринбург, ул. Машинная, 1В/2</p>
                <p className="text-gray-400 text-sm mt-1">Ближайшее метро: Чкаловская, Ботаническая</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-3xl p-6 shadow-sm">
            <div className="flex items-start gap-4">
              <div className="bg-green-50 p-3 rounded-2xl shrink-0">
                <Phone className="text-green-500" size={24} />
              </div>
              <div>
                <h3 className="font-bold text-gray-900 mb-1">Телефон</h3>
                <a href="tel:+79014395500" className="text-green-600 hover:text-green-700 font-medium text-lg transition-colors">
                  +7 (901) 439-55-00
                </a>
                <div className="flex gap-3 mt-2">
                  <a href="https://wa.me/79014395500" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-sm text-green-600 hover:text-green-700 transition-colors">
                    <MessageCircle size={15} /> WhatsApp
                  </a>
                  <a href="https://t.me/ZelenayaCveti" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-sm text-green-600 hover:text-green-700 transition-colors">
                    <Send size={15} /> Telegram
                  </a>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-3xl p-6 shadow-sm">
            <div className="flex items-start gap-4">
              <div className="bg-green-50 p-3 rounded-2xl shrink-0">
                <Clock className="text-green-500" size={24} />
              </div>
              <div>
                <h3 className="font-bold text-gray-900 mb-1">Режим работы</h3>
                <ul className="text-gray-600 space-y-1">
                  <li className="flex justify-between gap-8"><span>Ежедневно</span><span className="font-medium">10:00–21:00</span></li>
                </ul>
              </div>
            </div>
          </div>

          <a
            href="https://yandex.ru/maps/org/tsvety/55849958151/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 bg-green-500 hover:bg-green-600 text-white py-3.5 px-6 rounded-2xl font-semibold transition-colors"
          >
            <Navigation size={18} />
            Построить маршрут на Яндекс Картах
          </a>
        </div>

        {/* Yandex Map embed */}
        <div className="bg-white rounded-3xl overflow-hidden shadow-sm min-h-[480px]">
          <iframe
            src="https://yandex.ru/map-widget/v1/?ol=biz&oid=55849958151&z=17"
            width="100%"
            height="100%"
            style={{ border: 0, minHeight: '480px' }}
            allowFullScreen
            loading="lazy"
          />
        </div>
      </div>
    </div>
  );
}
