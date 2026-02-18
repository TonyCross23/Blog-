import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { supabase } from "../lib/supabaseClient";
import { Button } from "./ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";

export const Navbar = () => {
  const { user, profile } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/login");
  };

  return (
    <nav className="flex items-center justify-between p-4 border-b bg-white sticky top-0 z-50">
      <div className="flex items-center gap-8">
        <Link to="/" className="text-xl font-bold tracking-tighter">
          MY BLOG
        </Link>
        <div className="hidden md:flex gap-4">
          <Link to="/" className="text-sm font-medium hover:text-blue-600 transition-colors">
            Home
          </Link>
        </div>
      </div>

      <div className="flex gap-4 items-center">
        {user ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-9 w-9 rounded-full">
                <Avatar className="h-9 w-9 border">
                  <AvatarImage src={user?.user_metadata?.avatar_url} alt="profile" />
                  <AvatarFallback className="bg-blue-100 text-blue-600">
                    {user?.email?.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            
            <DropdownMenuContent className="w-56" align="end" forceMount>
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-bold leading-none capitalize">
                    {profile?.role || "User"}
                  </p>
                  <p className="text-xs leading-none text-muted-foreground">
                    {user?.email}
                  </p>
                </div>
              </DropdownMenuLabel>
              
              <DropdownMenuSeparator />
              
              <DropdownMenuItem onClick={() => navigate("/profile")}>
                Settings
              </DropdownMenuItem>
              
              {profile?.role === "admin" && (
                <DropdownMenuItem onClick={() => navigate("/admin")}>
                  Admin Dashboard
                </DropdownMenuItem>
              )}
              
              <DropdownMenuSeparator />
              
              <DropdownMenuItem className="text-red-600 focus:bg-red-50 focus:text-red-600" onClick={handleLogout}>
                Log out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <Link to="/login">
            <Button size="sm">Login</Button>
          </Link>
        )}
      </div>
    </nav>
  );
};