import { useState, useEffect } from 'react';
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
  Home,
  BarChart2,
  DollarSign,
  CreditCard,
  FolderTree, 
  Search,
  ChevronRight,
  Sun
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
  DropdownMenuSeparator
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';

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

  const [currentDateTime, setCurrentDateTime] = useState(new Date());
  const [searchQuery, setSearchQuery] = useState('');
  
  // Update current date and time every minute
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentDateTime(new Date());
    }, 60000);
    
    return () => clearInterval(timer);
  }, []);

  // Format current date in French format
  const formatDate = () => {
    const options: Intl.DateTimeFormatOptions = { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric'
    };
    return currentDateTime.toLocaleDateString('fr-FR', options);
  };

  return (
    <div className="min-h-screen bg-[#f7f9fc] flex flex-col">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-30">
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
                <div className="text-2xl font-bold bg-gradient-to-r from-[#1D2B6C] to-[#5F8BFF] bg-clip-text text-transparent">Necform</div>
                <div className="ml-2 text-lg font-medium text-[#7A6CFF]">| Admin</div>
              </a>
            </Link>
          </div>
          
          {/* Search bar - visible on medium screens and up */}
          <div className="hidden md:flex items-center relative max-w-md w-full mx-4">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              type="search"
              placeholder="Rechercher..."
              className="pl-10 pr-4 py-2 w-full rounded-full border-gray-200 focus:border-primary"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {/* Right side - User menu, notifications, etc. */}
          <div className="flex items-center space-x-4">
            {/* Current date/time */}
            <div className="hidden lg:block text-right">
              <div className="text-sm font-medium text-gray-700">{formatDate()}</div>
            </div>
            
            <NotificationBell />
            
            <div className="h-6 w-px bg-gray-200 mx-2"></div>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                  <Avatar>
                    <AvatarImage src="" />
                    <AvatarFallback className="bg-gradient-to-br from-[#5F8BFF] to-[#7A6CFF] text-white">
                      {user ? getInitials(user.displayName || user.username) : 'AD'}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <div className="flex items-center justify-start gap-2 p-2">
                  <Avatar className="h-9 w-9">
                    <AvatarFallback className="bg-gradient-to-br from-[#5F8BFF] to-[#7A6CFF] text-white">
                      {user ? getInitials(user.displayName || user.username) : 'AD'}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col space-y-0.5 leading-none">
                    <p className="font-medium text-sm">{user?.displayName || user?.username}</p>
                    <p className="truncate text-xs text-muted-foreground">{user?.email}</p>
                    <Badge className="mt-1 w-max" variant="outline">{user?.role || 'Administrateur'}</Badge>
                  </div>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/profile">
                    <a className="cursor-pointer w-full flex items-center">
                      <Users className="mr-2 h-4 w-4" />
                      <span>Mon profil</span>
                    </a>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/settings">
                    <a className="cursor-pointer w-full flex items-center">
                      <Settings className="mr-2 h-4 w-4" />
                      <span>Paramètres</span>
                    </a>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} className="text-red-600 cursor-pointer flex items-center">
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Se déconnecter</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <aside
          className={`bg-white shadow-md w-72 flex-shrink-0 fixed md:sticky top-16 h-[calc(100vh-4rem)] z-20 transition-transform duration-200 ease-in-out ${
            isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
          } md:translate-x-0`}
        >
          <div className="flex flex-col h-full overflow-y-auto">
            {/* User quick info */}
            <div className="p-4 border-b border-gray-100">
              <div className="flex items-center space-x-3">
                <Avatar className="h-10 w-10">
                  <AvatarFallback className="bg-gradient-to-br from-[#5F8BFF] to-[#7A6CFF] text-white">
                    {user ? getInitials(user.displayName || user.username) : 'AD'}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-medium text-sm text-gray-900">{user?.displayName || user?.username}</h3>
                  <p className="text-xs text-gray-500">Administrateur</p>
                </div>
              </div>
            </div>
            
            <nav className="p-4 space-y-1">
              <div className="mb-2 px-2 text-xs font-semibold uppercase text-gray-400 tracking-wider">
                Principal
              </div>
              
              <Link href="/admin-dashboard-new">
                <a
                  className={`flex items-center px-3 py-2.5 text-sm font-medium rounded-xl ${
                    isActive('/admin-dashboard-new')
                      ? 'bg-gradient-to-r from-[#5F8BFF]/10 to-[#7A6CFF]/10 text-[#1D2B6C] font-medium shadow-sm'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <BarChart2 className="h-5 w-5 mr-3" />
                  <span>Tableau de bord</span>
                  {isActive('/admin-dashboard-new') && (
                    <ChevronRight className="h-4 w-4 ml-auto" />
                  )}
                </a>
              </Link>

              <Link href="/admin/analytics">
                <a
                  className={`flex items-center px-3 py-2.5 text-sm font-medium rounded-xl ${
                    isActive('/admin/analytics')
                      ? 'bg-gradient-to-r from-[#5F8BFF]/10 to-[#7A6CFF]/10 text-[#1D2B6C] font-medium shadow-sm'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <BarChart className="h-5 w-5 mr-3" />
                  <span>Analytiques</span>
                  {isActive('/admin/analytics') && (
                    <ChevronRight className="h-4 w-4 ml-auto" />
                  )}
                </a>
              </Link>
              
              <div className="mt-6 mb-2 px-2 text-xs font-semibold uppercase text-gray-400 tracking-wider">
                Gestion
              </div>

              <Link href="/admin/users">
                <a
                  className={`flex items-center px-3 py-2.5 text-sm font-medium rounded-xl ${
                    isActive('/admin/users')
                      ? 'bg-gradient-to-r from-[#5F8BFF]/10 to-[#7A6CFF]/10 text-[#1D2B6C] font-medium shadow-sm'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <Users className="h-5 w-5 mr-3" />
                  <span>Utilisateurs</span>
                  {isActive('/admin/users') && (
                    <ChevronRight className="h-4 w-4 ml-auto" />
                  )}
                </a>
              </Link>

              <Link href="/admin/courses">
                <a
                  className={`flex items-center px-3 py-2.5 text-sm font-medium rounded-xl ${
                    isActive('/admin/courses')
                      ? 'bg-gradient-to-r from-[#5F8BFF]/10 to-[#7A6CFF]/10 text-[#1D2B6C] font-medium shadow-sm'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <BookOpen className="h-5 w-5 mr-3" />
                  <span>Formations</span>
                  {isActive('/admin/courses') && (
                    <ChevronRight className="h-4 w-4 ml-auto" />
                  )}
                </a>
              </Link>

              <Link href="/admin/approvals">
                <a
                  className={`flex items-center px-3 py-2.5 text-sm font-medium rounded-xl ${
                    isActive('/admin/approvals')
                      ? 'bg-gradient-to-r from-[#5F8BFF]/10 to-[#7A6CFF]/10 text-[#1D2B6C] font-medium shadow-sm'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <CheckSquare className="h-5 w-5 mr-3" />
                  <span>Approbations</span>
                  <Badge variant="outline" className="ml-auto bg-amber-50 text-amber-700 border-amber-200">3</Badge>
                </a>
              </Link>
              
              <Link href="/admin/revenue">
                <a
                  className={`flex items-center px-3 py-2.5 text-sm font-medium rounded-xl ${
                    isActive('/admin/revenue')
                      ? 'bg-gradient-to-r from-[#5F8BFF]/10 to-[#7A6CFF]/10 text-[#1D2B6C] font-medium shadow-sm'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <DollarSign className="h-5 w-5 mr-3" />
                  <span>Revenus</span>
                  {isActive('/admin/revenue') && (
                    <ChevronRight className="h-4 w-4 ml-auto" />
                  )}
                </a>
              </Link>
              
              <Link href="/admin/subscriptions">
                <a
                  className={`flex items-center px-3 py-2.5 text-sm font-medium rounded-xl ${
                    isActive('/admin/subscriptions')
                      ? 'bg-gradient-to-r from-[#5F8BFF]/10 to-[#7A6CFF]/10 text-[#1D2B6C] font-medium shadow-sm'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <CreditCard className="h-5 w-5 mr-3" />
                  <span>Abonnements</span>
                  {isActive('/admin/subscriptions') && (
                    <ChevronRight className="h-4 w-4 ml-auto" />
                  )}
                </a>
              </Link>
              
              <div className="mt-6 mb-2 px-2 text-xs font-semibold uppercase text-gray-400 tracking-wider">
                Contenu
              </div>

              <Link href="/admin/blog">
                <a
                  className={`flex items-center px-3 py-2.5 text-sm font-medium rounded-xl ${
                    isActive('/admin/blog')
                      ? 'bg-gradient-to-r from-[#5F8BFF]/10 to-[#7A6CFF]/10 text-[#1D2B6C] font-medium shadow-sm'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <FileText className="h-5 w-5 mr-3" />
                  <span>Articles</span>
                  {isActive('/admin/blog') && (
                    <ChevronRight className="h-4 w-4 ml-auto" />
                  )}
                </a>
              </Link>

              <Link href="/admin/categories">
                <a
                  className={`flex items-center px-3 py-2.5 text-sm font-medium rounded-xl ${
                    isActive('/admin/categories')
                      ? 'bg-gradient-to-r from-[#5F8BFF]/10 to-[#7A6CFF]/10 text-[#1D2B6C] font-medium shadow-sm'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <FolderTree className="h-5 w-5 mr-3" />
                  <span>Catégories</span>
                  {isActive('/admin/categories') && (
                    <ChevronRight className="h-4 w-4 ml-auto" />
                  )}
                </a>
              </Link>

              <div className="pt-4 border-t border-gray-100 mt-6">
                <Link href="/admin/settings">
                  <a
                    className={`flex items-center px-3 py-2.5 text-sm font-medium rounded-xl ${
                      isActive('/admin/settings')
                        ? 'bg-gradient-to-r from-[#5F8BFF]/10 to-[#7A6CFF]/10 text-[#1D2B6C] font-medium shadow-sm'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <Settings className="h-5 w-5 mr-3" />
                    <span>Paramètres</span>
                    {isActive('/admin/settings') && (
                      <ChevronRight className="h-4 w-4 ml-auto" />
                    )}
                  </a>
                </Link>

                <Link href="/">
                  <a
                    className={`flex items-center px-3 py-2.5 text-sm font-medium rounded-xl mt-2 ${
                      isActive('/')
                        ? 'bg-gradient-to-r from-[#5F8BFF]/10 to-[#7A6CFF]/10 text-[#1D2B6C] font-medium shadow-sm'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <Home className="h-5 w-5 mr-3" />
                    <span>Retour au site</span>
                    {isActive('/') && (
                      <ChevronRight className="h-4 w-4 ml-auto" />
                    )}
                  </a>
                </Link>
              </div>
            </nav>
          </div>
        </aside>

        {/* Main content */}
        <main
          className={`flex-1 overflow-y-auto bg-[#f7f9fc] p-4 md:p-6 ${
            isSidebarOpen ? 'md:ml-0' : ''
          }`}
        >
          {children}
        </main>
      </div>
    </div>
  );
}