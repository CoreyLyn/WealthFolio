import { Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
} from 'chart.js';
import { ASSET_CATEGORIES, LIABILITY_CATEGORIES } from '../types';
import type { AssetAccount, LiabilityAccount } from '../types';
import './Charts.css';

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
      <div className="chart-empty">
        <span className="chart-empty-icon">{type === 'asset' ? '📊' : '📉'}</span>
        <p>暂无{type === 'asset' ? '资产' : '负债'}数据</p>
      </div>
    );
  }

  const data = {
    labels: categoryTotals.map(c => c.label),
    datasets: [{
      data: categoryTotals.map(c => c.total),
      backgroundColor: categoryTotals.map(c => c.color),
      borderColor: 'rgba(15, 15, 20, 0.8)',
      borderWidth: 3,
      hoverBorderWidth: 0,
      hoverOffset: 8,
    }],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: '65%',
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
    <div className="allocation-chart">
      <div className="chart-container">
        <Doughnut data={data} options={options} />
        <div className="chart-center">
          <span className="chart-center-label">{type === 'asset' ? '资产' : '负债'}</span>
          <span className="chart-center-value">
            {categoryTotals.length}类
          </span>
        </div>
      </div>
      <div className="chart-legend">
        {categoryTotals.map(cat => (
          <div key={cat.key} className="legend-item">
            <span className="legend-dot" style={{ background: cat.color }} />
            <span className="legend-icon">{cat.icon}</span>
            <span className="legend-label">{cat.label}</span>
            <span className="legend-value">¥{cat.total.toLocaleString()}</span>
          </div>
        ))}
      </div>
    </div>
  );
};
