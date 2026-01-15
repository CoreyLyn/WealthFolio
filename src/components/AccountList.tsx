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
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Edit2, Trash2 } from 'lucide-react';
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";

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
    <div className="space-y-4">
      <ScrollArea className="w-full whitespace-nowrap pb-2">
        <div className="flex space-x-2 p-1">
          <Button
            variant={activeTab === 'all' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setActiveTab('all')}
            className="rounded-full"
          >
            全部
          </Button>
          {assetCategories.map(cat => (
            <Button
              key={cat.key}
              variant={activeTab === cat.key ? 'default' : 'outline'}
              size="sm"
              onClick={() => setActiveTab(cat.key as TabType)}
              className="rounded-full"
            >
              <span className="mr-1">{cat.icon}</span>
              {cat.label}
            </Button>
          ))}
          {liabilityCategories.map(cat => (
            <Button
              key={cat.key}
              variant={activeTab === cat.key ? 'destructive' : 'outline'}
              size="sm"
              onClick={() => setActiveTab(cat.key as TabType)}
              className={`rounded-full ${activeTab !== cat.key ? 'text-red-500 border-red-200 hover:bg-red-50' : ''}`}
            >
              <span className="mr-1">{cat.icon}</span>
              {cat.label}
            </Button>
          ))}
        </div>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>

      <div className="space-y-2">
        {filteredAssets.length === 0 && filteredLiabilities.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <div className="text-4xl mb-2">📋</div>
            <div className="text-lg font-medium">暂无账户</div>
            <p className="text-sm">点击上方按钮添加资产或负债</p>
          </div>
        ) : (
          <>
            {filteredAssets.map(asset => {
              const config = getCategoryConfig(asset.category);
              return (
                <div key={asset.id} className="flex items-center justify-between p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors">
                  <div className="flex items-center gap-4">
                    <div
                      className="w-10 h-10 rounded-full flex items-center justify-center text-lg"
                      style={{ background: `${config?.color}20`, color: config?.color }}
                    >
                      {config?.icon}
                    </div>
                    <div>
                      <div className="font-medium">{asset.name}</div>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        {asset.platform && <Badge variant="secondary" className="text-[10px] px-1 py-0">{asset.platform}</Badge>}
                        <span>{config?.label}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="font-bold text-green-600 dark:text-green-500">
                      {formatCurrency(asset.amount)}
                    </div>

                    <div className="flex items-center gap-1">
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => onEditAsset(asset)}>
                        <Edit2 className="h-4 w-4" />
                      </Button>

                      {showDeleteConfirm === asset.id ? (
                        <div className="flex items-center gap-1">
                          <Button size="sm" variant="destructive" className="h-7 px-2" onClick={() => handleDelete(asset.id, 'asset')}>
                            确认
                          </Button>
                          <Button size="sm" variant="ghost" className="h-7 px-2" onClick={() => setShowDeleteConfirm(null)}>
                            取消
                          </Button>
                        </div>
                      ) : (
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive" onClick={() => setShowDeleteConfirm(asset.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}

            {filteredLiabilities.map(liability => {
              const config = getCategoryConfig(liability.category);
              return (
                <div key={liability.id} className="flex items-center justify-between p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors">
                  <div className="flex items-center gap-4">
                    <div
                      className="w-10 h-10 rounded-full flex items-center justify-center text-lg"
                      style={{ background: `${config?.color}20`, color: config?.color }}
                    >
                      {config?.icon}
                    </div>
                    <div>
                      <div className="font-medium">{liability.name}</div>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        {liability.interestRate && (
                          <Badge variant="outline" className="text-[10px] px-1 py-0 border-red-200 text-red-500">
                            年利率 {liability.interestRate}%
                          </Badge>
                        )}
                        <span>{config?.label}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="font-bold text-red-600 dark:text-red-500">
                      -{formatCurrency(liability.amount)}
                    </div>

                    <div className="flex items-center gap-1">
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => onEditLiability(liability)}>
                        <Edit2 className="h-4 w-4" />
                      </Button>

                      {showDeleteConfirm === liability.id ? (
                        <div className="flex items-center gap-1">
                          <Button size="sm" variant="destructive" className="h-7 px-2" onClick={() => handleDelete(liability.id, 'liability')}>
                            确认
                          </Button>
                          <Button size="sm" variant="ghost" className="h-7 px-2" onClick={() => setShowDeleteConfirm(null)}>
                            取消
                          </Button>
                        </div>
                      ) : (
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive" onClick={() => setShowDeleteConfirm(liability.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
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
