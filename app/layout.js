import { Inter } from 'next/font/google'
import { Providers } from './providers'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'LEGO Streetwear',
  description: 'Authentic streetwear for the bold and daring.',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Providers>
          <Navbar />
          <main className="min-h-screen p-4 max-w-7xl mx-auto">
            {children}
          </main>
          <Footer />
        </Providers>
      </body>
    </html>
  )
}
