'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useCartStore } from '@/lib/store/cart';
import { useAuth } from '@/app/context/AuthContext';
import MobileMenu from './MobileMenu';

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  
  const itemCount = useCartStore((state) => state.getItemCount());
  const { user, isAuthenticated, canAccessAdmin, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
    setShowUserMenu(false);
  };

  return (
    <>
      <header className="sticky top-0 z-50 bg-white border-b border-brand-lightgray">
        <div className="container-page">
          <div className="flex items-center justify-between h-16 md:h-20">
            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="md:hidden p-2 -ml-2"
              aria-label="Open menu"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>

            {/* Logo */}
            <Link href="/" aria-label="LEGO MENSWEAR Homepage">
              <div className="flex flex-col items-center">
                <span className="text-2xl md:text-3xl font-bold tracking-tight leading-none">
                  LEGO
                </span>
                <span className="text-[10px] md:text-xs uppercase font-medium tracking-[0.2em] -mt-1">
                  MENSWEAR
                </span>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-8 absolute left-1/2 -translate-x-1/2">
              <Link href="/products?category=Men" className="text-body hover:text-brand-gray transition-colors">
                Men
              </Link>
              <Link href="/products?category=Shoes" className="text-body hover:text-brand-gray transition-colors">
                Shoes
              </Link>
              <Link href="/products?category=Accessories" className="text-body hover:text-brand-gray transition-colors">
                Accessories
              </Link>
              <Link href="/products" className="text-body hover:text-brand-gray transition-colors">
                All Products
              </Link>
            </nav>

            {/* Right Icons */}
            <div className="flex items-center gap-4">
              {/* Search Icon */}
              <button
                onClick={() => setSearchOpen(!searchOpen)}
                className="p-2"
                aria-label="Search"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </button>

              {/* Admin Link (if seller/admin) */}
              {canAccessAdmin() && (
                <Link href="/admin/products" className="hidden md:block p-2" aria-label="Admin Dashboard" title="Admin Dashboard">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </Link>
              )}

              {/* Cart Icon */}
              <Link href="/cart" className="p-2 relative group" aria-label="Shopping Cart">
                <svg className="w-6 h-6 transition-transform group-hover:scale-110" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
                {itemCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-brand-black text-white text-xs font-medium min-w-[20px] h-5 px-1 rounded-full flex items-center justify-center animate-pulse">
                    {itemCount}
                  </span>
                )}
              </Link>

              {/* User Menu */}
              {isAuthenticated ? (
                <div className="relative">
                  <button
                    onClick={() => setShowUserMenu(!showUserMenu)}
                    className="p-2"
                    aria-label="User menu"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </button>

                  {/* Dropdown Menu */}
                  {showUserMenu && (
                    <div className="absolute right-0 mt-2 w-56 bg-white border border-brand-gray/20 rounded shadow-lg py-2 z-50">
                      <div className="px-4 py-2 border-b border-brand-gray/20">
                        <p className="text-sm font-medium text-brand-black">{user?.username}</p>
                        <p className="text-xs text-brand-gray capitalize">{user?.role}</p>
                      </div>
                      
                      {canAccessAdmin() && (
                        <Link
                          href="/admin/products"
                          className="block px-4 py-2 text-sm hover:bg-brand-lightgray transition-colors"
                          onClick={() => setShowUserMenu(false)}
                        >
                          Admin Dashboard
                        </Link>
                      )}
                      
                      <button
                        onClick={handleLogout}
                        className="w-full text-left px-4 py-2 text-sm text-accent-red hover:bg-brand-lightgray transition-colors"
                      >
                        Sign Out
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <Link href="/login" className="hidden md:block p-2" aria-label="Login">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                  </svg>
                </Link>
              )}
            </div>
          </div>

          {/* Search Bar */}
          {searchOpen && (
            <div className="pb-4 animate-slide-up">
              <input
                type="search"
                placeholder="Search products..."
                className="input"
                autoFocus
              />
            </div>
          )}
        </div>
      </header>

      {/* Mobile Menu Drawer */}
      <MobileMenu isOpen={mobileMenuOpen} onClose={() => setMobileMenuOpen(false)} />
    </>
  );
}
