# 🚀 SEO Quick Reference Card

## Verify SEO Implementation (2 minutes)

### Test URLs
```bash
# Check Robots
curl http://localhost:3000/robots.txt

# Check Sitemap
curl http://localhost:3000/sitemap.xml

# Check Home Metadata
# Open DevTools → View Page Source on http://localhost:3000
```

### Visual Checks
```
✅ Home Page: http://localhost:3000
   - Look for <title> tag
   - Look for <meta name="description">
   - Look for og: tags
   - Look for schema scripts

✅ Products: http://localhost:3000/products
   - Custom title
   - Custom description
   - Canonical tag

✅ Product Detail: http://localhost:3000/products/[any-id]
   - Dynamic title
   - Dynamic description
   - Product schema (search page source for "Product")
```

---

## Files at a Glance

| File | Purpose | Impact |
|------|---------|--------|
| `app/robots.ts` | Search engine crawling | HIGH |
| `app/sitemap.ts` | Page discovery | HIGH |
| `app/layout.tsx` | Global SEO | HIGH |
| `app/products/layout.tsx` | Products page SEO | MEDIUM |
| `app/products/[id]/layout.tsx` | Product detail SEO | HIGH |
| `next.config.mjs` | Security & headers | MEDIUM |
| `public/robots.txt` | Fallback crawling | MEDIUM |

---

## Metadata Quick Reference

### Home Page
```
Title: LEGO Menswear - Premium Men's Clothing & Fashion (60 chars)
Desc: Discover premium menswear designed for the modern gentleman...
Schema: Organization + BreadcrumbList
OG Image: og-image.jpg (1200x630)
```

### Products Page
```
Title: All Products - Shop Men's Clothing & Accessories
Desc: Browse our complete collection of premium menswear...
Canonical: https://legomenswear.com/products
OG Image: og-products.jpg (1200x630)
```

### Product Detail (Dynamic)
```
Title: {ProductName} - {Brand} | LEGO Menswear
Desc: Shop {ProductName}... {Category} for men...
Canonical: https://legomenswear.com/products/{id}
OG Image: {ProductImage} (800x1000)
Schema: Product (with price, availability, brand)
```

---

## Environment Variables Needed

Add to `.env.local`:
```env
NEXT_PUBLIC_BASE_URL=https://legomenswear.com
NEXT_PUBLIC_API_URL=https://api.legomenswear.com
```

---

## 10-Step Setup Checklist

1. ✅ SEO implementation complete
2. ⏳ Set up Google Search Console
   - https://search.google.com/search-console
   - Verify domain
   - Submit sitemap
3. ⏳ Set up Google Analytics 4
   - https://analytics.google.com
   - Install tracking tag
4. ⏳ Set up Google Merchant Center (if needed)
5. ⏳ Submit to Google: https://www.google.com/business/
6. ⏳ Test social sharing (Facebook, Twitter, LinkedIn)
7. ⏳ Run Lighthouse audit
8. ⏳ Optimize images
9. ⏳ Create content strategy
10. ⏳ Monitor metrics monthly

---

## Testing Tools

**Bookmark These:**
- Google Rich Results: https://search.google.com/test/rich-results
- PageSpeed Insights: https://pagespeed.web.dev/
- Facebook Debugger: https://developers.facebook.com/tools/debug/
- Twitter Validator: https://cards-dev.twitter.com/validator
- Schema Validator: https://validator.schema.org/

---

## Common Issues & Fixes

| Issue | Cause | Fix |
|-------|-------|-----|
| Pages not ranking | New domain | Be patient (2-3 months) |
| Low CTR | Weak title/desc | Optimize for keywords |
| Crawl errors | Robots.txt | Check disallow rules |
| Mobile issues | Responsive | Test on devices |
| No rich snippets | Missing schema | Validate JSON-LD |

---

## KPIs to Monitor

**Monthly:**
- Organic impressions (+50%+ expected)
- Organic clicks (+50%+ expected)
- Average position (target: top 20)
- CTR (target: 5%+)

**Quarterly:**
- Core Web Vitals scores
- Pages indexed
- Crawl budget
- Backlinks

