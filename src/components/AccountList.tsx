import { useState } from 'react';
import type { 
  AssetAccount, 
  LiabilityAccount, 
  AssetCategory,
  LiabilityCategory 
} from '../types';
import { 
  ASSET_CATEGORIES, 
  LIABILITY_CATEGORIES,
  getCategoryConfig,
  formatCurrency,
} from '../types';
import './AccountList.css';

interface AccountListProps {
  assets: AssetAccount[];
  liabilities: LiabilityAccount[];
  onEditAsset: (asset: AssetAccount) => void;
  onEditLiability: (liability: LiabilityAccount) => void;
  onDeleteAsset: (id: string) => void;
  onDeleteLiability: (id: string) => void;
}

type TabType = 'all' | AssetCategory | LiabilityCategory;

export const AccountList = ({
  assets,
  liabilities,
  onEditAsset,
  onEditLiability,
  onDeleteAsset,
  onDeleteLiability,
}: AccountListProps) => {
  const [activeTab, setActiveTab] = useState<TabType>('all');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);

  const assetCategories = ASSET_CATEGORIES.filter(cat => 
    assets.some(a => a.category === cat.key)
  );
  const liabilityCategories = LIABILITY_CATEGORIES.filter(cat => 
    liabilities.some(l => l.category === cat.key)
  );

  const filteredAssets = activeTab === 'all' 
    ? assets 
    : assets.filter(a => a.category === activeTab);
  
  const filteredLiabilities = activeTab === 'all'
    ? liabilities
    : liabilities.filter(l => l.category === activeTab);

  const handleDelete = (id: string, type: 'asset' | 'liability') => {
    if (type === 'asset') {
      onDeleteAsset(id);
    } else {
      onDeleteLiability(id);
    }
    setShowDeleteConfirm(null);
  };

  return (
    <div className="account-list">
      <div className="category-tabs scrollbar-hide">
        <button 
          className={`category-tab ${activeTab === 'all' ? 'active' : ''}`}
          onClick={() => setActiveTab('all')}
        >
          全部
        </button>
        {assetCategories.map(cat => (
          <button
            key={cat.key}
            className={`category-tab ${activeTab === cat.key ? 'active' : ''}`}
            onClick={() => setActiveTab(cat.key as TabType)}
          >
            <span>{cat.icon}</span>
            <span>{cat.label}</span>
          </button>
        ))}
        {liabilityCategories.map(cat => (
          <button
            key={cat.key}
            className={`category-tab liability ${activeTab === cat.key ? 'active' : ''}`}
            onClick={() => setActiveTab(cat.key as TabType)}
          >
            <span>{cat.icon}</span>
            <span>{cat.label}</span>
          </button>
        ))}
      </div>

      <div className="account-items">
        {filteredAssets.length === 0 && filteredLiabilities.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">📋</div>
            <div className="empty-state-title">暂无账户</div>
            <p>点击上方按钮添加资产或负债</p>
          </div>
        ) : (
          <>
            {filteredAssets.map(asset => {
              const config = getCategoryConfig(asset.category);
              return (
                <div key={asset.id} className="account-item">
                  <div 
                    className="account-icon"
                    style={{ background: `${config?.color}20`, color: config?.color }}
                  >
                    {config?.icon}
                  </div>
                  <div className="account-info">
                    <div className="account-name">{asset.name}</div>
                    <div className="account-meta">
                      {asset.platform && <span className="badge">{asset.platform}</span>}
                      <span className="text-xs text-muted">{config?.label}</span>
                    </div>
                  </div>
                  <div className="account-amount positive">
                    {formatCurrency(asset.amount)}
                  </div>
                  <div className="account-actions">
                    <button 
                      className="btn btn-icon btn-secondary"
                      onClick={() => onEditAsset(asset)}
                      title="编辑"
                    >
                      ✏️
                    </button>
                    {showDeleteConfirm === asset.id ? (
                      <div className="delete-confirm">
                        <button 
                          className="btn btn-danger"
                          onClick={() => handleDelete(asset.id, 'asset')}
                        >
                          确认
                        </button>
                        <button 
                          className="btn btn-secondary"
                          onClick={() => setShowDeleteConfirm(null)}
                        >
                          取消
                        </button>
                      </div>
                    ) : (
                      <button 
                        className="btn btn-icon btn-danger"
                        onClick={() => setShowDeleteConfirm(asset.id)}
                        title="删除"
                      >
                        🗑️
                      </button>
                    )}
                  </div>
                </div>
              );
            })}

            {filteredLiabilities.map(liability => {
              const config = getCategoryConfig(liability.category);
              return (
                <div key={liability.id} className="account-item">
                  <div 
                    className="account-icon"
                    style={{ background: `${config?.color}20`, color: config?.color }}
                  >
                    {config?.icon}
                  </div>
                  <div className="account-info">
                    <div className="account-name">{liability.name}</div>
                    <div className="account-meta">
                      {liability.interestRate && (
                        <span className="badge">年利率 {liability.interestRate}%</span>
                      )}
                      <span className="text-xs text-muted">{config?.label}</span>
                    </div>
                  </div>
                  <div className="account-amount negative">
                    -{formatCurrency(liability.amount)}
                  </div>
                  <div className="account-actions">
                    <button 
                      className="btn btn-icon btn-secondary"
                      onClick={() => onEditLiability(liability)}
                      title="编辑"
                    >
                      ✏️
                    </button>
                    {showDeleteConfirm === liability.id ? (
                      <div className="delete-confirm">
                        <button 
                          className="btn btn-danger"
                          onClick={() => handleDelete(liability.id, 'liability')}
                        >
                          确认
                        </button>
                        <button 
                          className="btn btn-secondary"
                          onClick={() => setShowDeleteConfirm(null)}
                        >
                          取消
                        </button>
                      </div>
                    ) : (
                      <button 
                        className="btn btn-icon btn-danger"
                        onClick={() => setShowDeleteConfirm(liability.id)}
                        title="删除"
                      >
                        🗑️
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </>
        )}
      </div>
    </div>
  );
};
