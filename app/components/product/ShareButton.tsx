'use client';

import { useState, useRef, useEffect } from 'react';

interface ShareButtonProps {
  productName: string;
  productUrl: string;
  productImage?: string;
  price?: number;
}

export default function ShareButton({
  productName,
  productUrl,
  productImage,
  price,
}: ShareButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const fullUrl = typeof window !== 'undefined' 
    ? new URL(productUrl, window.location.origin).toString()
    : productUrl;

  const shareText = `Check out ${productName}${price ? ` - $${price.toFixed(2)}` : ''} at LEGO Menswear!`;

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen]);

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(fullUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy link:', err);
    }
  };

  const handleShare = async (platform: string) => {
    const encodedText = encodeURIComponent(shareText);
    const encodedUrl = encodeURIComponent(fullUrl);

    let shareUrl = '';

    switch (platform) {
      case 'whatsapp':
        shareUrl = `https://wa.me/?text=${encodedText}%20${encodedUrl}`;
        break;
      case 'facebook':
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`;
        break;
      case 'twitter':
        shareUrl = `https://twitter.com/intent/tweet?text=${encodedText}&url=${encodedUrl}`;
        break;
      case 'telegram':
        shareUrl = `https://t.me/share/url?url=${encodedUrl}&text=${encodedText}`;
        break;
      case 'email':
        shareUrl = `mailto:?subject=${encodeURIComponent(productName)}&body=${encodedText}%20${encodedUrl}`;
        break;
      case 'native':
        // Use Web Share API if available
        if (navigator.share) {
          try {
            await navigator.share({
              title: productName,
              text: shareText,
              url: fullUrl,
            });
            setIsOpen(false);
            return;
          } catch (err) {
            console.log('Share cancelled or failed:', err);
            return;
          }
        }
        break;
    }

    if (shareUrl) {
      window.open(shareUrl, '_blank', 'width=600,height=400');
      setIsOpen(false);
    }
  };

  // Check if Web Share API is available
  const hasNativeShare = typeof navigator !== 'undefined' && !!navigator.share;

  return (
    <div className="relative" ref={menuRef}>
      {/* Share Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-4 py-2 border border-gray-300 hover:border-black transition-colors text-sm font-medium uppercase tracking-wider"
        title="Share this product"
      >
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M7.217 10.907a2.25 2.25 0 100 2.186m0-2.186c.18.324.283.696.283 1.093s-.103.77-.283 1.093m0-2.186l9.566-5.314m0 0a2.25 2.25 0 100-2.186m0 2.186l-9.566 5.314"
          />
        </svg>
        <span className="hidden sm:inline">SHARE</span>
      </button>

      {/* Share Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-2 bg-white border border-gray-300 shadow-lg rounded-sm z-50 min-w-48">
          <div className="p-3 space-y-1">
            {/* Copy Link */}
            <button
              onClick={handleCopyLink}
              className="w-full flex items-center gap-3 px-3 py-2 hover:bg-gray-50 transition-colors text-sm"
            >
              <svg
                className="w-5 h-5 text-gray-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m2.121 2.121a4.5 4.5 0 016.364 6.364l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m2.121-2.121l4.5-4.5a4.5 4.5 0 016.364 0l0 0A4.5 4.5 0 0121 7.5"
                />
              </svg>
              <span>{copied ? 'Copied!' : 'Copy Link'}</span>
            </button>

            <div className="border-t border-gray-200" />

            {/* Social Platforms */}
            <button title='whats App share'
              onClick={() => handleShare('whatsapp')}
              className="w-full flex items-center gap-3 px-3 py-2 hover:bg-gray-50 transition-colors text-sm"
            >
              <svg
                className="w-5 h-5 text-green-600"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.67-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.076 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421-7.403h-.004a9.87 9.87 0 00-9.746 9.798c0 2.734.732 5.41 2.126 7.74L5.412 21l2.166-.696c2.203 1.308 4.738 1.998 7.368 1.998h.006c5.41 0 9.799-4.39 9.799-9.799 0-2.618-.97-5.08-2.739-6.991-1.768-1.911-4.23-2.963-6.8-2.963m11.784 4.852c-.636 1.593-2.316 2.786-4.013 2.786-.574 0-1.122-.107-1.633-.32.574.305 1.203.812 1.516 1.493.449.981.449 2.49.18 3.65-.268 1.16-.981 2.158-1.895 2.766-.914.608-2.068.869-3.197.869-.768 0-1.506-.13-2.197-.374-1.184-.44-2.211-1.272-2.876-2.326-.665-1.054-1.031-2.318-.993-3.583.038-1.265.533-2.477 1.392-3.379.859-.903 2.048-1.48 3.322-1.598 1.274-.118 2.543.174 3.561.818 1.018.644 1.759 1.616 2.084 2.738"
              />
              </svg>
            </button>

            <button
              onClick={() => handleShare('facebook')}
              className="w-full flex items-center gap-3 px-3 py-2 hover:bg-gray-50 transition-colors text-sm"
            >
              <svg
                className="w-5 h-5 text-blue-600"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
              </svg>
              <span>Facebook</span>
            </button>

            <button
              onClick={() => handleShare('twitter')}
              className="w-full flex items-center gap-3 px-3 py-2 hover:bg-gray-50 transition-colors text-sm"
            >
              <svg
                className="w-5 h-5 text-black"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a14.024 14.024 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z" />
              </svg>
              <span>Twitter / X</span>
            </button>

            <button
              onClick={() => handleShare('email')}
              className="w-full flex items-center gap-3 px-3 py-2 hover:bg-gray-50 transition-colors text-sm"
            >
              <svg
                className="w-5 h-5 text-gray-600"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z" />
              </svg>
              <span>Email</span>
            </button>

            <button
              onClick={() => handleShare('telegram')}
              className="w-full flex items-center gap-3 px-3 py-2 hover:bg-gray-50 transition-colors text-sm"
            >
              <svg
                className="w-5 h-5 text-blue-500"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.96 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.485-1.313.474-.431-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.15.321-.464.905-.757 3.686-1.894 6.144-2.853 7.367-3.768 1.053-.652 1.988-.635 2.777-.45.79.147 1.279.547 1.53 1.14l-.04-.122z" />
              </svg>
              <span>Telegram</span>
            </button>

            {hasNativeShare && (
              <>
                <div className="border-t border-gray-200" />
                <button
                  onClick={() => handleShare('native')}
                  className="w-full flex items-center gap-3 px-3 py-2 hover:bg-gray-50 transition-colors text-sm"
                >
                  <svg
                    className="w-5 h-5 text-gray-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <span>More Options</span>
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
