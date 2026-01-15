import { useState, useEffect } from 'react';
import type {
  AssetAccount,
  LiabilityAccount,
  AssetCategory,
  LiabilityCategory,
} from '../types';
import {
  ASSET_CATEGORIES,
  LIABILITY_CATEGORIES,
} from '../types';
import './AccountForm.css';

type FormType = 'asset' | 'liability';

interface AccountFormProps {
  type: FormType;
  editingAsset?: AssetAccount | null;
  editingLiability?: LiabilityAccount | null;
  onSubmitAsset: (asset: Omit<AssetAccount, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onSubmitLiability: (liability: Omit<LiabilityAccount, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onUpdateAsset?: (id: string, updates: Partial<AssetAccount>) => void;
  onUpdateLiability?: (id: string, updates: Partial<LiabilityAccount>) => void;
  onClose: () => void;
}

export const AccountForm = ({
  type,
  editingAsset,
  editingLiability,
  onSubmitAsset,
  onSubmitLiability,
  onUpdateAsset,
  onUpdateLiability,
  onClose,
}: AccountFormProps) => {
  const isEditing = !!(editingAsset || editingLiability);
  const [formType, setFormType] = useState<FormType>(type);
  
  const [name, setName] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState<AssetCategory | LiabilityCategory>(
    type === 'asset' ? 'deposit' : 'credit_card'
  );
  const [platform, setPlatform] = useState('');
  const [interestRate, setInterestRate] = useState('');
  const [note, setNote] = useState('');

  useEffect(() => {
    if (editingAsset) {
      setFormType('asset');
      setName(editingAsset.name);
      setAmount(editingAsset.amount.toString());
      setCategory(editingAsset.category);
      setPlatform(editingAsset.platform || '');
      setNote(editingAsset.note || '');
    } else if (editingLiability) {
      setFormType('liability');
      setName(editingLiability.name);
      setAmount(editingLiability.amount.toString());
      setCategory(editingLiability.category);
      setInterestRate(editingLiability.interestRate?.toString() || '');
      setNote(editingLiability.note || '');
    }
  }, [editingAsset, editingLiability]);

  const handleTypeChange = (newType: FormType) => {
    if (!isEditing) {
      setFormType(newType);
      setCategory(newType === 'asset' ? 'deposit' : 'credit_card');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const amountNum = parseFloat(amount);
    if (!name.trim() || isNaN(amountNum) || amountNum <= 0) {
      return;
    }

    if (formType === 'asset') {
      const assetData = {
        type: 'asset' as const,
        name: name.trim(),
        amount: amountNum,
        category: category as AssetCategory,
        platform: platform.trim() || undefined,
        note: note.trim() || undefined,
      };

      if (editingAsset && onUpdateAsset) {
        onUpdateAsset(editingAsset.id, assetData);
      } else {
        onSubmitAsset(assetData);
      }
    } else {
      const liabilityData = {
        type: 'liability' as const,
        name: name.trim(),
        amount: amountNum,
        category: category as LiabilityCategory,
        interestRate: interestRate ? parseFloat(interestRate) : undefined,
        note: note.trim() || undefined,
      };

      if (editingLiability && onUpdateLiability) {
        onUpdateLiability(editingLiability.id, liabilityData);
      } else {
        onSubmitLiability(liabilityData);
      }
    }

    onClose();
  };

  const categories = formType === 'asset' ? ASSET_CATEGORIES : LIABILITY_CATEGORIES;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal account-form-modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">
            {isEditing ? '编辑' : '添加'}{formType === 'asset' ? '资产' : '负债'}
          </h2>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>

        {!isEditing && (
          <div className="form-type-toggle">
            <button
              className={`toggle-btn ${formType === 'asset' ? 'active' : ''}`}
              onClick={() => handleTypeChange('asset')}
            >
              💰 资产
            </button>
            <button
              className={`toggle-btn liability ${formType === 'liability' ? 'active' : ''}`}
              onClick={() => handleTypeChange('liability')}
            >
              💳 负债
            </button>
          </div>
        )}

        <form onSubmit={handleSubmit} className="account-form">
          <div className="form-group">
            <label className="form-label">名称 *</label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder={formType === 'asset' ? '如：招商银行储蓄卡' : '如：房贷'}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">金额 (元) *</label>
            <input
              type="number"
              value={amount}
              onChange={e => setAmount(e.target.value)}
              placeholder="0.00"
              min="0"
              step="0.01"
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">类别 *</label>
            <div className="category-grid">
              {categories.map(cat => (
                <button
                  key={cat.key}
                  type="button"
                  className={`category-option ${category === cat.key ? 'active' : ''}`}
                  onClick={() => setCategory(cat.key)}
                  style={{ 
                    '--cat-color': cat.color,
                    '--cat-bg': `${cat.color}20`,
                  } as React.CSSProperties}
                >
                  <span className="category-icon">{cat.icon}</span>
                  <span className="category-label">{cat.label}</span>
                </button>
              ))}
            </div>
          </div>

          {formType === 'asset' && (
            <div className="form-group">
              <label className="form-label">平台/银行</label>
              <input
                type="text"
                value={platform}
                onChange={e => setPlatform(e.target.value)}
                placeholder="如：招商银行、支付宝"
              />
            </div>
          )}

          {formType === 'liability' && (
            <div className="form-group">
              <label className="form-label">年利率 (%)</label>
              <input
                type="number"
                value={interestRate}
                onChange={e => setInterestRate(e.target.value)}
                placeholder="如：4.2"
                min="0"
                max="100"
                step="0.01"
              />
            </div>
          )}

          <div className="form-group">
            <label className="form-label">备注</label>
            <textarea
              value={note}
              onChange={e => setNote(e.target.value)}
              placeholder="可选备注信息..."
              rows={2}
            />
          </div>

          <div className="form-actions">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              取消
            </button>
            <button type="submit" className="btn btn-primary">
              {isEditing ? '保存修改' : '确认添加'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
