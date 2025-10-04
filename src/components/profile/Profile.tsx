import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import { useAuth } from '@/components/auth/AuthContext'
import { authAPI } from '@/lib/api'
import { toast } from 'sonner'
import { User, Lock, Building, Envelope, Phone, Calendar, Shield, ArrowLeft, House } from '@phosphor-icons/react'

export default function Profile() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [isChangingPassword, setIsChangingPassword] = useState(false)
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })

  const handleBackToHome = () => {
    navigate('/')
  }

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error('New passwords do not match')
      return
    }

    if (passwordForm.newPassword.length < 6) {
      toast.error('Password must be at least 6 characters')
      return
    }

    try {
      await authAPI.changePassword(passwordForm.currentPassword, passwordForm.newPassword)
      toast.success('Password changed successfully')
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' })
      setIsChangingPassword(false)
    } catch (error) {
      toast.error('Failed to change password')
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-2 sm:px-4 py-4 sm:py-6">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Back to Home Button */}
          <div className="flex items-center gap-3">
            <Button 
              variant="ghost" 
              onClick={handleBackToHome}
              className="flex items-center gap-2 text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="hidden sm:inline">Back</span>
            </Button>
            <div className="h-4 w-px bg-border" />
            <Button 
              variant="outline" 
              size="sm"
              onClick={handleBackToHome}
              className="flex items-center gap-2"
            >
              <House className="w-4 h-4" />
              <span className="hidden sm:inline">Home</span>
            </Button>
          </div>

          {/* Header */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold">Profile Settings</h1>
              <p className="text-muted-foreground">Manage your account settings and preferences</p>
            </div>
            <Badge variant="outline" className="flex items-center gap-2">
              <Shield className="w-3 h-3" />
              Admin Account
            </Badge>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Profile Information */}
            <div className="lg:col-span-2 space-y-6">
              {/* Basic Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="w-5 h-5" />
                    Basic Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="name">Full Name</Label>
                      <Input
                        id="name"
                        value={user?.name || ''}
                        disabled
                        className="bg-muted"
                      />
                    </div>
                    <div>
                      <Label htmlFor="email">Email Address</Label>
                      <Input
                        id="email"
                        type="email"
                        value={user?.email || ''}
                        disabled
                        className="bg-muted"
                      />
                    </div>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Contact administrator to update basic information
                  </div>
                </CardContent>
              </Card>

              {/* Business Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Building className="w-5 h-5" />
                    Business Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <Label>Business Name</Label>
                      <Input value="BPJ Jewellers" disabled className="bg-muted" />
                    </div>
                    <div>
                      <Label>GST Number</Label>
                      <Input value="19FNAPS0298Q1ZJ" disabled className="bg-muted" />
                    </div>
                  </div>
                  <div>
                    <Label>Business Address</Label>
                    <Input 
                      value="123 Jewelry Street, Gold Market, Mumbai - 400001" 
                      disabled 
                      className="bg-muted" 
                    />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <Label>Phone Number</Label>
                      <Input value="+91 98765 43210" disabled className="bg-muted" />
                    </div>
                    <div>
                      <Label>Business Email</Label>
                      <Input value="contact@bpjjewellers.com" disabled className="bg-muted" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Security Settings */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Lock className="w-5 h-5" />
                    Security Settings
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {!isChangingPassword ? (
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                      <div>
                        <h3 className="font-medium">Password</h3>
                        <p className="text-sm text-muted-foreground">
                          Last updated: {new Date().toLocaleDateString()}
                        </p>
                      </div>
                      <Button onClick={() => setIsChangingPassword(true)}>
                        Change Password
                      </Button>
                    </div>
                  ) : (
                    <form onSubmit={handlePasswordChange} className="space-y-4">
                      <div>
                        <Label htmlFor="currentPassword">Current Password</Label>
                        <Input
                          id="currentPassword"
                          type="password"
                          value={passwordForm.currentPassword}
                          onChange={(e) => setPasswordForm(prev => ({ ...prev, currentPassword: e.target.value }))}
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="newPassword">New Password</Label>
                        <Input
                          id="newPassword"
                          type="password"
                          value={passwordForm.newPassword}
                          onChange={(e) => setPasswordForm(prev => ({ ...prev, newPassword: e.target.value }))}
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="confirmPassword">Confirm New Password</Label>
                        <Input
                          id="confirmPassword"
                          type="password"
                          value={passwordForm.confirmPassword}
                          onChange={(e) => setPasswordForm(prev => ({ ...prev, confirmPassword: e.target.value }))}
                          required
                        />
                      </div>
                      <div className="flex gap-2">
                        <Button type="submit">Update Password</Button>
                        <Button 
                          type="button" 
                          variant="outline"
                          onClick={() => {
                            setIsChangingPassword(false)
                            setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' })
                          }}
                        >
                          Cancel
                        </Button>
                      </div>
                    </form>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Account Status */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Account Status</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Status</span>
                    <Badge variant="default" className="bg-green-100 text-green-800">
                      Active
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Role</span>
                    <Badge variant="secondary">Administrator</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Member Since</span>
                    <span className="text-sm text-muted-foreground">Jan 2024</span>
                  </div>
                </CardContent>
              </Card>

              {/* Quick Stats */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Quick Stats</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Total Bills Created</span>
                    <span className="font-medium">1,234</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Total Customers</span>
                    <span className="font-medium">456</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Last Login</span>
                    <span className="text-sm text-muted-foreground">Today</span>
                  </div>
                </CardContent>
              </Card>

              {/* Help & Support */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Help & Support</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button variant="outline" className="w-full justify-start">
                    <Envelope className="w-4 h-4 mr-2" />
                    Contact Support
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <Phone className="w-4 h-4 mr-2" />
                    Call Support
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}