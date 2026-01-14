# Quick Start Guide

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ installed
- npm, yarn, or pnpm
- Terminal access

### Installation & Running

```bash
# Navigate to frontend directory
cd /Users/alireza/Documents/GitHub/RSEc/frontend

# Install dependencies (if not already installed)
npm install

# Start development server
npm run dev

# The app will be available at http://localhost:3000
```

## 🎨 What You'll See

### Homepage (/)

1. **Hero Section**

   - Research Software Ecosystem branding
   - Tool/collection counts
   - Search bar
   - Three action buttons

2. **Domain Grid**

   - 6 color-coded scientific domains
   - Interactive subcategories
   - Click to filter tools

3. **Featured Tools**
   - Top 6 tools displayed
   - "View All Tools" button

### Explore Page (/explore)

1. **Research Communities**

   - Bioinformatics, Astronomy, Geosciences, Chemistry
   - Tool counts per community

2. **Featured Collections**
   - Galaxy Workflows, Machine Learning, Data Visualization
   - Coming soon banner

## 🧩 Component Usage Examples

### Using HeroSection

```vue
<HeroSection :tool-count="1234" :collection-count="558">
  <template v-slot:search>
    <SearchBar @search="handleSearch" />
  </template>
  
  <template v-slot:actions>
    <ActionButton label="Browse" description="Tools" to="/tools" />
  </template>
</HeroSection>
```

### Using SearchBar

```vue
<SearchBar @search="handleSearchQuery" />

<script setup>
const handleSearchQuery = (query: string) => {
  console.log('Search query:', query);
  // Navigate or filter
};
</script>
```

### Using ActionButton

```vue
<ActionButton
  label="Explore"
  description="Communities and Collections"
  icon="i-lucide-globe"
  to="/explore"
/>
```

### Using DomainGrid

```vue
<DomainGrid :domains="domains" @category-click="handleCategoryClick" />

<script setup>
import { useDomains } from '@/composables/useDomains';

const { domains } = useDomains();

const handleCategoryClick = (category: string) => {
  console.log('Category clicked:', category);
  // Filter or navigate
};
</script>
```

## 🎯 Testing Checklist

### Visual Testing

- [ ] Hero section displays correctly
- [ ] Search bar is functional
- [ ] Action buttons are clickable
- [ ] Domain grid shows all 6 domains
- [ ] Featured tools load and display
- [ ] Loading placeholders appear during fetch

### Interaction Testing

- [ ] Search input works
- [ ] Enter key triggers search
- [ ] Clear button clears search
- [ ] Domain categories are clickable
- [ ] Action buttons navigate correctly
- [ ] Featured tools cards are clickable

### Responsive Testing

- [ ] Mobile view (< 640px): single column
- [ ] Tablet view (640-1024px): 2-3 columns
- [ ] Desktop view (> 1024px): full grid

### Dark Mode Testing

- [ ] Toggle dark mode
- [ ] All colors adjust properly
- [ ] Text remains readable
- [ ] Borders and backgrounds adapt

## 🐛 Troubleshooting

### Issue: Components not showing

**Solution**: Make sure all dependencies are installed

```bash
npm install
```

### Issue: Icons not displaying

**Solution**: Verify Nuxt UI is configured in nuxt.config.ts

```typescript
export default defineNuxtConfig({
  modules: ["@nuxt/ui"],
});
```

### Issue: Dark mode not working

**Solution**: Nuxt UI handles dark mode automatically. Check if `colorMode` is configured.

### Issue: TypeScript errors

**Solution**: Restart TypeScript server in VS Code

```
Cmd+Shift+P → "TypeScript: Restart TS Server"
```

## 📝 Customization

### Change Domain Colors

Edit `composables/useDomains.ts`:

```typescript
{
  name: "BIO",
  color: "green", // Change to "blue", "red", etc.
  subcategories: [...]
}
```

### Update Tool Count

Modify in `pages/index.vue`:

```vue
<HeroSection :tool-count="tools.length" :collection-count="558" />
```

### Add New Action Button

In `pages/index.vue`:

```vue
<template v-slot:actions>
  <ActionButton
    label="New"
    description="Action"
    icon="i-lucide-star"
    to="/new"
  />
  <!-- existing buttons -->
</template>
```

### Customize Search Placeholder

In `components/SearchBar.vue`:

```vue
<UInput placeholder="Your custom placeholder..." />
```

## 🔗 Navigation Routes

- `/` - Homepage with hero and domains
- `/tools` - Browse all tools (existing page)
- `/explore` - Communities and collections
- `/search` - Advanced search (placeholder link)
- `/tool/[name]` - Individual tool page (existing)

## 📦 Key Dependencies

- **Nuxt 3**: Framework
- **Vue 3**: UI library
- **Nuxt UI**: Component system
- **Tailwind CSS**: Styling
- **TypeScript**: Type safety
- **Lucide Icons**: Icon system

## 🎓 Learning Resources

- [Nuxt 3 Docs](https://nuxt.com)
- [Nuxt UI Docs](https://ui.nuxt.com)
- [Vue 3 Docs](https://vuejs.org)
- [Tailwind CSS](https://tailwindcss.com)
- [Lucide Icons](https://lucide.dev)

## 💬 Support

For issues or questions:

1. Check IMPLEMENTATION.md for detailed docs
2. Review SUMMARY.md for feature overview
3. Inspect component props and types
4. Check browser console for errors

## ✨ Pro Tips

1. **Performance**: Use pagination for large tool lists
2. **SEO**: Add proper meta tags (already included)
3. **Accessibility**: Test with keyboard navigation
4. **Mobile**: Test on real devices, not just browser
5. **Dark Mode**: Design for both modes from the start

---

**Ready to explore!** 🚀

Start the server and visit http://localhost:3000 to see your Research Software Ecosystem in action!
