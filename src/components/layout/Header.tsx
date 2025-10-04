import { Button } from '@/components/ui/button'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Receipt, SignOut, User, Gear } from '@phosphor-icons/react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'

interface HeaderProps {
  user: {
    name: string
    email?: string
  } | null
  onLogout: () => void
}

export default function Header({ user, onLogout }: HeaderProps) {
  const navigate = useNavigate()
  
  const handleLogout = () => {
    onLogout()
    toast.success('Logged out successfully')
  }

  const handleProfileClick = () => {
    navigate('/profile')
  }

  const getUserInitials = () => {
    return user?.name
      ?.split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase() || 'U'
  }

  return (
    <header className="border-b bg-card">
      <div className="container mx-auto px-2 sm:px-4 py-3 sm:py-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-0">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-accent rounded-lg flex items-center justify-center flex-shrink-0">
              <Receipt className="w-5 h-5 sm:w-6 sm:h-6 text-accent-foreground" weight="bold" />
            </div>
            <div>
              <h1 className="text-lg sm:text-xl font-bold text-foreground">BPJ Jewellers</h1>
              <p className="text-xs sm:text-sm text-muted-foreground">Digital Billing System</p>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4 w-full sm:w-auto">
            <div className="text-left sm:text-right">
              <p className="text-xs sm:text-sm font-medium">Welcome, {user?.name || 'User'}</p>
              <p className="text-xs text-muted-foreground">GST: 19FNAPS0298Q1ZJ</p>
            </div>
            
            {/* User Profile Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                      {getUserInitials()}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <div className="flex items-center justify-start gap-2 p-2">
                  <div className="flex flex-col space-y-1 leading-none">
                    <p className="font-medium">{user?.name || 'User'}</p>
                    <p className="w-[200px] truncate text-sm text-muted-foreground">
                      {user?.email || 'user@example.com'}
                    </p>
                  </div>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleProfileClick}>
                  <User className="mr-2 h-4 w-4" />
                  <span>Profile</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleProfileClick}>
                  <Gear className="mr-2 h-4 w-4" />
                  <span>Settings</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout}>
                  <SignOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Mobile Logout Button (Hidden on larger screens) */}
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleLogout} 
              className="self-start sm:hidden"
            >
              <SignOut className="w-4 h-4 mr-1" />
              Exit
            </Button>
          </div>
        </div>
      </div>
    </header>
  )
}