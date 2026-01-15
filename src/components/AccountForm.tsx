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
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"

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
    <Dialog open={true} onOpenChange={(open: boolean) => !open && onClose()}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? '编辑' : '添加'}{formType === 'asset' ? '资产' : '负债'}
          </DialogTitle>
          <DialogDescription>
            {isEditing ? '修改账户信息' : '添加一个新的资产或负债账户'}
          </DialogDescription>
        </DialogHeader>

        {!isEditing && (
          <div className="flex p-1 bg-muted rounded-lg mb-4">
            <Button
              variant={formType === 'asset' ? 'default' : 'ghost'}
              className="flex-1 rounded-md"
              onClick={() => handleTypeChange('asset')}
              size="sm"
            >
              💰 资产
            </Button>
            <Button
              variant={formType === 'liability' ? 'destructive' : 'ghost'}
              className={`flex-1 rounded-md ${formType === 'liability' ? 'bg-red-600 hover:bg-red-700 text-white' : ''}`}
              onClick={() => handleTypeChange('liability')}
              size="sm"
            >
              💳 负债
            </Button>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-2">
            <Label htmlFor="name">名称 *</Label>
            <Input
              id="name"
              value={name}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setName(e.target.value)}
              placeholder={formType === 'asset' ? '如：招商银行储蓄卡' : '如：房贷'}
              required
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="amount">金额 (元) *</Label>
            <Input
              id="amount"
              type="number"
              value={amount}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setAmount(e.target.value)}
              placeholder="0.00"
              min="0"
              step="0.01"
              required
            />
          </div>

          <div className="grid gap-2">
            <Label>类别 *</Label>
            <div className="grid grid-cols-3 gap-2">
              {categories.map(cat => (
                <button
                  key={cat.key}
                  type="button"
                  className={`flex flex-col items-center justify-center p-2 rounded-lg border text-sm transition-all
                    ${category === cat.key
                      ? `border-primary bg-primary/10 text-primary ring-2 ring-primary ring-offset-2`
                      : 'border-input hover:bg-accent hover:text-accent-foreground'
                    }`}
                  onClick={() => setCategory(cat.key)}
                >
                  <span className="text-xl mb-1">{cat.icon}</span>
                  <span>{cat.label}</span>
                </button>
              ))}
            </div>
          </div>

          {formType === 'asset' && (
            <div className="grid gap-2">
              <Label htmlFor="platform">平台/银行</Label>
              <Input
                id="platform"
                value={platform}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPlatform(e.target.value)}
                placeholder="如：招商银行、支付宝"
              />
            </div>
          )}

          {formType === 'liability' && (
            <div className="grid gap-2">
              <Label htmlFor="interestRate">年利率 (%)</Label>
              <Input
                id="interestRate"
                type="number"
                value={interestRate}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setInterestRate(e.target.value)}
                placeholder="如：4.2"
                min="0"
                max="100"
                step="0.01"
              />
            </div>
          )}

          <div className="grid gap-2">
            <Label htmlFor="note">备注</Label>
            <Textarea
              id="note"
              value={note}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setNote(e.target.value)}
              placeholder="可选备注信息..."
              rows={2}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              取消
            </Button>
            <Button type="submit">
              {isEditing ? '保存修改' : '确认添加'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
