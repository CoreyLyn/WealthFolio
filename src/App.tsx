import { useState } from 'react';
import { useAppState } from './hooks/useAppState';
import { formatCompactCurrency } from './types';
import type { AssetAccount, LiabilityAccount } from './types';
import { AllocationChart } from './components/AllocationChart';
import { TrendChart } from './components/TrendChart';
import { AccountList } from './components/AccountList';
import { AccountForm } from './components/AccountForm';
import './App.css';

type ModalType = 'asset' | 'liability' | null;

function App() {
  const {
    state,
    totalAssets,
    totalLiabilities,
    netWorth,
    addAsset,
    updateAsset,
    deleteAsset,
    addLiability,
    updateLiability,
    deleteLiability,
    takeSnapshot,
    clearAllData,
    loadDemoData,
  } = useAppState();

  const [modalType, setModalType] = useState<ModalType>(null);
  const [editingAsset, setEditingAsset] = useState<AssetAccount | null>(null);
  const [editingLiability, setEditingLiability] = useState<LiabilityAccount | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  const [activeView, setActiveView] = useState<'dashboard' | 'accounts'>('dashboard');

  const handleEditAsset = (asset: AssetAccount) => {
    setEditingAsset(asset);
    setModalType('asset');
  };

  const handleEditLiability = (liability: LiabilityAccount) => {
    setEditingLiability(liability);
    setModalType('liability');
  };

  const closeModal = () => {
    setModalType(null);
    setEditingAsset(null);
    setEditingLiability(null);
  };

  const handleClearData = () => {
    if (confirm('确定要清除所有数据吗？此操作不可恢复。')) {
      clearAllData();
      setShowSettings(false);
    }
  };

  const assetRatio = totalAssets > 0 ? (totalAssets / (totalAssets + totalLiabilities)) * 100 : 50;

  return (
    <div className="app">
      <header className="app-header">
        <div className="header-content">
          <div className="header-brand">
            <span className="brand-icon">💎</span>
            <h1 className="brand-name">WealthFolio</h1>
          </div>
          <div className="header-actions">
            <button 
              className="btn btn-secondary"
              onClick={() => setShowSettings(!showSettings)}
            >
              ⚙️ 设置
            </button>
          </div>
        </div>
        
        {showSettings && (
          <div className="settings-panel">
            <div className="settings-content">
              <button className="btn btn-secondary" onClick={loadDemoData}>
                📊 加载演示数据
              </button>
              <button className="btn btn-secondary" onClick={takeSnapshot}>
                📸 记录快照
              </button>
              <button className="btn btn-danger" onClick={handleClearData}>
                🗑️ 清除所有数据
              </button>
            </div>
          </div>
        )}
      </header>

      <main className="app-main">
        <section className="summary-section">
          <div className="summary-cards grid grid-3">
            <div className="card summary-card net-worth-card">
              <div className="card-header">
                <span className="card-title">
                  <span>💰</span> 净资产
                </span>
              </div>
              <div className={`stat-value ${netWorth >= 0 ? 'positive' : 'negative'}`}>
                {formatCompactCurrency(netWorth)}
              </div>
              <div className="summary-bar">
                <div className="bar-track">
                  <div 
                    className="bar-fill assets"
                    style={{ width: `${assetRatio}%` }}
                  />
                </div>
                <div className="bar-labels">
                  <span className="text-success">资产 {assetRatio.toFixed(0)}%</span>
                  <span className="text-danger">负债 {(100 - assetRatio).toFixed(0)}%</span>
                </div>
              </div>
            </div>

            <div className="card summary-card">
              <div className="card-header">
                <span className="card-title">
                  <span>📈</span> 总资产
                </span>
                <button 
                  className="btn btn-primary btn-sm"
                  onClick={() => setModalType('asset')}
                >
                  + 添加
                </button>
              </div>
              <div className="stat-value positive">
                {formatCompactCurrency(totalAssets)}
              </div>
              <div className="summary-detail text-muted text-sm">
                {state.assets.length} 个账户
              </div>
            </div>

            <div className="card summary-card">
              <div className="card-header">
                <span className="card-title">
                  <span>📉</span> 总负债
                </span>
                <button 
                  className="btn btn-danger btn-sm"
                  onClick={() => setModalType('liability')}
                >
                  + 添加
                </button>
              </div>
              <div className="stat-value negative">
                {formatCompactCurrency(totalLiabilities)}
              </div>
              <div className="summary-detail text-muted text-sm">
                {state.liabilities.length} 个账户
              </div>
            </div>
          </div>
        </section>

        <nav className="view-nav">
          <div className="tab-list">
            <button 
              className={`tab ${activeView === 'dashboard' ? 'active' : ''}`}
              onClick={() => setActiveView('dashboard')}
            >
              📊 资产概览
            </button>
            <button 
              className={`tab ${activeView === 'accounts' ? 'active' : ''}`}
              onClick={() => setActiveView('accounts')}
            >
              📋 账户明细
            </button>
          </div>
        </nav>

        {activeView === 'dashboard' ? (
          <section className="dashboard-section">
            <div className="dashboard-grid">
              <div className="card chart-card">
                <div className="card-header">
                  <span className="card-title">📊 资产配置</span>
                </div>
                <AllocationChart 
                  assets={state.assets}
                  liabilities={state.liabilities}
                  type="asset"
                />
              </div>

              <div className="card chart-card">
                <div className="card-header">
                  <span className="card-title">📉 负债构成</span>
                </div>
                <AllocationChart 
                  assets={state.assets}
                  liabilities={state.liabilities}
                  type="liability"
                />
              </div>

              <div className="card chart-card full-width">
                <div className="card-header">
                  <span className="card-title">📈 资产趋势</span>
                  <button 
                    className="btn btn-secondary btn-sm"
                    onClick={takeSnapshot}
                  >
                    📸 记录快照
                  </button>
                </div>
                <TrendChart snapshots={state.snapshots} />
              </div>
            </div>
          </section>
        ) : (
          <section className="accounts-section">
            <div className="card">
              <AccountList
                assets={state.assets}
                liabilities={state.liabilities}
                onEditAsset={handleEditAsset}
                onEditLiability={handleEditLiability}
                onDeleteAsset={deleteAsset}
                onDeleteLiability={deleteLiability}
              />
            </div>
          </section>
        )}
      </main>

      <footer className="app-footer">
        <p>
          家庭资产管理 · 记录财富 · 规划未来
        </p>
      </footer>

      {modalType && (
        <AccountForm
          type={modalType}
          editingAsset={editingAsset}
          editingLiability={editingLiability}
          onSubmitAsset={addAsset}
          onSubmitLiability={addLiability}
          onUpdateAsset={updateAsset}
          onUpdateLiability={updateLiability}
          onClose={closeModal}
        />
      )}
    </div>
  );
}

export default App;
