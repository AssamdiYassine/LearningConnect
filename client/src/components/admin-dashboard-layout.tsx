import { useState } from 'react';
import { Link, useLocation } from 'wouter';
import {
  BarChart,
  Users,
  Settings,
  Bell,
  LogOut,
  Layout,
  BookOpen,
  CheckSquare,
  FileText,
  Tag,
  Home
} from 'lucide-react';
import NotificationBell from './notification-bell';
import { useAuth } from '@/hooks/use-auth';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface AdminDashboardLayoutProps {
  children: React.ReactNode;
}

export default function AdminDashboardLayout({ children }: AdminDashboardLayoutProps) {
  const [location] = useLocation();
  const { user, logoutMutation } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  // Get user initials for avatar
  const getInitials = (name: string) => {
    if (!name) return 'AD';
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  const isActive = (path: string) => {
    return location === path;
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-30">
        <div className="flex h-16 items-center justify-between px-4 sm:px-6">
          <div className="flex items-center">
            {/* Mobile menu button */}
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="text-gray-500 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-primary md:hidden"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d={isSidebarOpen ? 'M6 18L18 6M6 6l12 12' : 'M4 6h16M4 12h16M4 18h16'}
                />
              </svg>
            </button>

            {/* Logo */}
            <Link href="/">
              <a className="flex items-center ml-2 md:ml-0">
                <div className="text-2xl font-bold text-primary">Necform</div>
                <div className="ml-2 text-lg font-medium text-primary/70">| Admin</div>
              </a>
            </Link>
          </div>

          {/* Right side - User menu, notifications, etc. */}
          <div className="flex items-center space-x-4">
            <NotificationBell />

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                  <Avatar>
                    <AvatarImage src="" />
                    <AvatarFallback className="bg-primary text-primary-foreground">
                      {user ? getInitials(user.displayName || user.username) : 'AD'}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <div className="flex items-center justify-start gap-2 p-2">
                  <div className="flex flex-col space-y-0.5 leading-none">
                    <p className="font-medium text-sm">{user?.displayName || user?.username}</p>
                    <p className="w-[180px] truncate text-xs text-muted-foreground">{user?.email}</p>
                  </div>
                </div>
                <DropdownMenuItem asChild>
                  <Link href="/profile">
                    <a className="cursor-pointer w-full">Mon profil</a>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/settings">
                    <a className="cursor-pointer w-full">Paramètres</a>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem className="text-red-600" onClick={handleLogout}>
                  Se déconnecter
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <aside
          className={`bg-white border-r border-gray-200 w-64 flex-shrink-0 fixed md:sticky top-16 h-[calc(100vh-4rem)] z-20 transition-transform duration-200 ease-in-out ${
            isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
          } md:translate-x-0`}
        >
          <div className="flex flex-col h-full py-4 overflow-y-auto">
            <nav className="space-y-1 px-2">
              <Link href="/admin-dashboard-new">
                <a
                  className={`flex items-center px-3 py-2.5 text-sm font-medium rounded-md ${
                    isActive('/admin-dashboard-new')
                      ? 'bg-primary/10 text-primary'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <BarChart className="h-5 w-5 mr-2" />
                  Tableau de bord
                </a>
              </Link>

              <Link href="/admin/users">
                <a
                  className={`flex items-center px-3 py-2.5 text-sm font-medium rounded-md ${
                    isActive('/admin/users')
                      ? 'bg-primary/10 text-primary'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <Users className="h-5 w-5 mr-2" />
                  Gestion utilisateurs
                </a>
              </Link>

              <Link href="/admin/courses">
                <a
                  className={`flex items-center px-3 py-2.5 text-sm font-medium rounded-md ${
                    isActive('/admin/courses')
                      ? 'bg-primary/10 text-primary'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <BookOpen className="h-5 w-5 mr-2" />
                  Gestion des cours
                </a>
              </Link>

              <Link href="/admin/approvals">
                <a
                  className={`flex items-center px-3 py-2.5 text-sm font-medium rounded-md ${
                    isActive('/admin/approvals')
                      ? 'bg-primary/10 text-primary'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <CheckSquare className="h-5 w-5 mr-2" />
                  Approbations
                </a>
              </Link>

              <Link href="/admin/blog">
                <a
                  className={`flex items-center px-3 py-2.5 text-sm font-medium rounded-md ${
                    isActive('/admin/blog')
                      ? 'bg-primary/10 text-primary'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <FileText className="h-5 w-5 mr-2" />
                  Gestion du blog
                </a>
              </Link>

              <Link href="/admin/categories">
                <a
                  className={`flex items-center px-3 py-2.5 text-sm font-medium rounded-md ${
                    isActive('/admin/categories')
                      ? 'bg-primary/10 text-primary'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <Tag className="h-5 w-5 mr-2" />
                  Catégories
                </a>
              </Link>

              <div className="pt-4 border-t border-gray-200 mt-4">
                <Link href="/admin/settings">
                  <a
                    className={`flex items-center px-3 py-2.5 text-sm font-medium rounded-md ${
                      isActive('/admin/settings')
                        ? 'bg-primary/10 text-primary'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <Settings className="h-5 w-5 mr-2" />
                    Paramètres
                  </a>
                </Link>

                <Link href="/">
                  <a
                    className={`flex items-center px-3 py-2.5 text-sm font-medium rounded-md ${
                      isActive('/')
                        ? 'bg-primary/10 text-primary'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <Home className="h-5 w-5 mr-2" />
                    Retour au site
                  </a>
                </Link>
              </div>
            </nav>
          </div>
        </aside>

        {/* Main content */}
        <main
          className={`flex-1 overflow-y-auto bg-gray-50 ${
            isSidebarOpen ? 'md:ml-0' : ''
          }`}
        >
          {children}
        </main>
      </div>
    </div>
  );
}