import { useState } from 'react';
import { useAppState } from './hooks/useAppState';
import { formatCompactCurrency } from './types';
import type { AssetAccount, LiabilityAccount } from './types';
import { AllocationChart } from './components/AllocationChart';
import { TrendChart } from './components/TrendChart';
import { AccountList } from './components/AccountList';
import { AccountForm } from './components/AccountForm';
import { AuthForm } from './components/AuthForm';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Download, Plus, RefreshCw, Settings, Trash2, LogOut, Loader2 } from 'lucide-react';
import { ThemeProvider } from "@/components/theme-provider"
import { ModeToggle } from "@/components/mode-toggle"
import { AuthProvider, useAuth } from "@/contexts/AuthContext"

type ModalType = 'asset' | 'liability' | null;

function AppContent() {
  const { user, signOut, loading: authLoading } = useAuth();
  const {
    state,
    loading: dataLoading,
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

  const handleSignOut = async () => {
    await signOut();
    setShowSettings(false);
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <AuthForm />
      </div>
    );
  }

  const assetRatio = totalAssets > 0 ? (totalAssets / (totalAssets + totalLiabilities)) * 100 : 50;

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl">💎</span>
            <h1 className="text-xl font-bold">WealthFolio</h1>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground hidden sm:inline">{user.email}</span>
            <ModeToggle />
            <div className="relative">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowSettings(!showSettings)}
              >
                <Settings className="h-5 w-5" />
              </Button>

              {showSettings && (
                <Card className="absolute right-0 top-full mt-2 w-56 z-50">
                  <CardContent className="p-2 grid gap-1">
                    <Button variant="ghost" className="justify-start w-full" onClick={loadDemoData}>
                      <RefreshCw className="mr-2 h-4 w-4" />
                      加载演示数据
                    </Button>
                    <Button variant="ghost" className="justify-start w-full" onClick={takeSnapshot}>
                      <Download className="mr-2 h-4 w-4" />
                      记录快照
                    </Button>
                    <Button variant="ghost" className="justify-start w-full text-destructive hover:text-destructive" onClick={handleClearData}>
                      <Trash2 className="mr-2 h-4 w-4" />
                      清除所有数据
                    </Button>
                    <hr className="my-1" />
                    <Button variant="ghost" className="justify-start w-full" onClick={handleSignOut}>
                      <LogOut className="mr-2 h-4 w-4" />
                      退出登录
                    </Button>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 space-y-8">
        {dataLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <>
            <section className="grid gap-6 md:grid-cols-3">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">净资产</CardTitle>
                  <span className="text-2xl">💰</span>
                </CardHeader>
                <CardContent>
                  <div className={`text-2xl font-bold ${netWorth >= 0 ? 'text-green-600 dark:text-green-500' : 'text-red-600 dark:text-red-500'}`}>
                    {formatCompactCurrency(netWorth)}
                  </div>
                  <div className="mt-4 h-2 w-full bg-secondary rounded-full overflow-hidden">
                    <div
                      className="h-full bg-green-500"
                      style={{ width: `${assetRatio}%` }}
                    />
                  </div>
                  <div className="mt-2 flex justify-between text-xs text-muted-foreground">
                    <span>资产 {assetRatio.toFixed(0)}%</span>
                    <span>负债 {(100 - assetRatio).toFixed(0)}%</span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">总资产</CardTitle>
                  <Button size="sm" variant="outline" className="h-8" onClick={() => setModalType('asset')}>
                    <Plus className="mr-2 h-4 w-4" /> 添加
                  </Button>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600 dark:text-green-500">
                    {formatCompactCurrency(totalAssets)}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {state.assets.length} 个账户
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">总负债</CardTitle>
                  <Button size="sm" variant="outline" className="h-8" onClick={() => setModalType('liability')}>
                    <Plus className="mr-2 h-4 w-4" /> 添加
                  </Button>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-red-600 dark:text-red-500">
                    {formatCompactCurrency(totalLiabilities)}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {state.liabilities.length} 个账户
                  </p>
                </CardContent>
              </Card>
            </section>

            <Tabs defaultValue="dashboard" className="space-y-6">
              <TabsList>
                <TabsTrigger value="dashboard">资产概览</TabsTrigger>
                <TabsTrigger value="accounts">账户明细</TabsTrigger>
              </TabsList>

              <TabsContent value="dashboard" className="space-y-6">
                <div className="grid gap-6 md:grid-cols-2">
                  <Card>
                    <CardHeader>
                      <CardTitle>资产配置</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <AllocationChart
                        assets={state.assets}
                        liabilities={state.liabilities}
                        type="asset"
                      />
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>负债构成</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <AllocationChart
                        assets={state.assets}
                        liabilities={state.liabilities}
                        type="liability"
                      />
                    </CardContent>
                  </Card>

                  <Card className="md:col-span-2">
                    <CardHeader className="flex flex-row items-center justify-between">
                      <div>
                        <CardTitle>资产趋势</CardTitle>
                        <CardDescription>净资产随时间的变化趋势</CardDescription>
                      </div>
                      <Button variant="outline" size="sm" onClick={takeSnapshot}>
                        <Download className="mr-2 h-4 w-4" /> 记录快照
                      </Button>
                    </CardHeader>
                    <CardContent>
                      <TrendChart snapshots={state.snapshots} />
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="accounts">
                <Card>
                  <CardContent className="p-0">
                    <AccountList
                      assets={state.assets}
                      liabilities={state.liabilities}
                      onEditAsset={handleEditAsset}
                      onEditLiability={handleEditLiability}
                      onDeleteAsset={deleteAsset}
                      onDeleteLiability={deleteLiability}
                    />
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </>
        )}
      </main>

      <footer className="border-t py-8 mt-auto">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>家庭资产管理 · 记录财富 · 规划未来</p>
        </div>
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

function App() {
  return (
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