**Annually:**
- Organic revenue
- ROI from SEO
- Keyword rankings
- Traffic growth

---

## Sharing Features Recap

✅ **ShareButton Component**
- 7+ platforms supported
- Auto-generates share text
- Copy link with feedback
- Mobile-optimized

📍 **Placements:**
- Product detail page (next to Add to Bag)
- Product grid cards (hover reveal)

---

## Next Priority Actions

**Week 1:**
- [ ] Google Search Console setup
- [ ] Monitor first crawls
- [ ] Check indexing status

**Week 2-3:**
- [ ] Google Analytics 4 setup
- [ ] Product description optimization
- [ ] Test all social sharing

**Month 2:**
- [ ] Monitor organic traffic
- [ ] Optimize based on data
- [ ] Create content roadmap

---

## Important URLs

```
# SEO Files
/robots.txt              - Search engine crawling rules
/sitemap.xml             - All pages & products for indexing

# Verification
/                        - Home page with schema
/products                - Product listing page
/products/[id]           - Product detail with price

# Share Testing
https://www.facebook.com/sharer/sharer.php?u=[URL]
https://twitter.com/intent/tweet?url=[URL]
https://wa.me/?text=[MESSAGE]%20[URL]
```

---

## Documentation Files

1. **SEO_COMPLETE_SUMMARY.md** - 👈 START HERE
2. **SEO_IMPLEMENTATION_GUIDE.md** - Detailed implementation
3. **SEO_CHECKLIST.md** - Action items & progress
4. **SEO_VALIDATION_GUIDE.md** - Testing procedures
5. **SEO_ARCHITECTURE.md** - System diagrams
6. **SEO_AUDIT_REPORT.md** - Initial audit findings
7. **SHARING_FEATURE.md** - Share button details

---

## Code Snippets Reference

### Check if Product Schema Loaded
```bash
# In browser console on any product page:
document.querySelectorAll('script[type="application/ld+json"]')
```

### Verify Metadata
```bash
# In browser console:
document.querySelector('meta[name="description"]').content
document.querySelector('meta[property="og:title"]').content
document.querySelector('meta[property="og:image"]').content
```

### Test Sitemap
```bash
# Browser: http://localhost:3000/sitemap.xml
# Or: curl http://localhost:3000/sitemap.xml | head -20
```

---

## Browser Extensions Recommended

- **SEO Analysis** - https://chrome.google.com/webstore/
- **Lighthouse** - Built into Chrome
- **OpenGraph Debugger** - Facebook's tool
- **Schema.org Structured Data** - Validator extension

---

## Success Indicators ✅

**You'll know SEO is working when:**

✅ Search Console shows impressions
✅ Organic traffic appears in Analytics
✅ Products show up in Google Images search
✅ Rich snippets appear in search results
✅ Social shares show rich previews
✅ Site speed improved
✅ Mobile scores increase
✅ Bounce rate decreases

---

## Resources Saved (Already Done ✅)

- Robots.txt configuration
- Sitemap generation
- Metadata templates
- Schema implementations
- Social sharing setup
- Headers & security
- Compiler options

---

## Time to Value Estimates

| Task | Time | Effort | Value |
|------|------|--------|-------|
| GSC Setup | 10 min | ⭐ | ⭐⭐⭐⭐⭐ |
| GA4 Setup | 15 min | ⭐ | ⭐⭐⭐⭐⭐ |
| Optimize Titles | 1 hour | ⭐⭐ | ⭐⭐⭐⭐ |
| Product Descriptions | 2 hours | ⭐⭐ | ⭐⭐⭐⭐ |
| Link Building | Ongoing | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ |

---

## Emergency Contacts/Resources

**If something breaks:**
1. Check Next.js docs: https://nextjs.org/
2. Check error logs in terminal
3. Validate schema: https://validator.schema.org/
4. Test robots.txt: Search Console → Coverage
5. Review git history for changes

---

**SEO Status: ✅ PRODUCTION READY**

Start monitoring! The foundation is solid. 🚀

*Last Updated: February 1, 2026*
