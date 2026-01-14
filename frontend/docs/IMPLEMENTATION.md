# Research Software Ecosystem - Frontend Implementation

## Overview

This implementation brings the Research Software Ecosystem design to life with a modern, responsive, and accessible interface built with Nuxt 3, Vue 3, and Nuxt UI.

## Features Implemented

### 1. Hero Section (`HeroSection.vue`)

- **Logo and Branding**: Circular logo with ecosystem branding
- **Dynamic Stats**: Shows tool count and collection count
- **Search Integration**: Prominent search bar with advanced search link
- **Call-to-Action Buttons**: Three main action buttons (Browse, Explore, Register)
- **Responsive Design**: Adapts beautifully to all screen sizes
- **Dark Mode Support**: Full dark mode compatibility

### 2. Search Bar Component (`SearchBar.vue`)

- **Real-time Search**: Search input with icon and clear button
- **Keyboard Support**: Enter key triggers search
- **Advanced Search Link**: Direct link to advanced search functionality
- **Event Emission**: Emits search events to parent components

### 3. Action Buttons (`ActionButton.vue`)

- **Flexible Design**: Hand-drawn style borders matching the original design
- **Icon Support**: Customizable icons using Lucide icons
- **Hover Effects**: Scale and shadow animations on hover
- **Routing**: Built-in NuxtLink navigation
- **Accessibility**: Proper semantic HTML and ARIA support

### 4. Domain Grid (`DomainGrid.vue`)

- **Six Domain Categories**:
  - ASTRO (Astronomy - Gray)
  - GEO (Geosciences - Blue)
  - BIO (Biology - Green)
  - CHEM (Chemistry - Yellow)
  - MATERIALS (Purple)
  - STATISTICS (Pink)
- **Subcategories**: Each domain has 4 subcategories
- **Interactive**: Clicking categories triggers search/filter
- **Color-Coded**: Each domain has its own color scheme
- **Responsive Grid**: Adapts from 2 to 6 columns based on screen size

### 5. Home Page (`pages/index.vue`)

- **Complete Integration**: All components working together
- **Featured Tools**: Shows top 6 tools on homepage
- **Loading States**: Placeholder cards during data fetch
- **Error Handling**: Graceful error display with retry option
- **URL State Management**: Search and filter state in URL parameters

### 6. Explore Page (`pages/explore/index.vue`)

- **Communities**: Display research communities by domain
- **Collections**: Featured tool collections
- **Coming Soon Banner**: Indicates future features
- **Icon Integration**: Custom icons for each community/collection

## Technical Implementation

### Component Architecture

```
components/
├── HeroSection.vue       # Main hero/header section
├── SearchBar.vue         # Search input component
├── ActionButton.vue      # Action button component
├── DomainGrid.vue        # Domain categories grid
└── [existing components] # ItemCard, InfoCard, etc.

pages/
├── index.vue            # Home page
├── tools.vue            # Tools listing (existing)
└── explore/
    └── index.vue        # Explore communities page

composables/
└── useDomains.ts        # Domain data management
```

### Key Technologies

- **Nuxt 3**: Vue.js framework with SSR support
- **Nuxt UI**: Component library based on Tailwind CSS
- **TypeScript**: Type-safe development
- **Vue 3 Composition API**: Modern reactive components
- **Tailwind CSS**: Utility-first styling
- **Lucide Icons**: Icon system

### Performance Optimizations

1. **Debounced Search**: 500ms debounce on search input
2. **Lazy Loading**: Components loaded on demand
3. **Pagination**: Limited items per page
4. **Computed Properties**: Efficient reactive calculations
5. **URL State**: Maintains state without re-fetching

### Responsive Breakpoints

- **Mobile**: 1 column (< 640px)
- **Tablet**: 2-3 columns (640px - 1024px)
- **Desktop**: 3-6 columns (> 1024px)

## Component Props & Events

### HeroSection

```typescript
Props:
  - toolCount: number (default: 0)
  - collectionCount: number (default: 0)

Slots:
  - search: Search bar content
  - actions: Action buttons
```

### SearchBar

```typescript
Events:
  - @search: Emitted when search is triggered
    Payload: string (search query)
```

### ActionButton

```typescript
Props:
  - label: string (required)
  - description: string (required)
  - icon: string (optional, default: 'i-lucide-box')
  - to: string (optional, default: '#')
  - color: string (optional, default: 'primary')
```

### DomainGrid

```typescript
Props:
  - domains: DomainCategory[] (optional)

Events:
  - @category-click: Emitted when category is clicked
    Payload: string (category name)

Interface DomainCategory:
  - name: string
  - color: string
  - subcategories: string[]
```

## Styling Guidelines

### Color Scheme

- **Primary**: Blue tones for main actions
- **Purple**: Accent color for taglines
- **Domain Colors**:
  - Gray (ASTRO)
  - Blue (GEO)
  - Green (BIO)
  - Yellow (CHEM)
  - Purple (MATERIALS)
  - Pink (STATISTICS)

### Border Styles

- **Heavy Borders**: 4px borders on main elements
- **Round Corners**: Consistent border-radius
- **Hand-drawn Feel**: Thick borders matching the design

### Typography

- **Headers**: Bold, large text (3xl-5xl)
- **Uppercase**: Used for emphasis (labels, domain names)
- **Tracking**: Wide letter spacing on uppercase text

## Data Flow

1. **Initial Load**:

   - Fetch all tools metadata
   - Extract licenses and topics
   - Display featured tools

2. **Search**:

   - User types in SearchBar
   - Debounced query update
   - Filter tools
   - Update URL parameters

3. **Category Click**:
   - Emit category name
   - Update search query
   - Navigate to tools page
   - Apply filter

## Future Enhancements

### Planned Features

- [ ] User authentication
- [ ] Tool registration form
- [ ] Advanced search filters
- [ ] Community pages
- [ ] Collection management
- [ ] Tool comparison
- [ ] User favorites
- [ ] Analytics dashboard

### Performance Improvements

- [ ] Virtual scrolling for large lists
- [ ] Image optimization
- [ ] Service worker for offline support
- [ ] CDN integration
- [ ] Caching strategies

## Development

### Prerequisites

```bash
Node.js >= 18
npm or yarn or pnpm
```

### Installation

```bash
cd frontend
npm install
```

### Development Server

```bash
npm run dev
```

### Build

```bash
npm run build
npm run preview
```

### Linting

```bash
npm run lint
npm run lint:fix
```

## Testing

### Component Testing

Components are built to be testable with:

- Clear prop interfaces
- Event emission
- Composable logic separation

### Accessibility Testing

- Semantic HTML
- ARIA labels where needed
- Keyboard navigation
- Screen reader support

## Browser Support

- Chrome/Edge (latest 2 versions)
- Firefox (latest 2 versions)
- Safari (latest 2 versions)
- Mobile browsers (iOS Safari, Chrome Mobile)

## Contributing

When adding new features:

1. Follow the component structure
2. Use TypeScript for type safety
3. Add proper documentation
4. Test on multiple screen sizes
5. Ensure dark mode compatibility
6. Add loading and error states

## License

[Your License Here]

---

**Version**: 1.0.0  
**Last Updated**: November 2025  
**Maintainer**: Research Software Ecosystem Team
