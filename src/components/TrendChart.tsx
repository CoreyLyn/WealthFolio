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

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Filler);

interface TrendChartProps {
  snapshots: Snapshot[];
}

export const TrendChart = ({ snapshots }: TrendChartProps) => {
  if (snapshots.length < 2) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-muted-foreground bg-muted/20 rounded-lg min-h-[300px]">
        <span className="text-4xl mb-2">📈</span>
        <p className="font-medium">需要至少2个快照数据</p>
        <span className="text-sm mt-1">点击"记录快照"保存当前资产状态</span>
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
        pointBorderColor: '#ffffff',
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
        pointBorderColor: '#ffffff',
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
        pointBorderColor: '#ffffff',
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
          color: 'hsl(var(--border))',
          drawBorder: false,
        },
        ticks: {
          color: 'hsl(var(--muted-foreground))',
        },
      },
      y: {
        grid: {
          color: 'hsl(var(--border))',
          drawBorder: false,
        },
        ticks: {
          color: 'hsl(var(--muted-foreground))',
          callback: (value: number | string) => formatCompactCurrency(Number(value)),
        },
      },
    },
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        backgroundColor: 'hsl(var(--popover))',
        titleColor: 'hsl(var(--popover-foreground))',
        bodyColor: 'hsl(var(--popover-foreground))',
        borderColor: 'hsl(var(--border))',
        borderWidth: 1,
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
    <div className="space-y-4">
      <div className="flex items-center gap-6 justify-center text-sm">
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-violet-500" />
          <span>净资产</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-emerald-500" />
          <span>总资产</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-red-500" />
          <span>总负债</span>
        </div>
      </div>
      <div className="h-[300px] w-full">
        <Line data={data} options={options} />
      </div>
    </div>
  );
};
