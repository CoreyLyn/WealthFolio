import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'
import type { Family, FamilyMember, FamilyInvitation, FamilyRole } from '@/types'
import { generateId } from '@/types'

interface FamilyContextType {
  families: Family[]
  currentFamily: Family | null
  members: FamilyMember[]
  invitations: FamilyInvitation[]
  pendingInvitations: FamilyInvitation[]
  loading: boolean
  setCurrentFamily: (family: Family | null) => void
  createFamily: (name: string) => Promise<Family | null>
  updateFamily: (id: string, name: string) => Promise<void>
  deleteFamily: (id: string) => Promise<void>
  inviteMember: (email: string, role?: FamilyRole) => Promise<{ error?: string }>
  cancelInvitation: (id: string) => Promise<void>
  acceptInvitation: (id: string) => Promise<void>
  rejectInvitation: (id: string) => Promise<void>
  removeMember: (memberId: string) => Promise<void>
  updateMemberRole: (memberId: string, role: FamilyRole) => Promise<void>
  leaveFamily: () => Promise<void>
  refreshData: () => Promise<void>
}

const FamilyContext = createContext<FamilyContextType | undefined>(undefined)

export function FamilyProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth()
  const [families, setFamilies] = useState<Family[]>([])
  const [currentFamily, setCurrentFamily] = useState<Family | null>(null)
  const [members, setMembers] = useState<FamilyMember[]>([])
  const [invitations, setInvitations] = useState<FamilyInvitation[]>([])
  const [pendingInvitations, setPendingInvitations] = useState<FamilyInvitation[]>([])
  const [loading, setLoading] = useState(true)

  const fetchFamilies = useCallback(async () => {
    if (!user) return []

    const { data } = await supabase
      .from('family_members')
      .select('family_id, families!inner(id, name, created_by, created_at, updated_at)')
      .eq('user_id', user.id)

    const result: Family[] = (data ?? []).map((item) => {
      const f = item.families as unknown as { id: string; name: string; created_by: string; created_at: string; updated_at: string }
      return {
        id: f.id,
        name: f.name,
        createdBy: f.created_by,
        createdAt: f.created_at,
        updatedAt: f.updated_at,
      }
    })
    return result
  }, [user])

  const fetchMembers = useCallback(async (familyId: string) => {
    // 先获取成员列表
    const { data } = await supabase
      .from('family_members')
      .select('id, family_id, user_id, role, joined_at')
      .eq('family_id', familyId)

    if (!data) return []

    // 获取用户邮箱（通过 profiles 视图）
    const userIds = data.map(m => m.user_id)
    const { data: profilesData } = await supabase
      .from('profiles')
      .select('id, email')
      .in('id', userIds)

    const emailMap = new Map(profilesData?.map(p => [p.id, p.email]) ?? [])

    const result: FamilyMember[] = data.map((m) => ({
      id: m.id,
      familyId: m.family_id,
      userId: m.user_id,
      email: emailMap.get(m.user_id),
      role: m.role as FamilyRole,
      joinedAt: m.joined_at,
    }))
    return result
  }, [])

  const fetchInvitations = useCallback(async (familyId: string) => {
    const { data } = await supabase
      .from('family_invitations')
      .select('*')
      .eq('family_id', familyId)
      .eq('status', 'pending')

    const result: FamilyInvitation[] = (data ?? []).map((i) => ({
      id: i.id,
      familyId: i.family_id,
      inviterId: i.inviter_id,
      inviteeEmail: i.invitee_email,
      inviteeId: i.invitee_id ?? undefined,
      status: i.status,
      role: i.role as FamilyRole,
      createdAt: i.created_at,
      expiresAt: i.expires_at,
      respondedAt: i.responded_at ?? undefined,
    }))
    return result
  }, [])

  const fetchPendingInvitations = useCallback(async () => {
    if (!user?.email) return []

    const { data } = await supabase
      .from('family_invitations')
      .select('*, families!inner(name)')
      .eq('invitee_email', user.email)
      .eq('status', 'pending')

    const result: FamilyInvitation[] = (data ?? []).map((i) => ({
      id: i.id,
      familyId: i.family_id,
      familyName: (i.families as { name?: string } | null)?.name,
      inviterId: i.inviter_id,
      inviteeEmail: i.invitee_email,
      inviteeId: i.invitee_id ?? undefined,
      status: i.status,
      role: i.role as FamilyRole,
      createdAt: i.created_at,
      expiresAt: i.expires_at,
      respondedAt: i.responded_at ?? undefined,
    }))
    return result
  }, [user])

  const refreshData = useCallback(async () => {
    if (!user) {
      setFamilies([])
      setCurrentFamily(null)
      setMembers([])
      setInvitations([])
      setPendingInvitations([])
      setLoading(false)
      return
    }

    setLoading(true)
    const [familyList, pending] = await Promise.all([
      fetchFamilies(),
      fetchPendingInvitations(),
    ])

    setFamilies(familyList)
    setPendingInvitations(pending)

    if (currentFamily) {
      const stillMember = familyList.find(f => f.id === currentFamily.id)
      if (stillMember) {
        const [memberList, inviteList] = await Promise.all([
          fetchMembers(currentFamily.id),
          fetchInvitations(currentFamily.id),
        ])
        setMembers(memberList)
        setInvitations(inviteList)
      } else {
        setCurrentFamily(null)
        setMembers([])
        setInvitations([])
      }
    }

    setLoading(false)
  }, [user, currentFamily, fetchFamilies, fetchMembers, fetchInvitations, fetchPendingInvitations])

  useEffect(() => {
    refreshData()
  }, [user])

  useEffect(() => {
    if (currentFamily) {
      Promise.all([
        fetchMembers(currentFamily.id),
        fetchInvitations(currentFamily.id),
      ]).then(([m, i]) => {
        setMembers(m)
        setInvitations(i)
      })
    } else {
      setMembers([])
      setInvitations([])
    }
  }, [currentFamily, fetchMembers, fetchInvitations])

  const createFamily = useCallback(async (name: string): Promise<Family | null> => {
    if (!user) return null

    // 让数据库自动生成 UUID，不手动指定 id
    const { data: familyData, error: familyError } = await supabase
      .from('families')
      .insert({
        name,
        created_by: user.id,
      })
      .select()
      .single()

    if (familyError || !familyData) {
      console.error('创建家庭失败:', familyError)
      return null
    }

    // 同样让数据库自动生成成员记录的 UUID
    const { error: memberError } = await supabase.from('family_members').insert({
      family_id: familyData.id,
      user_id: user.id,
      role: 'owner',
    })

    if (memberError) {
      console.error('添加家庭成员失败:', memberError)
      // 如果添加成员失败，清理已创建的家庭
      await supabase.from('families').delete().eq('id', familyData.id)
      return null
    }

    const newFamily: Family = {
      id: familyData.id,
      name: familyData.name,
      createdBy: familyData.created_by,
      createdAt: familyData.created_at,
      updatedAt: familyData.updated_at,
    }

    setFamilies(prev => [...prev, newFamily])
    setCurrentFamily(newFamily)
    return newFamily
  }, [user])

  const updateFamily = useCallback(async (id: string, name: string) => {
    const { error } = await supabase
      .from('families')
      .update({ name })
      .eq('id', id)

    if (!error) {
      setFamilies(prev => prev.map(f => f.id === id ? { ...f, name } : f))
      if (currentFamily?.id === id) {
        setCurrentFamily(prev => prev ? { ...prev, name } : null)
      }
    }
  }, [currentFamily])

  const deleteFamily = useCallback(async (id: string) => {
    const { error } = await supabase.from('families').delete().eq('id', id)

    if (!error) {
      setFamilies(prev => prev.filter(f => f.id !== id))
      if (currentFamily?.id === id) {
        setCurrentFamily(null)
      }
    }
  }, [currentFamily])

  const inviteMember = useCallback(async (email: string, role: FamilyRole = 'member'): Promise<{ error?: string }> => {
    if (!user || !currentFamily) return { error: '请先选择一个家庭' }

    const existingMember = members.find(m => m.email?.toLowerCase() === email.toLowerCase())
    if (existingMember) {
      return { error: '该用户已经是家庭成员' }
    }

    const existingInvite = invitations.find(i => i.inviteeEmail.toLowerCase() === email.toLowerCase())
    if (existingInvite) {
      return { error: '已经向该邮箱发送过邀请' }
    }

    const { error } = await supabase.from('family_invitations').insert({
      id: generateId(),
      family_id: currentFamily.id,
      inviter_id: user.id,
      invitee_email: email.toLowerCase(),
      role,
    })

    if (error) {
      return { error: '发送邀请失败' }
    }

    await refreshData()
    return {}
  }, [user, currentFamily, members, invitations, refreshData])

  const cancelInvitation = useCallback(async (id: string) => {
    await supabase.from('family_invitations').delete().eq('id', id)
    setInvitations(prev => prev.filter(i => i.id !== id))
  }, [])

  const acceptInvitation = useCallback(async (id: string) => {
    if (!user) return

    const invitation = pendingInvitations.find(i => i.id === id)
    if (!invitation) return

    const { error: updateError } = await supabase
      .from('family_invitations')
      .update({
        status: 'accepted',
        invitee_id: user.id,
        responded_at: new Date().toISOString(),
      })
      .eq('id', id)

    if (updateError) return

    const { error: memberError } = await supabase.from('family_members').insert({
      id: generateId(),
      family_id: invitation.familyId,
      user_id: user.id,
      role: invitation.role,
    })

    if (!memberError) {
      await refreshData()
    }
  }, [user, pendingInvitations, refreshData])

  const rejectInvitation = useCallback(async (id: string) => {
    if (!user) return

    await supabase
      .from('family_invitations')
      .update({
        status: 'rejected',
        invitee_id: user.id,
        responded_at: new Date().toISOString(),
      })
      .eq('id', id)

    setPendingInvitations(prev => prev.filter(i => i.id !== id))
  }, [user])

  const removeMember = useCallback(async (memberId: string) => {
    await supabase.from('family_members').delete().eq('id', memberId)
    setMembers(prev => prev.filter(m => m.id !== memberId))
  }, [])

  const updateMemberRole = useCallback(async (memberId: string, role: FamilyRole) => {
    const { error } = await supabase
      .from('family_members')
      .update({ role })
      .eq('id', memberId)

    if (!error) {
      setMembers(prev => prev.map(m => m.id === memberId ? { ...m, role } : m))
    }
  }, [])

  const leaveFamily = useCallback(async () => {
    if (!user || !currentFamily) return

    const myMembership = members.find(m => m.userId === user.id)
    if (!myMembership) return

    if (myMembership.role === 'owner' && members.length > 1) {
      return
    }

    await supabase.from('family_members').delete().eq('id', myMembership.id)

    if (members.length === 1) {
      await supabase.from('families').delete().eq('id', currentFamily.id)
    }

    await refreshData()
  }, [user, currentFamily, members, refreshData])

  return (
    <FamilyContext.Provider value={{
      families,
      currentFamily,
      members,
      invitations,
      pendingInvitations,
      loading,
      setCurrentFamily,
      createFamily,
      updateFamily,
      deleteFamily,
      inviteMember,
      cancelInvitation,
      acceptInvitation,
      rejectInvitation,
      removeMember,
      updateMemberRole,
      leaveFamily,
      refreshData,
    }}>
      {children}
    </FamilyContext.Provider>
  )
}

export function useFamily() {
  const context = useContext(FamilyContext)
  if (context === undefined) {
    throw new Error('useFamily must be used within a FamilyProvider')
  }
  return context
}
