import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-brand-black text-white mt-24">
      <div className="container-page py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div>
            <h3 className="text-xl font-medium mb-4">LEGO MENS WEAR</h3>
            <p className="text-sm text-gray-400">
              Premium menswear for the modern gentleman.
            </p>
          </div>

          {/* Shop */}
          <div>
            <h4 className="micro-label text-gray-400 mb-4">SHOP</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/products" className="hover:text-gray-400 transition-colors">
                  All Products
                </Link>
              </li>
              <li>
                <Link href="/products?category=Men" className="hover:text-gray-400 transition-colors">
                  Men
                </Link>
              </li>
              <li>
                <Link href="/products?category=Shoes" className="hover:text-gray-400 transition-colors">
                  Shoes
                </Link>
              </li>
              <li>
                <Link href="/products?category=Accessories" className="hover:text-gray-400 transition-colors">
                  Accessories
                </Link>
              </li>
            </ul>
          </div>

          {/* Help */}
          <div>
            <h4 className="micro-label text-gray-400 mb-4">HELP</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/cart" className="hover:text-gray-400 transition-colors">
                  Shopping Cart
                </Link>
              </li>
              <li>
                <Link href="/login" className="hover:text-gray-400 transition-colors">
                  Account
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="micro-label text-gray-400 mb-4">CONTACT</h4>
            <p className="text-sm text-gray-400">
              Orders via WhatsApp
            </p>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-gray-800">
          <p className="text-sm text-gray-400 text-center">
            &copy; {new Date().getFullYear()} LEGO Mens Wear. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
