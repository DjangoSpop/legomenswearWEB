# LEGO Menswear - SEO Architecture Diagram

## 🏗️ SEO Infrastructure Overview

```
┌─────────────────────────────────────────────────────────────┐
│                    SEARCH ENGINES                           │
│           (Google, Bing, Yahoo, etc.)                       │
└─────────────────┬───────────────────────────────────────────┘
                  │
                  │ Crawls & Indexes
                  │
┌─────────────────▼───────────────────────────────────────────┐
│           LEGO MENSWEAR WEBSITE                             │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌────────────────────────────────────────────────────────┐ │
│  │ 📄 ROOT LAYOUT (app/layout.tsx)                        │ │
│  │ ├─ Global Metadata                                     │ │
│  │ ├─ Organization Schema (JSON-LD)                       │ │
│  │ ├─ OpenGraph Tags                                      │ │
│  │ ├─ Twitter Card Tags                                   │ │
│  │ └─ Security & Performance Headers                      │ │
│  └────────────────────────────────────────────────────────┘ │
│                          │                                   │
│         ┌────────────────┼────────────────┐                 │
│         │                │                │                 │
│  ┌──────▼──────┐  ┌──────▼──────┐  ┌────▼────────┐         │
│  │ 🏠 HOME     │  │ 📦 PRODUCTS │  │ 🛍️ PRODUCT  │         │
│  │ /            │  │ /products    │  │ /products/  │         │
│  │              │  │              │  │ [id]        │         │
│  │ ✅ Title     │  │ ✅ Title     │  │ ✅ Dynamic  │         │
│  │ ✅ Desc      │  │ ✅ Desc      │  │ ✅ Title    │         │
│  │ ✅ OG Tags   │  │ ✅ OG Tags   │  │ ✅ Desc     │         │
│  │ ✅ Schema    │  │ ✅ Canonical │  │ ✅ OG Tags  │         │
│  │ ✅ Twitter   │  │ ✅ Twitter   │  │ ✅ Schema   │         │
│  │ ✅ Breadcrumb│  │              │  │ ✅ Canonical│         │
│  └──────────────┘  └──────────────┘  └────────────┘         │
│                                                             │
│  ┌────────────────────────────────────────────────────────┐ │
│  │ 🤖 ROBOTS CONTROL                                      │ │
│  │ ├─ /robots.txt (Dynamic & Static)                      │ │
│  │ ├─ app/robots.ts                                       │ │
│  │ └─ Disallow: /admin, /api, /auth                       │ │
│  └────────────────────────────────────────────────────────┘ │
│                                                             │
│  ┌────────────────────────────────────────────────────────┐ │
│  │ 🗺️  SITEMAP                                             │ │
│  │ ├─ /sitemap.xml (Dynamic)                              │ │
│  │ ├─ app/sitemap.ts                                      │ │
│  │ ├─ Static pages (home, products, categories)           │ │
│  │ └─ Dynamic product pages from API                      │ │
│  └────────────────────────────────────────────────────────┘ │
│                                                             │
│  ┌────────────────────────────────────────────────────────┐ │
│  │ 📊 STRUCTURED DATA                                     │ │
│  │ ├─ Organization (JSON-LD)                              │ │
│  │ ├─ Product (JSON-LD) - Per product                     │ │
│  │ ├─ BreadcrumbList (JSON-LD)                            │ │
│  │ └─ Validated by schema.org                             │ │
│  └────────────────────────────────────────────────────────┘ │
│                                                             │
│  ┌────────────────────────────────────────────────────────┐ │
│  │ 🔐 SECURITY & PERFORMANCE                              │ │
│  │ ├─ X-Frame-Options                                     │ │
│  │ ├─ X-Content-Type-Options                              │ │
│  │ ├─ Referrer-Policy                                     │ │
│  │ ├─ Cache-Control headers                               │ │
│  │ └─ DNS Prefetch directives                             │ │
│  └────────────────────────────────────────────────────────┘ │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## 🔄 Data Flow: From API to Search Engines

```
┌──────────────┐
│ Next.js API  │ (Backend: Heroku)
│  /products/  │
└──────┬───────┘
       │
       │ Fetches on build/request
       │
┌──────▼───────────────┐
│ generateMetadata()   │ (app/products/[id]/layout.tsx)
│                      │
│ - Fetch product     │
│ - Extract: name     │
│ - Extract: price    │
│ - Extract: image    │
│ - Extract: description
└──────┬───────────────┘
       │
       │ Generates
       │
