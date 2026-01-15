import { useState, useEffect, useCallback } from 'react';
import type { 
  AppState, 
  AssetAccount, 
  LiabilityAccount, 
  Snapshot 
} from '../types';
import { generateId } from '../types';

const STORAGE_KEY = 'family-wealth-data';

const initialState: AppState = {
  assets: [],
  liabilities: [],
  snapshots: [],
};

const loadFromStorage = (): AppState => {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (data) {
      return JSON.parse(data);
    }
  } catch {
    console.error('Failed to load data from localStorage');
  }
  return initialState;
};

const saveToStorage = (state: AppState): void => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    console.error('Failed to save data to localStorage');
  }
};

export const useAppState = () => {
  const [state, setState] = useState<AppState>(loadFromStorage);

  useEffect(() => {
    saveToStorage(state);
  }, [state]);

  const totalAssets = state.assets.reduce((sum, a) => sum + a.amount, 0);
  const totalLiabilities = state.liabilities.reduce((sum, l) => sum + l.amount, 0);
  const netWorth = totalAssets - totalLiabilities;

  const addAsset = useCallback((asset: Omit<AssetAccount, 'id' | 'createdAt' | 'updatedAt'>) => {
    const now = new Date().toISOString();
    const newAsset: AssetAccount = {
      ...asset,
      id: generateId(),
      createdAt: now,
      updatedAt: now,
    };
    setState(prev => ({ ...prev, assets: [...prev.assets, newAsset] }));
  }, []);

  const updateAsset = useCallback((id: string, updates: Partial<AssetAccount>) => {
    setState(prev => ({
      ...prev,
      assets: prev.assets.map(a => 
        a.id === id ? { ...a, ...updates, updatedAt: new Date().toISOString() } : a
      ),
    }));
  }, []);

  const deleteAsset = useCallback((id: string) => {
    setState(prev => ({
      ...prev,
      assets: prev.assets.filter(a => a.id !== id),
    }));
  }, []);

  const addLiability = useCallback((liability: Omit<LiabilityAccount, 'id' | 'createdAt' | 'updatedAt'>) => {
    const now = new Date().toISOString();
    const newLiability: LiabilityAccount = {
      ...liability,
      id: generateId(),
      createdAt: now,
      updatedAt: now,
    };
    setState(prev => ({ ...prev, liabilities: [...prev.liabilities, newLiability] }));
  }, []);

  const updateLiability = useCallback((id: string, updates: Partial<LiabilityAccount>) => {
    setState(prev => ({
      ...prev,
      liabilities: prev.liabilities.map(l => 
        l.id === id ? { ...l, ...updates, updatedAt: new Date().toISOString() } : l
      ),
    }));
  }, []);

  const deleteLiability = useCallback((id: string) => {
    setState(prev => ({
      ...prev,
      liabilities: prev.liabilities.filter(l => l.id !== id),
    }));
  }, []);

  const takeSnapshot = useCallback(() => {
    const now = new Date().toISOString().split('T')[0];
    const breakdown = [
      ...state.assets.map(a => ({ category: a.category, amount: a.amount })),
      ...state.liabilities.map(l => ({ category: l.category, amount: -l.amount })),
    ];
    
    const snapshot: Snapshot = {
      id: generateId(),
      date: now,
      totalAssets,
      totalLiabilities,
      netWorth,
      breakdown,
    };
    
    setState(prev => ({ ...prev, snapshots: [...prev.snapshots, snapshot] }));
  }, [state.assets, state.liabilities, totalAssets, totalLiabilities, netWorth]);

  const clearAllData = useCallback(() => {
    setState(initialState);
  }, []);

  const loadDemoData = useCallback(() => {
    const now = new Date().toISOString();
    const demoAssets: AssetAccount[] = [
      { id: generateId(), type: 'asset', name: '招商银行储蓄', category: 'deposit', amount: 150000, platform: '招商银行', createdAt: now, updatedAt: now },
      { id: generateId(), type: 'asset', name: '支付宝余额', category: 'cash', amount: 8500, platform: '支付宝', createdAt: now, updatedAt: now },
      { id: generateId(), type: 'asset', name: '沪深300指数基金', category: 'fund', amount: 85000, platform: '天天基金', createdAt: now, updatedAt: now },
      { id: generateId(), type: 'asset', name: '腾讯股票', category: 'stock', amount: 45000, platform: '富途证券', createdAt: now, updatedAt: now },
      { id: generateId(), type: 'asset', name: '自住房产', category: 'realestate', amount: 3500000, note: '深圳南山区', createdAt: now, updatedAt: now },
      { id: generateId(), type: 'asset', name: '特斯拉Model 3', category: 'vehicle', amount: 180000, createdAt: now, updatedAt: now },
      { id: generateId(), type: 'asset', name: '重疾险现金价值', category: 'insurance', amount: 25000, platform: '平安保险', createdAt: now, updatedAt: now },
    ];
    
    const demoLiabilities: LiabilityAccount[] = [
      { id: generateId(), type: 'liability', name: '房贷', category: 'mortgage', amount: 2200000, interestRate: 4.2, createdAt: now, updatedAt: now },
      { id: generateId(), type: 'liability', name: '招行信用卡', category: 'credit_card', amount: 15000, createdAt: now, updatedAt: now },
      { id: generateId(), type: 'liability', name: '车贷', category: 'car_loan', amount: 80000, interestRate: 5.5, createdAt: now, updatedAt: now },
    ];

    const generateHistoricalSnapshots = (): Snapshot[] => {
      const snapshots: Snapshot[] = [];
      const today = new Date();
      
      for (let i = 11; i >= 0; i--) {
        const date = new Date(today.getFullYear(), today.getMonth() - i, 1);
        const dateStr = date.toISOString().split('T')[0];
        const variation = 1 + (Math.random() - 0.5) * 0.1;
        const assetTotal = (3993500 + i * 15000) * variation;
        const liabilityTotal = (2295000 - i * 8000) * variation;
        
        snapshots.push({
          id: generateId(),
          date: dateStr,
          totalAssets: assetTotal,
          totalLiabilities: liabilityTotal,
          netWorth: assetTotal - liabilityTotal,
          breakdown: [],
        });
      }
      return snapshots;
    };
    
    setState({
      assets: demoAssets,
      liabilities: demoLiabilities,
      snapshots: generateHistoricalSnapshots(),
    });
  }, []);

  return {
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
  };
};
