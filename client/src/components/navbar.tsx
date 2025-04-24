import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import UserDropdown from "@/components/user-dropdown";
import { useQuery } from "@tanstack/react-query";
import { Bell } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import NotificationItem from "@/components/notification-item";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";

export default function Navbar() {
  const [location] = useLocation();
  const { user } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Fetch notifications
  const { data: notifications } = useQuery({
    queryKey: ["/api/notifications"],
    enabled: !!user
  });

  const unreadNotifications = notifications?.filter(n => !n.isRead) || [];

  const navLinks = [
    { path: "/", label: "Home", roles: ["student", "trainer", "admin"] },
    { path: "/catalog", label: "Catalog", roles: ["student", "trainer", "admin"] },
    { path: "/schedule", label: "My Schedule", roles: ["student"] },
    { path: "/subscription", label: "Subscription", roles: ["student"] },
    { path: "/trainer", label: "Trainer Dashboard", roles: ["trainer"] },
    { path: "/admin", label: "Admin Dashboard", roles: ["admin"] },
  ];

  // Filter links based on user role
  const filteredLinks = navLinks.filter(link => 
    user && link.roles.includes(user.role)
  );

  return (
    <nav className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <Link href="/">
                <div className="text-primary-600 font-heading font-bold text-xl cursor-pointer">TechFormPro</div>
              </Link>
            </div>
            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
              {filteredLinks.map((link) => (
                <Link key={link.path} href={link.path}>
                  <a className={`${
                    location === link.path
                      ? "border-primary-600 text-gray-900"
                      : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700"
                  } inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium`}>
                    {link.label}
                  </a>
                </Link>
              ))}
            </div>
          </div>
          
          {user && (
            <div className="hidden sm:ml-6 sm:flex sm:items-center">
              <div className="relative">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="relative">
                      <Bell className="h-5 w-5 text-gray-400" />
                      {unreadNotifications.length > 0 && (
                        <Badge className="absolute top-0 right-0 h-2 w-2 p-0 bg-red-500 rounded-full" />
                      )}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-80">
                    <div className="p-2 font-medium">Notifications</div>
                    <div className="max-h-80 overflow-y-auto">
                      {notifications && notifications.length > 0 ? (
                        notifications.slice(0, 5).map((notification) => (
                          <DropdownMenuItem key={notification.id} className="p-0 focus:bg-transparent">
                            <NotificationItem notification={notification} />
                          </DropdownMenuItem>
                        ))
                      ) : (
                        <div className="text-center py-4 text-gray-500">No notifications</div>
                      )}
                    </div>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
              
              <UserDropdown />
            </div>
          )}
          
          <div className="-mr-2 flex items-center sm:hidden">
            <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon">
                  <svg className="h-6 w-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                </Button>
              </SheetTrigger>
              <SheetContent>
                <SheetHeader>
                  <SheetTitle>TechFormPro</SheetTitle>
                  <SheetDescription>Navigation</SheetDescription>
                </SheetHeader>
                <div className="py-4 space-y-4">
                  {filteredLinks.map((link) => (
                    <Link key={link.path} href={link.path}>
                      <a 
                        className={`block px-3 py-2 rounded-md text-base font-medium ${
                          location === link.path 
                            ? "bg-primary-50 text-primary-600" 
                            : "text-gray-700 hover:bg-gray-50"
                        }`}
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        {link.label}
                      </a>
                    </Link>
                  ))}
                  
                  {user && (
                    <div className="border-t border-gray-200 pt-4">
                      <div className="flex items-center px-3">
                        <div className="flex-shrink-0">
                          <div className="h-10 w-10 rounded-full bg-primary-600 flex items-center justify-center text-white">
                            <span className="text-sm font-medium">
                              {user.displayName.split(' ').map(n => n[0]).join('')}
                            </span>
                          </div>
                        </div>
                        <div className="ml-3">
                          <div className="text-base font-medium text-gray-800">{user.displayName}</div>
                          <div className="text-sm font-medium text-gray-500">{user.email}</div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </nav>
  );
}