┌──────▼──────────────────────┐
│ Dynamic Metadata            │
│                             │
│ title: Product Name         │
│ description: Product Desc   │
│ og:image: Product Image     │
│ og:url: Product URL         │
│ canonical: Product URL      │
│ schema: Product JSON-LD     │
└──────┬──────────────────────┘
       │
       │ Sends to browser
       │
┌──────▼──────────────────────┐
│ HTML Response               │
│ (with all metadata)         │
│ Shared on Social Media      │
└──────┬──────────────────────┘
       │
       │ Rendered in
       │
┌──────▼──────────────────────┐
│ User Browser                │
│ ├─ Rich Preview             │
│ ├─ Proper Metadata          │
│ └─ Structured Data          │
└──────────────────────────────┘
```

---

## 📱 Social Sharing Flow

```
User clicks SHARE
      │
      ▼
┌──────────────────────────┐
│ ShareButton Component    │
│ (app/components/product/)│
└────────────┬─────────────┘
             │
    ┌────────┼────────┬──────────┬────────┬───────┐
    │        │        │          │        │       │
    ▼        ▼        ▼          ▼        ▼       ▼
  Copy    WhatsApp  Facebook  Twitter  Email  Telegram
  Link      Share     Share     Share   Link    Share
    │        │        │          │        │       │
    ▼        ▼        ▼          ▼        ▼       ▼
  Platform-Specific Share Dialogs
    │
    ▼
┌──────────────────────────┐
│ Product Metadata Sent    │
│ (from ShareButton props) │
│                          │
│ - Product Name           │
│ - Product URL            │
│ - Product Image          │
│ - Product Price          │
│ - Custom Message         │
└──────────────────────────┘
    │
    ▼
┌──────────────────────────┐
│ Rich Preview on Platform │
│ (OpenGraph metadata      │
│  is fetched)             │
└──────────────────────────┘
```

---

## 🗂️ File Structure

```
lego-app/
├── 📄 next.config.mjs          (Enhanced with SEO headers)
├── 📄 tsconfig.json            (Fixed compiler options)
│
├── app/
│   ├── 📄 layout.tsx           (✅ Root SEO metadata)
│   ├── 📄 page.tsx             (✅ Home page + schema)
│   ├── 📄 robots.ts            (✅ Dynamic robots.txt)
│   ├── 📄 sitemap.ts           (✅ Dynamic XML sitemap)
│   │
│   ├── products/
│   │   ├── 📄 layout.tsx       (✅ Products page metadata)
│   │   ├── 📄 page.tsx
│   │   │
│   │   └── [id]/
│   │       ├── 📄 layout.tsx   (✅ Dynamic product metadata)
│   │       └── 📄 page.tsx     (✅ Product schema + share)
│   │
│   └── components/
│       └── product/
│           └── 📄 ShareButton.tsx (✅ Sharing feature)
│
├── public/
│   └── 📄 robots.txt           (✅ Fallback static)
│
├── 📄 SEO_AUDIT_REPORT.md
├── 📄 SEO_IMPLEMENTATION_GUIDE.md
├── 📄 SEO_CHECKLIST.md
├── 📄 SEO_VALIDATION_GUIDE.md
├── 📄 SEO_COMPLETE_SUMMARY.md
├── 📄 SHARING_FEATURE.md
└── 📄 SHARING_BUTTON_PLACEMENT.md
```

---

## 🎯 Request Flow: Home Page

```
User visits: https://legomenswear.com/

                      ▼
         ┌────────────────────────┐
         │ Browser sends request  │
         └────────────┬───────────┘
                      │
                      ▼
         ┌────────────────────────┐
         │ Next.js renders        │
         │ app/page.tsx           │
         └────────────┬───────────┘
                      │
        ┌─────────────┼─────────────┐
        │             │             │
        ▼             ▼             ▼
    Fetch      Load default   Load scripts
    featured   from root      for analytics
    products   layout.tsx
        │             │             │
        └─────────────┼─────────────┘
                      │
                      ▼
        ┌────────────────────────────────────┐
        │ HTML Response with:                │
        │ - Root metadata                    │
        │ - Page-specific metadata          │
        │ - OpenGraph tags                  │
        │ - Twitter Card tags               │
        │ - Schema.org JSON-LD              │
        │ - Product content                 │
        └────────────┬───────────────────────┘
                     │
                     ▼
        ┌────────────────────────────────────┐
        │ Browser renders page               │
        │ Shows hero, products, categories  │
        └────────────┬───────────────────────┘
                     │
        ┌────────────┴────────────┐
        │                         │
        ▼                         ▼
   User sees               User sees correct
   optimized               metadata on social
   content                 sharing
