import { Clock, Truck, CreditCard, Phone, AlertCircle, CheckCircle } from 'lucide-react';
import Link from 'next/link';

export default function OrderTermsPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12">
      <div className="text-center mb-12">
        <p className="text-rose-500 font-medium text-sm uppercase tracking-widest mb-3">Информация</p>
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Условия оформления заказа</h1>
        <p className="text-gray-500 text-lg max-w-2xl mx-auto">
          Мы делаем процесс заказа максимально простым. Ознакомьтесь с нашими условиями.
        </p>
      </div>

      <div className="space-y-6">

        {/* How to order */}
        <div className="bg-white rounded-3xl p-8 shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <div className="bg-rose-100 p-3 rounded-2xl">
              <CheckCircle className="text-rose-500" size={24} />
            </div>
            <h2 className="text-xl font-bold text-gray-900">Как оформить заказ</h2>
          </div>
          <div className="space-y-4">
            {[
              { step: '1', text: 'Добавьте понравившиеся товары в корзину' },
              { step: '2', text: 'Перейдите в корзину и нажмите «Оформить заказ»' },
              { step: '3', text: 'Заполните форму: имя, телефон, желаемую дату и время получения' },
              { step: '4', text: 'Подтвердите заказ — мы свяжемся с вами для уточнения деталей' },
              { step: '5', text: 'После подтверждения наш флорист приступает к сборке букета' },
            ].map(({ step, text }) => (
              <div key={step} className="flex items-start gap-4">
                <span className="bg-rose-500 text-white w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold shrink-0">{step}</span>
                <p className="text-gray-600 pt-1">{text}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Pre-order */}
        <div className="bg-white rounded-3xl p-8 shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <div className="bg-rose-100 p-3 rounded-2xl">
              <Clock className="text-rose-500" size={24} />
            </div>
            <h2 className="text-xl font-bold text-gray-900">Предварительный заказ</h2>
          </div>
          <div className="space-y-4 text-gray-600">
            <p>
              Вы можете оформить <strong>предварительный заказ</strong> за 1–3 дня до нужной даты. Это особенно актуально для:
            </p>
            <ul className="space-y-2 ml-4">
              {[
                'Праздников и дней рождений',
                'Свадеб и торжественных событий',
                'Больших букетов из редких цветов',
                'Корпоративных заказов (от 5 букетов)',
              ].map(item => (
                <li key={item} className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-rose-400 rounded-full shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
            <div className="bg-rose-50 rounded-2xl p-4 mt-4">
              <p className="text-rose-700 text-sm">
                <strong>Важно:</strong> При предварительном заказе укажите желаемую дату и время в форме заказа. 
                Мы свяжемся с вами для подтверждения наличия цветов.
              </p>
            </div>
          </div>
        </div>

        {/* Delivery */}
        <div className="bg-white rounded-3xl p-8 shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <div className="bg-rose-100 p-3 rounded-2xl">
              <Truck className="text-rose-500" size={24} />
            </div>
            <h2 className="text-xl font-bold text-gray-900">Доставка</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              { title: 'По городу', desc: 'В течение 2–3 часов с момента подтверждения заказа', price: '300 ₽' },
              { title: 'Срочная доставка', desc: 'За 1–1.5 часа (при наличии доступных курьеров)', price: '500 ₽' },
              { title: 'Самовывоз', desc: 'г. Екатеринбург, ул. Цветочная, 12. Готовность через 1.5–2 ч', price: 'Бесплатно' },
              { title: 'За пределы города', desc: 'Рассчитывается индивидуально, уточняйте по телефону', price: 'От 800 ₽' },
            ].map(({ title, desc, price }) => (
              <div key={title} className="border border-gray-100 rounded-2xl p-4">
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-semibold text-gray-800">{title}</h4>
                  <span className="text-rose-500 font-semibold text-sm">{price}</span>
                </div>
                <p className="text-gray-500 text-sm">{desc}</p>
              </div>
            ))}
          </div>
          <p className="text-gray-500 text-sm mt-4">
            Время доставки: ежедневно с <strong>9:00 до 21:00</strong>.
          </p>
        </div>

        {/* Payment */}
        <div className="bg-white rounded-3xl p-8 shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <div className="bg-rose-100 p-3 rounded-2xl">
              <CreditCard className="text-rose-500" size={24} />
            </div>
            <h2 className="text-xl font-bold text-gray-900">Оплата</h2>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {['Наличными курьеру', 'Картой онлайн', 'Картой курьеру', 'СБП (QR-код)'].map(method => (
              <div key={method} className="bg-rose-50 rounded-xl p-3 text-center text-sm text-rose-700 font-medium">
                {method}
              </div>
            ))}
          </div>
        </div>

        {/* Cancellation */}
        <div className="bg-white rounded-3xl p-8 shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <div className="bg-amber-100 p-3 rounded-2xl">
              <AlertCircle className="text-amber-500" size={24} />
            </div>
            <h2 className="text-xl font-bold text-gray-900">Отмена и изменение заказа</h2>
          </div>
          <div className="space-y-3 text-gray-600">
            <p>Вы можете отменить или изменить заказ <strong>не позднее чем за 3 часа</strong> до начала сборки.</p>
            <p>Для отмены или изменения свяжитесь с нами по телефону или в мессенджере — мы всегда на связи.</p>
            <p>Если флорист уже приступил к сборке букета, мы постараемся найти компромиссное решение.</p>
          </div>
        </div>

        {/* Contact */}
        <div className="bg-gradient-to-r from-rose-500 to-pink-500 rounded-3xl p-8 text-white">
          <div className="flex items-center gap-3 mb-4">
            <Phone size={24} />
            <h2 className="text-xl font-bold">Остались вопросы?</h2>
          </div>
          <p className="text-rose-100 mb-6">Наши менеджеры всегда готовы помочь с выбором и оформлением заказа.</p>
          <div className="flex flex-wrap gap-3">
            <a href="tel:+79991234567" className="bg-white text-rose-600 hover:bg-rose-50 px-6 py-2.5 rounded-full font-semibold transition-colors text-sm">
              +7 (999) 123-45-67
            </a>
            <Link href="/checkout" className="bg-white/20 hover:bg-white/30 text-white px-6 py-2.5 rounded-full font-semibold transition-colors text-sm border border-white/30">
              Оформить заказ
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
