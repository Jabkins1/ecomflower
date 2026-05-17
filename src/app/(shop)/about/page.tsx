import { Heart, Users, Award, Leaf } from 'lucide-react';

export default function AboutPage() {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-12">
      <div className="text-center mb-16">
        <p className="text-green-500 font-medium text-sm uppercase tracking-widest mb-3">О нас</p>
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">История ZELENAYA</h1>
        <p className="text-gray-500 text-lg max-w-2xl mx-auto leading-relaxed">
          Мы — небольшой семейный цветочный магазин с большим сердцем. С 2025 года мы дарим людям радость через красоту живых цветов.
        </p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-16 items-center">
        <div>
          <img
            src="https://images.unsplash.com/photo-1525310072745-f49212b5ac6d?w=700&q=80"
            alt="Наш магазин"
            className="w-full rounded-3xl shadow-lg object-cover aspect-[4/3]"
          />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Как всё начиналось</h2>
          <div className="space-y-4 text-gray-600 leading-relaxed">
            <p>
              Всё началось с маленькой мастерской на кухне. Наша основательница София всегда любила цветы и однажды решила превратить хобби в дело жизни. Первые букеты она составляла для подруг и соседей.
            </p>
            <p>
              Сегодня ZELENAYA — это команда из профессиональных флористов, ежедневно создающих уникальные букеты. Мы работаем только со свежими цветами от проверенных поставщиков и местных фермерских хозяйств.
            </p>
            <p>
              Мы верим, что цветы могут изменить настроение, выразить самые глубокие чувства и сделать любой день особенным.
            </p>
          </div>
        </div>
      </div>
      <div className="bg-white rounded-3xl p-8 md:p-12 shadow-sm mb-16">
        <h2 className="text-2xl font-bold text-gray-900 text-center mb-10">Наши ценности</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">
          {[
            { icon: Heart, title: 'С душой', desc: 'Каждый букет — это произведение искусства, созданное с любовью' },
            { icon: Leaf, title: 'Свежесть', desc: 'Поставки цветов трижды в неделю, только свежесрезанные' },
            { icon: Users, title: 'Для людей', desc: 'Индивидуальный подход к каждому клиенту и его пожеланиям' },
            { icon: Award, title: 'Качество', desc: 'Работаем только с лучшими поставщиками России и Эквадора' },
          ].map(({ icon: Icon, title, desc }) => (
            <div key={title} className="text-center">
              <div className="bg-green-50 w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Icon className="text-green-500" size={26} />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">{title}</h3>
              <p className="text-gray-500 text-sm leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </div>
      <div className="bg-gradient-to-r from-green-500 to-lime-500 rounded-3xl p-8 text-white text-center">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {[
            { num: '1,5+', label: 'Года на рынке' },
            { num: '1000+', label: 'Счастливых клиентов' },
            { num: '35+', label: 'Видов цветов' },
            { num: '4,6 ★', label: 'Средняя оценка' },
          ].map(({ num, label }) => (
            <div key={label}>
              <div className="text-4xl font-bold mb-1">{num}</div>
              <div className="text-green-100 text-sm">{label}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
