import React from 'react';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale, // Для оси X (категории - названия мероприятий)
  LinearScale,   // Для оси Y (числовые значения)
  BarElement,    // Для столбчатых диаграмм
  Title,         // Для заголовка графика
  Tooltip,       // Для всплывающих подсказок при наведении
  Legend,        // Для легенды (подписи наборов данных)
} from 'chart.js';

// Обязательно регистрируем компоненты Chart.js, которые будем использовать
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const EventStatsCharts = ({ eventsData }) => {
  if (!eventsData || eventsData.length === 0) {
    return <p style={{ textAlign: 'center', padding: '20px' }}>Нет данных для отображения статистики.</p>;
  }

  // Готовим данные для графиков
  const labels = eventsData.map(event => event.title || `Событие #${event.id}`); // Названия мероприятий для оси X

  // Данные для графика "Количество участников"
  const participantsChartData = {
    labels,
    datasets: [
      {
        label: 'Количество участников',
        data: eventsData.map(event => event.participantCount || 0), // Берем из event.participantCount
        backgroundColor: 'rgba(54, 162, 235, 0.6)', // Синий цвет
        borderColor: 'rgba(54, 162, 235, 1)',
        borderWidth: 1,
      },
    ],
  };

  // Данные для графика "В избранном"
  const favoritesChartData = {
    labels,
    datasets: [
      {
        label: 'Добавлений в избранное',
        data: eventsData.map(event => event.favoriteCount || 0), // Берем из event.favoriteCount
        backgroundColor: 'rgba(255, 99, 132, 0.6)', // Розовый/Красный цвет
        borderColor: 'rgba(255, 99, 132, 1)',
        borderWidth: 1,
      },
    ],
  };

  // Общие опции для обоих графиков
  const chartOptions = {
    responsive: true, // График будет адаптироваться к размеру контейнера
    maintainAspectRatio: false, // Важно, чтобы можно было задать высоту через CSS контейнера
    plugins: {
      legend: {
        position: 'top', // Положение легенды
      },
      title: {
        display: false, // Общий заголовок графика можно не отображать, т.к. у нас будут заголовки секций
        // text: 'Статистика по мероприятиям',
      },
      tooltip: { // Настройки всплывающих подсказок
        callbacks: {
            label: function(context) {
                let label = context.dataset.label || '';
                if (label) {
                    label += ': ';
                }
                if (context.parsed.y !== null) {
                    label += context.parsed.y;
                }
                return label;
            }
        }
      }
    },
    scales: { // Настройки осей
      y: {
        beginAtZero: true, // Начинать ось Y с нуля
        ticks: {
          // Чтобы на оси Y были только целые числа, если все значения целые
          stepSize: 1,
          precision: 0 // Убираем дробную часть, если значения целые
        }
      },
      x: {
        ticks: {
            // Можно добавить авто-поворот подписей, если их много и они длинные
            // autoSkip: false,
            // maxRotation: 45,
            // minRotation: 45
        }
      }
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '40px', padding: '20px' }}>
      <div style={{ height: '350px', position: 'relative' }}> {/* Обертка для задания высоты */}
        <h4>Участники по мероприятиям</h4>
        <Bar options={chartOptions} data={participantsChartData} />
      </div>
      <div style={{ height: '350px', position: 'relative' }}>
        <h4>Добавления в избранное по мероприятиям</h4>
        <Bar options={chartOptions} data={favoritesChartData} />
      </div>
    </div>
  );
};

export default EventStatsCharts;