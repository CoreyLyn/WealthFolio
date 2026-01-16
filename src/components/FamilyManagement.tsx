import { useState } from 'react'
import { Plus, Trash2, UserPlus, X, Shield, Crown, User, Users, Mail } from 'lucide-react'
import { useFamily } from '@/contexts/FamilyContext'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Loader2 } from 'lucide-react'
import type { FamilyRole } from '@/types'

export function FamilyManagement() {
  const { 
    families, 
    currentFamily, 
    members, 
    invitations, 
    loading,
    setCurrentFamily, 
    createFamily, 
    inviteMember, 
    cancelInvitation, 
    removeMember,
    leaveFamily 
  } = useFamily()
  
  const { user } = useAuth()
  
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [newFamilyName, setNewFamilyName] = useState('')
  const [isInviteOpen, setIsInviteOpen] = useState(false)
  const [inviteEmail, setInviteEmail] = useState('')
  const [inviteLoading, setInviteLoading] = useState(false)
  const [createLoading, setCreateLoading] = useState(false)

  const currentUserRole = members.find(m => m.userId === user?.id)?.role
  const canManage = currentUserRole === 'owner' || currentUserRole === 'admin'

  const handleFamilyChange = (value: string) => {
    if (value === 'create_new') {
      setIsCreateOpen(true)
      return
    }
    const family = families.find(f => f.id === value)
    if (family) {
      setCurrentFamily(family)
    }
  }

  const handleCreateFamily = async () => {
    if (!newFamilyName.trim()) return
    setCreateLoading(true)
    try {
      await createFamily(newFamilyName)
      setNewFamilyName('')
      setIsCreateOpen(false)
    } finally {
      setCreateLoading(false)
    }
  }

  const handleInvite = async () => {
    if (!inviteEmail.trim()) return
    setInviteLoading(true)
    try {
      const { error } = await inviteMember(inviteEmail)
      if (!error) {
        setInviteEmail('')
        setIsInviteOpen(false)
      } else {
        alert(error)
      }
    } finally {
      setInviteLoading(false)
    }
  }

  const getRoleBadge = (role: FamilyRole) => {
    switch (role) {
      case 'owner':
        return <Badge className="bg-yellow-500/15 text-yellow-600 hover:bg-yellow-500/25 border-yellow-200"><Crown className="w-3 h-3 mr-1" /> 所有者</Badge>
      case 'admin':
        return <Badge className="bg-blue-500/15 text-blue-600 hover:bg-blue-500/25 border-blue-200"><Shield className="w-3 h-3 mr-1" /> 管理员</Badge>
      default:
        return <Badge variant="secondary" className="text-muted-foreground"><User className="w-3 h-3 mr-1" /> 成员</Badge>
    }
  }

  if (loading && !currentFamily && families.length === 0) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
        <div>
          <h2 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <Users className="w-6 h-6" />
            家庭管理
          </h2>
          <p className="text-muted-foreground">
            管理您的家庭成员和权限
          </p>
        </div>
        
        <div className="w-full sm:w-[240px]">
          <Select 
            value={currentFamily?.id || ''} 
            onValueChange={handleFamilyChange}
          >
            <SelectTrigger>
              <SelectValue placeholder="选择家庭" />
            </SelectTrigger>
            <SelectContent>
              {families.map((family) => (
                <SelectItem key={family.id} value={family.id}>
                  {family.name}
                </SelectItem>
              ))}
              <SelectItem value="create_new" className="text-primary font-medium border-t mt-1 pt-1">
                <div className="flex items-center">
                  <Plus className="w-4 h-4 mr-2" />
                  创建新家庭
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {!currentFamily ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <div className="bg-primary/10 p-4 rounded-full mb-4">
              <Users className="w-8 h-8 text-primary" />
            </div>
            <h3 className="text-lg font-semibold">暂无家庭</h3>
            <p className="text-sm text-muted-foreground max-w-sm mt-2 mb-6">
              创建一个家庭来开始管理您的共同资产，或者等待被邀请加入现有家庭。
            </p>
            <Button onClick={() => setIsCreateOpen(true)}>
              创建家庭
            </Button>
          </CardContent>
        </Card>
      ) : (
        <>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>成员列表</CardTitle>
                <CardDescription>
                  当前家庭共有 {members.length} 位成员
                </CardDescription>
              </div>
              {canManage && (
                <Button onClick={() => setIsInviteOpen(true)} size="sm">
                  <UserPlus className="w-4 h-4 mr-2" />
                  邀请成员
                </Button>
              )}
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {members.map((member) => (
                  <div key={member.id} className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/50 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-medium text-lg">
                        {member.email?.[0].toUpperCase() || 'U'}
                      </div>
                      <div>
                        <div className="font-medium flex items-center gap-2">
                          {member.email?.split('@')[0]}
                          {member.userId === user?.id && (
                            <span className="text-xs text-muted-foreground">(我)</span>
                          )}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {member.email}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      {getRoleBadge(member.role)}
                      {canManage && member.role !== 'owner' && member.userId !== user?.id && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-muted-foreground hover:text-destructive"
                          onClick={() => removeMember(member.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {invitations.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base font-semibold">等待接受的邀请</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {invitations.map((invitation) => (
                    <div key={invitation.id} className="flex items-center justify-between p-3 border rounded-md bg-muted/20">
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center text-muted-foreground">
                          <Mail className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="text-sm font-medium">{invitation.inviteeEmail}</div>
                          <div className="text-xs text-muted-foreground">
                            发送于 {new Date(invitation.createdAt).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-xs font-normal">
                          等待回复
                        </Badge>
                        {canManage && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-muted-foreground hover:text-destructive"
                            onClick={() => cancelInvitation(invitation.id)}
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          <div className="flex justify-end pt-4">
             {currentUserRole !== 'owner' && (
                <Button variant="ghost" className="text-destructive hover:text-destructive/90 hover:bg-destructive/10" onClick={leaveFamily}>
                  退出家庭
                </Button>
             )}
          </div>
        </>
      )}

      <Dialog open={isInviteOpen} onOpenChange={setIsInviteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>邀请成员</DialogTitle>
            <DialogDescription>
              发送邀请邮件给您的家庭成员。他们接受后将加入当前家庭。
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="email">邮箱地址</Label>
              <Input
                id="email"
                placeholder="name@example.com"
                type="email"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsInviteOpen(false)}>取消</Button>
            <Button onClick={handleInvite} disabled={!inviteEmail || inviteLoading}>
              {inviteLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              发送邀请
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>创建新家庭</DialogTitle>
            <DialogDescription>
              创建一个新的家庭空间来管理共同资产。
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="familyName">家庭名称</Label>
              <Input
                id="familyName"
                placeholder="例如：我的小家"
                value={newFamilyName}
                onChange={(e) => setNewFamilyName(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateOpen(false)}>取消</Button>
            <Button onClick={handleCreateFamily} disabled={!newFamilyName || createLoading}>
              {createLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              创建
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
