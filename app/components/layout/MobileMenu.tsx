'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { canManageProducts } from '@/lib/api/auth';

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function MobileMenu({ isOpen, onClose }: MobileMenuProps) {
  const isAdmin = canManageProducts();

  // Prevent body scroll when menu is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 z-40 md:hidden animate-fade-in"
        onClick={onClose}
      />

      {/* Drawer */}
      <div className="fixed top-0 left-0 bottom-0 w-4/5 max-w-sm bg-white z-50 md:hidden overflow-y-auto">
        <div className="p-6">
          {/* Close Button */}
          <button
            onClick={onClose}
            className="mb-8 p-2 -ml-2"
            aria-label="Close menu"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          {/* Navigation Links */}
          <nav className="space-y-6">
            <div>
              <p className="micro-label mb-3">SHOP</p>
              <div className="space-y-3">
                <Link
                  href="/products"
                  onClick={onClose}
                  className="block text-lg hover:text-brand-gray transition-colors"
                >
                  New In
                </Link>
                <Link
                  href="/products?category=Men"
                  onClick={onClose}
                  className="block text-lg hover:text-brand-gray transition-colors"
                >
                  Men
                </Link>
                <Link
                  href="/products?category=Shoes"
                  onClick={onClose}
                  className="block text-lg hover:text-brand-gray transition-colors"
                >
                  Shoes
                </Link>
                <Link
                  href="/products?category=Accessories"
                  onClick={onClose}
                  className="block text-lg hover:text-brand-gray transition-colors"
                >
                  Accessories
                </Link>
              </div>
            </div>

            {isAdmin && (
              <div>
                <p className="micro-label mb-3">ADMIN</p>
                <div className="space-y-3">
                  <Link
                    href="/admin/add-product"
                    onClick={onClose}
                    className="block text-lg hover:text-brand-gray transition-colors"
                  >
                    Add Product
                  </Link>
                  <Link
                    href="/admin/products"
                    onClick={onClose}
                    className="block text-lg hover:text-brand-gray transition-colors"
                  >
                    Manage Products
                  </Link>
                </div>
              </div>
            )}

            <div className="pt-6 border-t border-brand-lightgray">
              <Link
                href="/cart"
                onClick={onClose}
                className="block text-lg hover:text-brand-gray transition-colors"
              >
                Shopping Cart
              </Link>
            </div>
          </nav>
        </div>
      </div>
    </>
  );
}
