import { Heart, Users, Award, Leaf } from 'lucide-react';

export default function AboutPage() {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-12">
      {/* Hero */}
      <div className="text-center mb-16">
        <p className="text-rose-500 font-medium text-sm uppercase tracking-widest mb-3">О нас</p>
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">История FlowerLove</h1>
        <p className="text-gray-500 text-lg max-w-2xl mx-auto leading-relaxed">
          Мы — небольшой семейный цветочный магазин с большим сердцем. С 2018 года мы дарим людям радость через красоту живых цветов.
        </p>
      </div>

      {/* Story */}
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
              Всё началось с маленькой мастерской на кухне. Наша основательница Анна всегда любила цветы и однажды решила превратить хобби в дело жизни. Первые букеты она составляла для подруг и соседей.
            </p>
            <p>
              Сегодня FlowerLove — это команда из 8 профессиональных флористов, ежедневно создающих уникальные букеты. Мы работаем только со свежими цветами от проверенных поставщиков и местных фермерских хозяйств.
            </p>
            <p>
              Мы верим, что цветы могут изменить настроение, выразить самые глубокие чувства и сделать любой день особенным.
            </p>
          </div>
        </div>
      </div>

      {/* Values */}
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
              <div className="bg-rose-50 w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Icon className="text-rose-500" size={26} />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">{title}</h3>
              <p className="text-gray-500 text-sm leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Team */}
      <div className="mb-16">
        <h2 className="text-2xl font-bold text-gray-900 text-center mb-10">Наша команда</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {[
            { name: 'Анна Соколова', role: 'Основательница & флорист', img: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=300&q=80' },
            { name: 'Мария Иванова', role: 'Флорист-декоратор', img: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=300&q=80' },
            { name: 'Дмитрий Козлов', role: 'Курьер и логистика', img: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&q=80' },
            { name: 'Елена Петрова', role: 'Менеджер по заказам', img: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=300&q=80' },
          ].map((member) => (
            <div key={member.name} className="text-center">
              <div className="w-24 h-24 mx-auto rounded-full overflow-hidden mb-3 shadow-md">
                <img src={member.img} alt={member.name} className="w-full h-full object-cover" />
              </div>
              <h4 className="font-semibold text-gray-800 text-sm">{member.name}</h4>
              <p className="text-rose-500 text-xs mt-0.5">{member.role}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Stats */}
      <div className="bg-gradient-to-r from-rose-500 to-pink-500 rounded-3xl p-8 text-white text-center">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {[
            { num: '6+', label: 'Лет на рынке' },
            { num: '5000+', label: 'Счастливых клиентов' },
            { num: '50+', label: 'Видов цветов' },
            { num: '4.9 ★', label: 'Средняя оценка' },
          ].map(({ num, label }) => (
            <div key={label}>
              <div className="text-4xl font-bold mb-1">{num}</div>
              <div className="text-rose-100 text-sm">{label}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
