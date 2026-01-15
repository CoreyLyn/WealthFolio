import { Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
} from 'chart.js';
import { ASSET_CATEGORIES, LIABILITY_CATEGORIES } from '../types';
import type { AssetAccount, LiabilityAccount } from '../types';

ChartJS.register(ArcElement, Tooltip, Legend);

interface AllocationChartProps {
  assets: AssetAccount[];
  liabilities: LiabilityAccount[];
  type: 'asset' | 'liability';
}

export const AllocationChart = ({ assets, liabilities, type }: AllocationChartProps) => {
  const items = type === 'asset' ? assets : liabilities;
  const categories = type === 'asset' ? ASSET_CATEGORIES : LIABILITY_CATEGORIES;

  const categoryTotals = categories.map(cat => ({
    ...cat,
    total: items
      .filter(item => item.category === cat.key)
      .reduce((sum, item) => sum + item.amount, 0),
  })).filter(cat => cat.total > 0);

  if (categoryTotals.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-muted-foreground h-[300px]">
        <span className="text-4xl mb-2">{type === 'asset' ? '📊' : '📉'}</span>
        <p>暂无{type === 'asset' ? '资产' : '负债'}数据</p>
      </div>
    );
  }

  const data = {
    labels: categoryTotals.map(c => c.label),
    datasets: [{
      data: categoryTotals.map(c => c.total),
      backgroundColor: categoryTotals.map(c => c.color),
      borderColor: 'rgba(255, 255, 255, 0.8)', // Need to check dark mode
      borderWidth: 2,
      hoverOffset: 4,
    }],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: '70%',
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
          label: (context: { parsed: number; dataset: { data: number[] } }) => {
            const total = context.dataset.data.reduce((a: number, b: number) => a + b, 0);
            const percentage = ((context.parsed / total) * 100).toFixed(1);
            return `¥${context.parsed.toLocaleString()} (${percentage}%)`;
          },
        },
      },
    },
  };

  return (
    <div className="flex flex-col md:flex-row items-center gap-8 min-h-[300px]">
      <div className="relative w-[200px] h-[200px] mx-auto">
        <Doughnut data={data} options={options} />
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <span className="text-sm text-muted-foreground">{type === 'asset' ? '资产' : '负债'}</span>
          <span className="text-xl font-bold">
            {categoryTotals.length}类
          </span>
        </div>
      </div>
      <div className="flex-1 grid grid-cols-2 gap-4 text-sm w-full">
        {categoryTotals.map(cat => (
          <div key={cat.key} className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full" style={{ background: cat.color }} />
            <span className="text-lg">{cat.icon}</span>
            <span className="flex-1 truncate">{cat.label}</span>
            <span className="font-mono text-muted-foreground">¥{cat.total.toLocaleString()}</span>
          </div>
        ))}
      </div>
    </div>
  );
};
