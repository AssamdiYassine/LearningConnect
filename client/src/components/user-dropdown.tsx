import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { User, Settings, LogOut, Trophy } from "lucide-react";
import { Link } from "wouter";

export default function UserDropdown() {
  const { user, logoutMutation } = useAuth();

  if (!user) return null;

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="ml-3 relative">
          <div className="flex items-center">
            <div className="h-8 w-8 rounded-full bg-primary-600 flex items-center justify-center text-white">
              <span className="text-sm font-medium">
                {user.displayName.split(' ').map(n => n[0]).join('')}
              </span>
            </div>
            <span className="ml-2 text-sm font-medium text-gray-700 hidden md:block">{user.displayName}</span>
            <svg className="ml-1 h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>My Account</DropdownMenuLabel>
        <DropdownMenuItem disabled className="opacity-100">
          <div className="flex flex-col">
            <span>{user.displayName}</span>
            <span className="text-xs text-gray-500">{user.email}</span>
            <span className="text-xs text-gray-500 mt-1 capitalize">Role: {user.role}</span>
          </div>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <Link href="/profile">
          <DropdownMenuItem>
            <User className="mr-2 h-4 w-4" />
            <span>Profile</span>
          </DropdownMenuItem>
        </Link>
        <Link href="/achievements">
          <DropdownMenuItem>
            <Trophy className="mr-2 h-4 w-4" />
            <span>Mes accomplissements</span>
          </DropdownMenuItem>
        </Link>
        <Link href="/settings">
          <DropdownMenuItem>
            <Settings className="mr-2 h-4 w-4" />
            <span>Settings</span>
          </DropdownMenuItem>
        </Link>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleLogout} disabled={logoutMutation.isPending}>
          <LogOut className="mr-2 h-4 w-4" />
          <span>{logoutMutation.isPending ? "Déconnexion en cours..." : "Déconnexion"}</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
