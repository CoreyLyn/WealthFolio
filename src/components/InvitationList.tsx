import { useState } from 'react'
import { Check, X, Mail, Clock, Users } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useFamily } from '@/contexts/FamilyContext'
import type { FamilyRole } from '@/types'

export function InvitationList() {
  const { pendingInvitations, acceptInvitation, rejectInvitation } = useFamily()
  const [processingId, setProcessingId] = useState<string | null>(null)

  const handleAction = async (id: string, action: 'accept' | 'reject') => {
    try {
      setProcessingId(id)
      if (action === 'accept') {
        await acceptInvitation(id)
      } else {
        await rejectInvitation(id)
      }
    } catch (error) {
      console.error(`Failed to ${action} invitation:`, error)
    } finally {
      setProcessingId(null)
    }
  }

  const formatExpiry = (dateStr: string) => {
    return new Intl.DateTimeFormat('zh-CN', {
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(new Date(dateStr))
  }

  const getRoleBadgeVariant = (role: FamilyRole) => {
    switch (role) {
      case 'owner': return 'default'
      case 'admin': return 'secondary'
      case 'member': return 'outline'
      default: return 'outline'
    }
  }

  const getRoleLabel = (role: FamilyRole) => {
    switch (role) {
      case 'owner': return '创建者'
      case 'admin': return '管理员'
      case 'member': return '成员'
      default: return role
    }
  }

  if (pendingInvitations.length === 0) {
    return (
      <Card className="border-dashed">
        <CardContent className="flex flex-col items-center justify-center py-8 text-center text-muted-foreground">
          <Mail className="h-8 w-8 mb-3 opacity-50" />
          <p>无待处理邀请</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Mail className="h-5 w-5" />
          待处理邀请
          <Badge variant="secondary" className="ml-auto">
            {pendingInvitations.length}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {pendingInvitations.map((invitation) => (
          <div
            key={invitation.id}
            className="flex flex-col gap-4 rounded-lg border p-4 sm:flex-row sm:items-center sm:justify-between bg-card hover:bg-accent/5 transition-colors"
          >
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-base flex items-center gap-2">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  {invitation.familyName || '未知家庭'}
                </span>
                <Badge variant={getRoleBadgeVariant(invitation.role)}>
                  {getRoleLabel(invitation.role)}
                </Badge>
              </div>
              
              {invitation.inviterEmail && (
                <div className="text-sm text-muted-foreground flex items-center gap-1">
                  <span className="opacity-70">邀请人:</span>
                  {invitation.inviterEmail}
                </div>
              )}
              
              <div className="flex items-center gap-1 text-xs text-muted-foreground/80 pt-1">
                <Clock className="h-3 w-3" />
                <span>过期时间: {formatExpiry(invitation.expiresAt)}</span>
              </div>
            </div>

            <div className="flex items-center gap-2 pt-2 sm:pt-0">
              <Button
                variant="outline"
                size="sm"
                className="flex-1 sm:flex-none text-destructive hover:text-destructive hover:bg-destructive/10"
                onClick={() => handleAction(invitation.id, 'reject')}
                disabled={processingId === invitation.id}
              >
                {processingId === invitation.id ? (
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                ) : (
                  <X className="h-4 w-4 mr-1" />
                )}
                拒绝
              </Button>
              <Button
                size="sm"
                className="flex-1 sm:flex-none"
                onClick={() => handleAction(invitation.id, 'accept')}
                disabled={processingId === invitation.id}
              >
                {processingId === invitation.id ? (
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                ) : (
                  <Check className="h-4 w-4 mr-1" />
                )}
                接受
              </Button>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
