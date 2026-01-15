import { useState, useEffect, useCallback } from 'react'
import type { AppState, AssetAccount, LiabilityAccount, Snapshot } from '../types'
import { generateId } from '../types'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'

const initialState: AppState = {
  assets: [],
  liabilities: [],
  snapshots: [],
}

export const useAppState = () => {
  const { user } = useAuth()
  const [state, setState] = useState<AppState>(initialState)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) {
      setState(initialState)
      setLoading(false)
      return
    }

    const fetchData = async () => {
      setLoading(true)
      const [assetsRes, liabilitiesRes, snapshotsRes] = await Promise.all([
        supabase.from('assets').select('*').eq('user_id', user.id),
        supabase.from('liabilities').select('*').eq('user_id', user.id),
        supabase.from('snapshots').select('*').eq('user_id', user.id).order('date', { ascending: true }),
      ])

      const assets: AssetAccount[] = (assetsRes.data ?? []).map(a => ({
        id: a.id,
        type: 'asset' as const,
        name: a.name,
        amount: Number(a.amount),
        category: a.category as AssetAccount['category'],
        platform: a.platform ?? undefined,
        note: a.note,
        icon: a.icon,
        createdAt: a.created_at,
        updatedAt: a.updated_at,
      }))

      const liabilities: LiabilityAccount[] = (liabilitiesRes.data ?? []).map(l => ({
        id: l.id,
        type: 'liability' as const,
        name: l.name,
        amount: Number(l.amount),
        category: l.category as LiabilityAccount['category'],
        interestRate: l.interest_rate ? Number(l.interest_rate) : undefined,
        dueDate: l.due_date ?? undefined,
        note: l.note,
        icon: l.icon,
        createdAt: l.created_at,
        updatedAt: l.updated_at,
      }))

      const snapshots: Snapshot[] = (snapshotsRes.data ?? []).map(s => ({
        id: s.id,
        date: s.date,
        totalAssets: Number(s.total_assets),
        totalLiabilities: Number(s.total_liabilities),
        netWorth: Number(s.net_worth),
        breakdown: (s.breakdown as Snapshot['breakdown']) ?? [],
      }))

      setState({ assets, liabilities, snapshots })
      setLoading(false)
    }

    fetchData()
  }, [user])

  const totalAssets = state.assets.reduce((sum, a) => sum + a.amount, 0)
  const totalLiabilities = state.liabilities.reduce((sum, l) => sum + l.amount, 0)
  const netWorth = totalAssets - totalLiabilities

  const addAsset = useCallback(async (asset: Omit<AssetAccount, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (!user) return

    const newId = generateId()
    const now = new Date().toISOString()

    const { error } = await supabase.from('assets').insert({
      id: newId,
      user_id: user.id,
      name: asset.name,
      amount: asset.amount,
      category: asset.category,
      platform: asset.platform,
      note: asset.note ?? '',
      icon: asset.icon ?? '💰',
    })

    if (!error) {
      const newAsset: AssetAccount = {
        ...asset,
        id: newId,
        createdAt: now,
        updatedAt: now,
      }
      setState(prev => ({ ...prev, assets: [...prev.assets, newAsset] }))
    }
  }, [user])

  const updateAsset = useCallback(async (id: string, updates: Partial<AssetAccount>) => {
    if (!user) return

    const { error } = await supabase.from('assets').update({
      name: updates.name,
      amount: updates.amount,
      category: updates.category,
      platform: updates.platform,
      note: updates.note,
      icon: updates.icon,
    }).eq('id', id).eq('user_id', user.id)

    if (!error) {
      setState(prev => ({
        ...prev,
        assets: prev.assets.map(a =>
          a.id === id ? { ...a, ...updates, updatedAt: new Date().toISOString() } : a
        ),
      }))
    }
  }, [user])

  const deleteAsset = useCallback(async (id: string) => {
    if (!user) return

    const { error } = await supabase.from('assets').delete().eq('id', id).eq('user_id', user.id)

    if (!error) {
      setState(prev => ({
        ...prev,
        assets: prev.assets.filter(a => a.id !== id),
      }))
    }
  }, [user])

  const addLiability = useCallback(async (liability: Omit<LiabilityAccount, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (!user) return

    const newId = generateId()
    const now = new Date().toISOString()

    const { error } = await supabase.from('liabilities').insert({
      id: newId,
      user_id: user.id,
      name: liability.name,
      amount: liability.amount,
      category: liability.category,
      interest_rate: liability.interestRate,
      due_date: liability.dueDate,
      note: liability.note ?? '',
      icon: liability.icon ?? '💳',
    })

    if (!error) {
      const newLiability: LiabilityAccount = {
        ...liability,
        id: newId,
        createdAt: now,
        updatedAt: now,
      }
      setState(prev => ({ ...prev, liabilities: [...prev.liabilities, newLiability] }))
    }
  }, [user])

  const updateLiability = useCallback(async (id: string, updates: Partial<LiabilityAccount>) => {
    if (!user) return

    const { error } = await supabase.from('liabilities').update({
      name: updates.name,
      amount: updates.amount,
      category: updates.category,
      interest_rate: updates.interestRate,
      due_date: updates.dueDate,
      note: updates.note,
      icon: updates.icon,
    }).eq('id', id).eq('user_id', user.id)

    if (!error) {
      setState(prev => ({
        ...prev,
        liabilities: prev.liabilities.map(l =>
          l.id === id ? { ...l, ...updates, updatedAt: new Date().toISOString() } : l
        ),
      }))
    }
  }, [user])

  const deleteLiability = useCallback(async (id: string) => {
    if (!user) return

    const { error } = await supabase.from('liabilities').delete().eq('id', id).eq('user_id', user.id)

    if (!error) {
      setState(prev => ({
        ...prev,
        liabilities: prev.liabilities.filter(l => l.id !== id),
      }))
    }
  }, [user])

  const takeSnapshot = useCallback(async () => {
    if (!user) return

    const now = new Date().toISOString().split('T')[0]
    const breakdown = [
      ...state.assets.map(a => ({ category: a.category, amount: a.amount })),
      ...state.liabilities.map(l => ({ category: l.category, amount: -l.amount })),
    ]

    const newId = generateId()

    const { error } = await supabase.from('snapshots').insert({
      id: newId,
      user_id: user.id,
      date: now,
      total_assets: totalAssets,
      total_liabilities: totalLiabilities,
      net_worth: netWorth,
      breakdown,
    })

    if (!error) {
      const snapshot: Snapshot = {
        id: newId,
        date: now,
        totalAssets,
        totalLiabilities,
        netWorth,
        breakdown,
      }
      setState(prev => ({ ...prev, snapshots: [...prev.snapshots, snapshot] }))
    }
  }, [user, state.assets, state.liabilities, totalAssets, totalLiabilities, netWorth])

  const clearAllData = useCallback(async () => {
    if (!user) return

    await Promise.all([
      supabase.from('assets').delete().eq('user_id', user.id),
      supabase.from('liabilities').delete().eq('user_id', user.id),
      supabase.from('snapshots').delete().eq('user_id', user.id),
    ])

    setState(initialState)
  }, [user])

  const loadDemoData = useCallback(async () => {
    if (!user) return

    await clearAllData()

    const now = new Date().toISOString()
    const demoAssets = [
      { name: '招商银行储蓄', category: 'deposit', amount: 150000, platform: '招商银行' },
      { name: '支付宝余额', category: 'cash', amount: 8500, platform: '支付宝' },
      { name: '沪深300指数基金', category: 'fund', amount: 85000, platform: '天天基金' },
      { name: '腾讯股票', category: 'stock', amount: 45000, platform: '富途证券' },
      { name: '自住房产', category: 'realestate', amount: 3500000, note: '深圳南山区' },
      { name: '特斯拉Model 3', category: 'vehicle', amount: 180000 },
      { name: '重疾险现金价值', category: 'insurance', amount: 25000, platform: '平安保险' },
    ]

    const demoLiabilities = [
      { name: '房贷', category: 'mortgage', amount: 2200000, interest_rate: 4.2 },
      { name: '招行信用卡', category: 'credit_card', amount: 15000 },
      { name: '车贷', category: 'car_loan', amount: 80000, interest_rate: 5.5 },
    ]

    const assetInserts = demoAssets.map(a => ({
      id: generateId(),
      user_id: user.id,
      name: a.name,
      amount: a.amount,
      category: a.category,
      platform: a.platform ?? null,
      note: 'note' in a ? a.note : '',
      icon: '💰',
    }))

    const liabilityInserts = demoLiabilities.map(l => ({
      id: generateId(),
      user_id: user.id,
      name: l.name,
      amount: l.amount,
      category: l.category,
      interest_rate: 'interest_rate' in l ? l.interest_rate : null,
      note: '',
      icon: '💳',
    }))

    await supabase.from('assets').insert(assetInserts)
    await supabase.from('liabilities').insert(liabilityInserts)

    const newAssets: AssetAccount[] = assetInserts.map((a, i) => ({
      id: a.id,
      type: 'asset' as const,
      name: a.name,
      amount: a.amount,
      category: a.category as AssetAccount['category'],
      platform: demoAssets[i].platform,
      note: a.note,
      icon: a.icon,
      createdAt: now,
      updatedAt: now,
    }))

    const newLiabilities: LiabilityAccount[] = liabilityInserts.map((l, i) => ({
      id: l.id,
      type: 'liability' as const,
      name: l.name,
      amount: l.amount,
      category: l.category as LiabilityAccount['category'],
      interestRate: demoLiabilities[i].interest_rate,
      note: l.note,
      icon: l.icon,
      createdAt: now,
      updatedAt: now,
    }))

    setState({
      assets: newAssets,
      liabilities: newLiabilities,
      snapshots: [],
    })
  }, [user, clearAllData])

  return {
    state,
    loading,
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
  }
}
