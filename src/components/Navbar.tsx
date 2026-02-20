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

export const Navbar = () => {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const location = useLocation(); // လက်ရှိ URL ကို စောင့်ကြည့်ဖို့
  const [searchValue, setSearchValue] = useState("");
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);

  // စာသားကို Clear လုပ်ပြီး All Posts ပြန်ပြမယ့် function
  const handleClearSearch = () => {
    setSearchValue("");
    navigate("/"); // URL ကို reset ချလိုက်တာ
  };

  // Search Logic
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchValue.trim()) {
      navigate(`/?search=${encodeURIComponent(searchValue.trim())}`);
      setIsMobileSearchOpen(false);
    } else {
      handleClearSearch();
    }
  };

  // အရေးကြီးဆုံးအပိုင်း: Input ထဲမှာ စာမရှိတော့ရင် All Posts ပြန်ပြပေးဖို့
  useEffect(() => {
    if (searchValue === "" && location.search.includes("search=")) {
      navigate("/");
    }
  }, [searchValue, location.search, navigate]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/login");
  };

  return (
    <nav className="flex items-center justify-between p-4 border-b bg-white sticky top-0 z-50 h-16 gap-2">
      
      {!isMobileSearchOpen && (
        <div className="flex items-center gap-4 flex-shrink-0">
          <Link to="/" className="text-xl font-black tracking-tighter text-black">
            MY BLOG
          </Link>
        </div>
      )}

      {/* Desktop Search Bar (Clear Button ပါဝင်သည်) */}
      <form onSubmit={handleSearch} className="flex-1 max-w-md relative hidden md:block">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <Input
          placeholder="Search articles..."
          className="pl-10 pr-10 rounded-full bg-gray-50 border-gray-100 focus-visible:ring-1 focus-visible:ring-black h-10"
          value={searchValue}
          onChange={(e) => setSearchValue(e.target.value)}
        />
        {searchValue && (
          <button
            type="button"
            onClick={handleClearSearch}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-black transition-colors"
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
              className="pl-10 pr-10 rounded-full bg-gray-50 border-none h-10 w-full"
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
            />
            {searchValue && (
              <button
                type="button"
                onClick={() => setSearchValue("")}
                className="absolute right-12 top-1/2 -translate-y-1/2 text-gray-400"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
          <Button 
            type="button" 
            variant="ghost" 
            size="icon" 
            className="rounded-full"
            onClick={() => {
              setIsMobileSearchOpen(false);
              handleClearSearch();
            }}
          >
            <X className="w-5 h-5 text-gray-500" />
          </Button>
        </form>
      )}

      <div className="flex items-center gap-2 flex-shrink-0">
        {!isMobileSearchOpen && (
          <Button 
            variant="ghost" 
            size="icon" 
            className="md:hidden rounded-full" 
            onClick={() => setIsMobileSearchOpen(true)}
          >
            <Search className="w-5 h-5" />
          </Button>
        )}

        {user ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-10 w-10 rounded-full p-0 border-2 border-transparent hover:border-gray-100 transition-all">
                <Avatar className="h-full w-full">
                  <AvatarImage src={user?.user_metadata?.avatar_url} />
                  <AvatarFallback className="bg-black text-white text-xs">
                    {user?.email?.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            
            <DropdownMenuContent className="w-64 mt-2 shadow-xl border-gray-100 rounded-2xl" align="end">
              <DropdownMenuLabel className="font-normal p-4">
                <div className="flex flex-col space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="bg-blue-100 text-blue-700 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase">
                      {profile?.role || "Member"}
                    </span>
                  </div>
                  <p className="text-sm font-medium leading-none text-gray-900 truncate">
                    {user?.email}
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              
              <DropdownMenuItem className="py-3 cursor-pointer" onClick={() => navigate("/profile")}>
                <User className="w-4 h-4 mr-3 text-gray-500" /> Profile Settings
              </DropdownMenuItem>

              {profile?.role === "admin" && (
                <DropdownMenuItem className="py-3 cursor-pointer" onClick={() => navigate("/admin")}>
                  <LayoutDashboard className="w-4 h-4 mr-3 text-gray-500" /> Admin Dashboard
                </DropdownMenuItem>
              )}

              <DropdownMenuSeparator />
              <DropdownMenuItem 
                className="py-3 cursor-pointer text-red-600 focus:bg-red-50 focus:text-red-600 font-medium" 
                onClick={handleLogout}
              >
                <LogOut className="w-4 h-4 mr-3" /> Log out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <Link to="/login">
            <Button size="sm" className="rounded-full px-6 bg-black hover:bg-gray-800 transition-colors h-10">
              Login
            </Button>
          </Link>
        )}
      </div>
    </nav>
  );
};