```

---

## 📊 Metadata Hierarchy

```
┌─────────────────────────────────────────────┐
│         METADATA INHERITANCE                │
├─────────────────────────────────────────────┤
│                                             │
│  Root Level (app/layout.tsx)               │
│  ├─ Default title template                │
│  ├─ Default description                   │
│  ├─ OpenGraph (default image)             │
│  ├─ Twitter Card (default)                │
│  └─ Organization Schema                   │
│       │                                    │
│       ├─ OVERRIDDEN BY                     │
│       │                                    │
│  Products Page (app/products/layout.tsx)  │
│  ├─ Custom title                          │
│  ├─ Custom description                    │
│  ├─ Products page OG image                │
│  └─ Canonical: /products                  │
│       │                                    │
│       ├─ OVERRIDDEN BY                     │
│       │                                    │
│  Product Detail (app/products/[id]/layout.tsx)
│  ├─ Dynamic title (product name)          │
│  ├─ Dynamic description                   │
│  ├─ Dynamic OG image (product image)      │
│  ├─ Canonical: /products/[id]             │
│  └─ Product JSON-LD Schema                │
│                                             │
└─────────────────────────────────────────────┘
```

---

## 🔍 Schema.org Structure

```
Organization (Global)
├─ name: "LEGO Menswear"
├─ url: "https://legomenswear.com"
├─ logo: "https://legomenswear.com/logo.png"
├─ description: "Premium menswear store"
├─ contactPoint: { type: "Customer Support" }
└─ sameAs: [Facebook, Twitter, Instagram URLs]

BreadcrumbList (Home Page)
├─ ListItem 1: Home
│  └─ position: 1

Product (Product Pages)
├─ name: "Product Name"
├─ description: "Product description"
├─ image: ["image1.jpg", "image2.jpg", ...]
├─ brand: { name: "Brand Name" }
├─ offers: {
│  ├─ price: "99.99"
│  ├─ priceCurrency: "USD"
│  ├─ availability: "InStock"
│  └─ url: "https://legomenswear.com/products/[id]"
├─ sku: "BARCODE123"
└─ category: "Men"
```

---

## 📈 Traffic Impact Visualization

```
Organic Traffic Growth Expected

      │
      │                      ╱╱
      │               ╱╱╱╱╱╱
      │          ╱╱╱╱╱
      │     ╱╱╱╱╱
      │ ╱╱╱╱╱
      │╱
      └─────────────────────────────────────► Time
      Week 1  Week 2  Week 3  Month 2  Month 3+

      SEO  Product  Full    Rankings Better
      Live Schema  Index   Building  Results
```

---

## ✅ SEO Optimization Checklist Status

```
Technical SEO           ✅ COMPLETE
├─ Robots.txt          ✅
├─ Sitemap             ✅
├─ Security Headers    ✅
└─ Performance Headers ✅

On-Page SEO            ✅ COMPLETE
├─ Meta Titles         ✅
├─ Meta Descriptions   ✅
├─ H1 Headings         ✅
└─ Semantic HTML       ✅

Structured Data        ✅ COMPLETE
├─ Organization Schema ✅
├─ Product Schema      ✅
├─ Breadcrumb Schema   ✅
└─ JSON-LD Format      ✅

Social Optimization    ✅ COMPLETE
├─ OpenGraph Tags      ✅
├─ Twitter Card Tags   ✅
├─ Share Buttons       ✅
└─ Rich Previews       ✅

Mobile & Performance   ✅ READY
├─ Responsive Design   ✅
├─ Mobile Headers      ✅
├─ Font Optimization   ✅
└─ Image Patterns      ✅
```

---

## 🎯 Next Steps Workflow

```
SEO Implementation Complete
            │
            ▼
    Set Up Monitoring
    (GSC, GA4, Lighthouse)
            │
            ▼
    Track Key Metrics
    (Impressions, CTR, Rankings)
            │
            ▼
    Optimize Based on Data
    (Top keywords, Low CTR)
            │
            ▼
    Content & Link Building
    (Better descriptions, backlinks)
            │
            ▼
    Scale & Iterate
    (Continuous improvement)
```

---

This architecture ensures maximum visibility across search engines and social platforms! 🚀
