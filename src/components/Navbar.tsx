import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { supabase } from "../lib/supabaseClient";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Search, X, LogOut, User, LayoutDashboard } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { useState, useEffect } from "react";
import { ModeToggle } from "./ModeToggle";

export const Navbar = () => {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchValue, setSearchValue] = useState("");
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    setSearchValue(params.get("search") || "");
  }, [location.search]);

  const handleClearSearch = () => {
    setSearchValue("");
    navigate("/", { replace: true });
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchValue.trim()) {
      navigate(`/?search=${encodeURIComponent(searchValue.trim())}`);
      setIsMobileSearchOpen(false);
    } else {
      handleClearSearch();
    }
  };

  useEffect(() => {
    if (searchValue === "" && location.search.includes("search=")) {
      const delayDebounce = setTimeout(() => {
        navigate("/", { replace: true });
      }, 300);
      return () => clearTimeout(delayDebounce);
    }
  }, [searchValue, location.search, navigate]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/login");
  };

  return (
    <nav className="flex items-center justify-between p-4 border-b sticky top-0 z-50 h-16 gap-2 transition-all duration-300 
      bg-white/70 backdrop-blur-md border-gray-200 
      dark:bg-slate-950/60 dark:backdrop-blur-lg dark:border-slate-800">
      
      {!isMobileSearchOpen && (
        <div className="flex items-center gap-4 flex-shrink-0">
          <Link to="/" className="text-xl font-black tracking-tighter text-black dark:text-white">
            MY BLOG
          </Link>
        </div>
      )}

      {/* Desktop Search Bar */}
      <form onSubmit={handleSearch} className="flex-1 max-w-md relative hidden md:block">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <Input
          placeholder="Search articles..."
          className="pl-10 pr-10 rounded-full bg-gray-100/50 border-gray-100 dark:bg-slate-900/50 dark:border-slate-800 dark:text-white focus-visible:ring-1 focus-visible:ring-black h-10"
          value={searchValue}
          onChange={(e) => setSearchValue(e.target.value)}
        />
        {searchValue && (
          <button
            type="button"
            onClick={handleClearSearch}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-black dark:hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </form>

      {/* Mobile Search Input */}
      {isMobileSearchOpen && (
        <form onSubmit={handleSearch} className="flex-1 flex items-center gap-2 animate-in slide-in-from-right-2 duration-200 md:hidden">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              autoFocus
              placeholder="Search..."
              className="pl-10 pr-10 rounded-full bg-gray-100/50 border-none h-10 w-full dark:bg-slate-900/50 dark:text-white"
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
            />
          </div>
          <Button 
            type="button" 
            variant="ghost" 
            size="icon" 
            className="rounded-full dark:text-gray-400"
            onClick={() => {
              setIsMobileSearchOpen(false);
              handleClearSearch();
            }}
          >
            <X className="w-5 h-5" />
          </Button>
        </form>
      )}

      <div className="flex items-center gap-2 flex-shrink-0">
        {!isMobileSearchOpen && (
          <Button 
            variant="ghost" 
            size="icon" 
            className="md:hidden rounded-full dark:text-gray-400" 
            onClick={() => setIsMobileSearchOpen(true)}
          >
            <Search className="w-5 h-5" />
          </Button>
        )}

        <ModeToggle />

        {user ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-10 w-10 rounded-full p-0 border-2 border-transparent hover:border-gray-100 dark:hover:border-slate-800 transition-all">
                <Avatar className="h-full w-full">
                  <AvatarImage src={user?.user_metadata?.avatar_url} />
                  <AvatarFallback className="bg-black text-white text-xs dark:bg-white dark:text-black font-bold">
                    {user?.email?.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            
            <DropdownMenuContent className="w-64 mt-2 shadow-xl border-gray-100 dark:bg-slate-950/90 dark:border-slate-800 backdrop-blur-xl rounded-2xl" align="end">
              <DropdownMenuLabel className="font-normal p-4">
                <div className="flex flex-col space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-100 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase">
                      {profile?.role || "Member"}
                    </span>
                  </div>
                  <p className="text-sm font-medium leading-none text-gray-900 dark:text-white truncate">
                    {user?.email}
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator className="dark:bg-slate-800" />
              
              <DropdownMenuItem className="py-3 cursor-pointer dark:text-gray-300 dark:focus:bg-slate-900" onClick={() => navigate("/profile")}>
                <User className="w-4 h-4 mr-3 text-gray-500" /> Profile Settings
              </DropdownMenuItem>

              {profile?.role === "admin" && (
                <DropdownMenuItem className="py-3 cursor-pointer dark:text-gray-300 dark:focus:bg-slate-900" onClick={() => navigate("/admin")}>
                  <LayoutDashboard className="w-4 h-4 mr-3 text-gray-500" /> Admin Dashboard
                </DropdownMenuItem>
              )}

              <DropdownMenuSeparator className="dark:bg-slate-800" />
              <DropdownMenuItem 
                className="py-3 cursor-pointer text-red-600 focus:bg-red-50 dark:focus:bg-red-900/30 font-medium" 
                onClick={handleLogout}
              >
                <LogOut className="w-4 h-4 mr-3" /> Log out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <Link to="/login">
            <Button size="sm" className="rounded-full px-6 bg-black text-white hover:bg-gray-800 dark:bg-white dark:text-black dark:hover:bg-gray-200 transition-colors h-10">
              Login
            </Button>
          </Link>
        )}
      </div>
    </nav>
  );
};