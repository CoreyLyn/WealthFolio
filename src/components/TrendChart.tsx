import { Line } from 'react-chartjs-2';
import type { TooltipItem } from 'chart.js';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Filler,
} from 'chart.js';
import { formatCompactCurrency } from '../types';
import type { Snapshot } from '../types';
import './Charts.css';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Filler);

interface TrendChartProps {
  snapshots: Snapshot[];
}

export const TrendChart = ({ snapshots }: TrendChartProps) => {
  if (snapshots.length < 2) {
    return (
      <div className="chart-empty">
        <span className="chart-empty-icon">📈</span>
        <p>需要至少2个快照数据</p>
        <span className="text-sm text-muted">点击"记录快照"保存当前资产状态</span>
      </div>
    );
  }

  const sortedSnapshots = [...snapshots].sort((a, b) => 
    new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  const labels = sortedSnapshots.map(s => {
    const date = new Date(s.date);
    return `${date.getMonth() + 1}月`;
  });

  const data = {
    labels,
    datasets: [
      {
        label: '净资产',
        data: sortedSnapshots.map(s => s.netWorth),
        borderColor: '#8b5cf6',
        backgroundColor: 'rgba(139, 92, 246, 0.1)',
        fill: true,
        tension: 0.4,
        pointRadius: 4,
        pointBackgroundColor: '#8b5cf6',
        pointBorderColor: '#0f0f14',
        pointBorderWidth: 2,
        pointHoverRadius: 6,
      },
      {
        label: '总资产',
        data: sortedSnapshots.map(s => s.totalAssets),
        borderColor: '#10b981',
        backgroundColor: 'transparent',
        tension: 0.4,
        pointRadius: 3,
        pointBackgroundColor: '#10b981',
        pointBorderColor: '#0f0f14',
        pointBorderWidth: 2,
        borderDash: [5, 5],
      },
      {
        label: '总负债',
        data: sortedSnapshots.map(s => s.totalLiabilities),
        borderColor: '#ef4444',
        backgroundColor: 'transparent',
        tension: 0.4,
        pointRadius: 3,
        pointBackgroundColor: '#ef4444',
        pointBorderColor: '#0f0f14',
        pointBorderWidth: 2,
        borderDash: [5, 5],
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      intersect: false,
      mode: 'index' as const,
    },
    scales: {
      x: {
        grid: {
          color: 'rgba(255, 255, 255, 0.05)',
        },
        ticks: {
          color: '#666677',
        },
      },
      y: {
        grid: {
          color: 'rgba(255, 255, 255, 0.05)',
        },
        ticks: {
          color: '#666677',
          callback: (value: number | string) => formatCompactCurrency(Number(value)),
        },
      },
    },
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        backgroundColor: 'rgba(30, 30, 40, 0.95)',
        titleColor: '#f0f0f5',
        bodyColor: '#9999aa',
        borderColor: 'rgba(255, 255, 255, 0.1)',
        borderWidth: 1,
        cornerRadius: 8,
        padding: 12,
        callbacks: {
          label: (context: TooltipItem<'line'>) => {
            const label = context.dataset.label || '';
            const value = context.parsed.y ?? 0;
            return `${label}: ¥${value.toLocaleString()}`;
          },
        },
      },
    },
  };

  return (
    <div className="trend-chart">
      <div className="trend-legend">
        <div className="trend-legend-item">
          <span className="trend-dot" style={{ background: '#8b5cf6' }} />
          <span>净资产</span>
        </div>
        <div className="trend-legend-item">
          <span className="trend-dot trend-dot-dashed" style={{ background: '#10b981' }} />
          <span>总资产</span>
        </div>
        <div className="trend-legend-item">
          <span className="trend-dot trend-dot-dashed" style={{ background: '#ef4444' }} />
          <span>总负债</span>
        </div>
      </div>
      <div className="trend-chart-container">
        <Line data={data} options={options} />
      </div>
    </div>
  );
};
