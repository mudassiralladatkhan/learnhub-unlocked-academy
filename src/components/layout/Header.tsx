
import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { useSession } from '@/contexts/SessionContext';
import { Menu, Book, User, LogOut, Search } from 'lucide-react';
import { SearchBar } from '@/components/header/SearchBar';

export function Header() {
  const { user, signOut, isAdmin } = useSession();
  const location = useLocation();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navigationLinks = [
    { name: 'Home', href: '/' },
    { name: 'Courses', href: '/courses' },
    { name: 'My Learning', href: '/my-learning' },
  ];

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header 
      className={`sticky top-0 w-full z-50 transition-all duration-300 ${
        isScrolled 
          ? 'bg-white/80 backdrop-blur-md shadow-sm dark:bg-brand-900/80' 
          : 'bg-transparent'
      }`}
    >
      <div className="container mx-auto px-4 flex items-center justify-between h-16">
        <Link to="/" className="flex items-center gap-2 text-brand-700 dark:text-brand-300">
          <span className="bg-gradient-to-r from-brand-500 to-brand-700 text-white p-1 rounded">
            <Book size={24} />
          </span>
          <span className="text-xl font-bold">LearnHub</span>
        </Link>
        
        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-6">
          {navigationLinks.map(link => (
            <Link
              key={link.name}
              to={link.href}
              className={`animated-underline font-medium ${
                location.pathname === link.href
                  ? 'text-brand-600 dark:text-brand-300'
                  : 'text-gray-600 hover:text-brand-500 dark:text-gray-300 dark:hover:text-brand-400'
              }`}
            >
              {link.name}
            </Link>
          ))}
          <div className="hidden lg:block w-64">
            <SearchBar />
          </div>
        </nav>
        
        <div className="flex items-center gap-4">
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                  <Avatar className="h-10 w-10 border border-brand-200">
                    <AvatarImage src={user.avatar || undefined} alt={user.name || user.email} />
                    <AvatarFallback className="bg-brand-100 text-brand-700">
                      {user.name ? user.name.charAt(0).toUpperCase() : user.email.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">{user.name || 'User'}</p>
                    <p className="text-xs leading-none text-muted-foreground">{user.email}</p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link to="/dashboard" className="cursor-pointer">Dashboard</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/my-learning" className="cursor-pointer">My Learning</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/profile" className="cursor-pointer">Profile</Link>
                </DropdownMenuItem>
                {isAdmin && (
                  <DropdownMenuItem asChild>
                    <Link to="/admin" className="cursor-pointer">Admin Panel</Link>
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => signOut()} className="cursor-pointer">
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <div className="hidden md:flex items-center gap-4">
              <Button variant="ghost" asChild>
                <Link to="/login">Login</Link>
              </Button>
              <Button asChild>
                <Link to="/register">Sign Up</Link>
              </Button>
            </div>
          )}
          
          {/* Mobile menu */}
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden">
                <Menu />
                <span className="sr-only">Open menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[80%] sm:w-[300px]">
              <div className="flex flex-col gap-6 pt-6">
                <Link to="/" className="flex items-center gap-2 text-brand-700 dark:text-brand-300">
                  <span className="bg-gradient-to-r from-brand-500 to-brand-700 text-white p-1 rounded">
                    <Book size={24} />
                  </span>
                  <span className="text-xl font-bold">LearnHub</span>
                </Link>
                
                <nav className="flex flex-col gap-4">
                  {/* Mobile Search Bar */}
                  <div className="px-2 mb-2">
                    <SearchBar />
                  </div>
                  
                  {navigationLinks.map(link => (
                    <Link
                      key={link.name}
                      to={link.href}
                      className={`px-2 py-1 rounded-md font-medium ${
                        location.pathname === link.href
                          ? 'bg-brand-100 text-brand-600 dark:bg-brand-800 dark:text-brand-300'
                          : 'text-gray-600 hover:text-brand-500 dark:text-gray-300 dark:hover:text-brand-400'
                      }`}
                    >
                      {link.name}
                    </Link>
                  ))}
                </nav>
                
                {!user && (
                  <div className="flex flex-col gap-2 mt-4">
                    <Button variant="outline" asChild className="w-full">
                      <Link to="/login">Login</Link>
                    </Button>
                    <Button asChild className="w-full">
                      <Link to="/register">Sign Up</Link>
                    </Button>
                  </div>
                )}
                
                {user && (
                  <div className="mt-4 flex flex-col gap-2">
                    <div className="flex items-center gap-4 px-2 py-3 rounded-md bg-brand-50 dark:bg-brand-800/40">
                      <Avatar className="h-10 w-10 border border-brand-200">
                        <AvatarImage src={user.avatar || undefined} alt={user.name || user.email} />
                        <AvatarFallback className="bg-brand-100 text-brand-700">
                          {user.name ? user.name.charAt(0).toUpperCase() : user.email.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex flex-col">
                        <span className="text-sm font-medium">{user.name || 'User'}</span>
                        <span className="text-xs text-muted-foreground">{user.email}</span>
                      </div>
                    </div>
                    
                    <div className="flex flex-col gap-1 mt-4">
                      <Link to="/dashboard" className="px-2 py-1 hover:bg-muted rounded-md">
                        Dashboard
                      </Link>
                      <Link to="/my-learning" className="px-2 py-1 hover:bg-muted rounded-md">
                        My Learning
                      </Link>
                      <Link to="/profile" className="px-2 py-1 hover:bg-muted rounded-md">
                        Profile
                      </Link>
                      {isAdmin && (
                        <Link to="/admin" className="px-2 py-1 hover:bg-muted rounded-md">
                          Admin Panel
                        </Link>
                      )}
                    </div>
                    
                    <Button 
                      variant="destructive" 
                      className="mt-4 w-full"
                      onClick={() => signOut()}
                    >
                      <LogOut className="mr-2 h-4 w-4" />
                      Log out
                    </Button>
                  </div>
                )}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
