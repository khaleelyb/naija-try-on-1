import { Link, useLocation } from 'react-router-dom';
import { Shirt, Image as ImageIcon, Wallet, User, Menu, X } from 'lucide-react';
import { useState } from 'react';
import { cn } from '../lib/utils';
import { supabase } from '../lib/supabase';

export default function Navbar({ session }: { session: any }) {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

  const navItems = [
    { name: 'Wardrobe', href: '/wardrobe', icon: Shirt },
    { name: 'Gallery', href: '/gallery', icon: ImageIcon },
    { name: 'Wallet', href: '/wallet', icon: Wallet },
  ];

  const handleSignOut = async () => {
    await supabase.auth.signOut();
  };

  return (
    <nav className="bg-white border-b border-stone-200 sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex justify-between h-16 items-center">
          <Link to="/" className="flex items-center space-x-2">
            <span className="text-2xl font-bold text-nigeria-green font-display">Naija TryOn</span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center space-x-8">
            {navItems.map((item) => (
              <Link
                key={item.href}
                to={item.href}
                className={cn(
                  "flex items-center space-x-1 text-sm font-medium transition-colors hover:text-nigeria-green",
                  location.pathname === item.href ? "text-nigeria-green" : "text-stone-600"
                )}
              >
                <item.icon className="w-4 h-4" />
                <span>{item.name}</span>
              </Link>
            ))}

            {session ? (
              <div className="flex items-center space-x-4 ml-4 pl-4 border-l border-stone-200">
                <button
                  onClick={handleSignOut}
                  className="text-sm font-medium text-stone-600 hover:text-nigeria-green"
                >
                  Sign Out
                </button>
                <div className="w-8 h-8 rounded-full bg-terracotta flex items-center justify-center text-white font-bold">
                  {session.user.email?.[0].toUpperCase()}
                </div>
              </div>
            ) : (
              <Link
                to="/auth"
                className="bg-nigeria-green text-white px-4 py-2 rounded-full text-sm font-medium hover:bg-emerald-800 transition-colors"
              >
                Sign In
              </Link>
            )}
          </div>

          {/* Mobile Menu Toggle */}
          <button className="md:hidden" onClick={() => setIsOpen(!isOpen)}>
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Nav */}
      {isOpen && (
        <div className="md:hidden bg-white border-t border-stone-200 px-4 py-4 space-y-4 shadow-lg">
          {navItems.map((item) => (
            <Link
              key={item.href}
              to={item.href}
              className={cn(
                "flex items-center space-x-2 text-base font-medium py-2",
                location.pathname === item.href ? "text-nigeria-green" : "text-stone-600"
              )}
              onClick={() => setIsOpen(false)}
            >
              <item.icon className="w-5 h-5" />
              <span>{item.name}</span>
            </Link>
          ))}
          {session ? (
            <button
              onClick={() => {
                handleSignOut();
                setIsOpen(false);
              }}
              className="flex items-center space-x-2 text-base font-medium py-2 text-stone-600"
            >
              <User className="w-5 h-5" />
              <span>Sign Out</span>
            </button>
          ) : (
            <Link
              to="/auth"
              className="block w-full bg-nigeria-green text-white text-center py-3 rounded-xl font-medium"
              onClick={() => setIsOpen(false)}
            >
              Sign In
            </Link>
          )}
        </div>
      )}
    </nav>
  );
}
