# Component Showcase

## 🧩 All Components Overview

### 1. HeroSection Component

**Location**: `components/HeroSection.vue`

**Purpose**: Main hero/header section of the homepage

**Features**:

- Logo with circular border (number 8)
- Dynamic title "Research Software Ecosystem"
- Tool and collection count display
- Two slots for search and actions
- Gradient background
- Responsive padding and spacing

**Props**:

```typescript
toolCount?: number = 0
collectionCount?: number = 0
```

**Slots**:

```typescript
search; // For SearchBar component
actions; // For ActionButton components
```

**Usage Example**:

```vue
<HeroSection :tool-count="60123" :collection-count="558">
  <template v-slot:search>
    <SearchBar />
  </template>
  <template v-slot:actions>
    <ActionButton label="Browse" description="Tools" to="/tools" />
  </template>
</HeroSection>
```

---

### 2. SearchBar Component

**Location**: `components/SearchBar.vue`

**Purpose**: Search input with advanced search link

**Features**:

- Large search input with icon
- Clear button (X) when text entered
- Enter key support
- Link to advanced search
- Event emission for search queries

**Events**:

```typescript
@search(query: string)  // Emitted when search is triggered
```

**Usage Example**:

```vue
<SearchBar @search="handleSearch" />

<script setup>
const handleSearch = (query: string) => {
  console.log('Searching for:', query);
};
</script>
```

---

### 3. ActionButton Component

**Location**: `components/ActionButton.vue`

**Purpose**: Large clickable action buttons with icons

**Features**:

- Hand-drawn border style (4px)
- Icon support (Lucide icons)
- Hover scale and shadow animation
- NuxtLink routing
- Uppercase label styling

**Props**:

```typescript
label: string         // Main button text
description: string   // Subtitle text
icon?: string        // Lucide icon name
to?: string          // Route to navigate to
color?: string       // Theme color
```

**Usage Example**:

```vue
<ActionButton
  label="Browse"
  description="Tools"
  icon="i-lucide-layers"
  to="/tools"
  color="primary"
/>
```

---

### 4. DomainGrid Component

**Location**: `components/DomainGrid.vue`

**Purpose**: Interactive grid of scientific domains

**Features**:

- 6 main domain categories
- 4 subcategories each
- Color-coded by domain
- Click handlers
- Responsive grid (2-6 columns)
- Hover animations

**Props**:

```typescript
domains?: DomainCategory[]

interface DomainCategory {
  name: string
  color: string
  subcategories: string[]
}
```

**Events**:

```typescript
@category-click(category: string)  // Emitted when any category is clicked
```

**Usage Example**:

```vue
<DomainGrid :domains="domains" @category-click="handleCategoryClick" />

<script setup>
const { domains } = useDomains();

const handleCategoryClick = (category: string) => {
  // Handle category selection
};
</script>
```

---

## 🎨 Domain Color Reference

```
Domain      | Color  | Tailwind Classes
------------|--------|------------------
ASTRO       | Gray   | gray-100, gray-500
GEO         | Blue   | blue-100, blue-500
BIO         | Green  | green-100, green-500
CHEM        | Yellow | yellow-100, yellow-500
MATERIALS   | Purple | purple-100, purple-500
STATISTICS  | Pink   | pink-100, pink-500
```

---

## 🔄 Component Relationships

```
Page: index.vue
│
├─ HeroSection
│  ├─ Slot: search
│  │  └─ SearchBar
│  │     └─ Emits: @search → handleSearchFromHero()
│  │
│  └─ Slot: actions
│     ├─ ActionButton (Browse)
│     ├─ ActionButton (Explore)
│     └─ ActionButton (Register)
│
├─ DomainGrid
│  └─ Emits: @category-click → handleCategoryClick()
│
└─ Featured Tools Section
   ├─ ItemCard (x6)
   └─ ItemCardPlaceHolder (loading)
```

---

## 📐 Layout Specifications

### HeroSection

```
Container: max-w-7xl
Padding: px-4 py-16 sm:px-6 lg:px-8 lg:py-24
Background: gradient from gray-50 to gray-100

Logo: 16x16 (h-16 w-16)
Title: text-4xl sm:text-5xl
Tagline: text-3xl sm:text-4xl (purple)
```

### SearchBar

```
Container: max-w-2xl
Input Size: xl
Icon: i-lucide-search (leading)
Button: xl size, primary color
```

### ActionButton

```
Border: 4px solid
Padding: p-6
Min Height: 160px
Border Radius: rounded-xl
Grid: 1 col mobile, 3 cols desktop
Gap: gap-6
```

### DomainGrid

```
Container: max-w-7xl
Grid: 2 cols mobile → 3 cols tablet → 6 cols desktop
Gap: gap-6
Button Padding: p-4 (main), p-2 (sub)
Border: 2px solid
```

---

## 🎭 State Management

### Component States

**SearchBar**:

```typescript
searchQuery: ref<string>(""); // Current search text
```

**DomainGrid**:

```typescript
domains: DomainCategory[]        // List of domains
```

**index.vue**:

```typescript
tools: ref<Tools>([]); // All tools
loading: ref<boolean>(false); // Loading state
error: ref<string>(""); // Error message
filteredTools: ref<Tools>([]); // Filtered results
searchQuery: ref<string>(""); // Search text
```

---

## 🎨 Styling Patterns

### Hand-Drawn Border Effect

```css
border-4 border-gray-800
dark:border-gray-300
rounded-xl
```

### Hover Animation

```css
transition-all
hover:scale-105
hover:shadow-xl
```

### Color Coding

```css
/* Domain buttons use dynamic classes */
bg-{color}-100 dark:bg-{color}-900/30
border-{color}-500 dark:border-{color}-400
text-{color}-700 dark:text-{color}-300
```

### Gradient Background

```css
bg-gradient-to-br
from-gray-50 to-gray-100
dark:from-gray-900 dark:to-gray-800
```

---

## 🔧 Composables

### useDomains

**Location**: `composables/useDomains.ts`

**Purpose**: Provide domain data

**Returns**:

```typescript
{
  domains: DomainCategory[]
}
```

**Data Structure**:

```typescript
[
  {
    name: "ASTRO",
    color: "gray",
    subcategories: ["Cosmology", "Exoplanets", "Galaxies", "Spectroscopy"],
  },
  // ... 5 more domains
];
```

---

## 📱 Responsive Breakpoints

```
Mobile:    < 640px    (sm)
Tablet:    640-1024px (sm-lg)
Desktop:   > 1024px   (lg+)

Component      | Mobile | Tablet | Desktop
---------------|--------|--------|--------
HeroSection    | 1 col  | 1 col  | 1 col
Action Buttons | 1 col  | 3 cols | 3 cols
DomainGrid     | 2 cols | 3 cols | 6 cols
Featured Tools | 1 col  | 2 cols | 3 cols
```

---

## 🌙 Dark Mode

All components support dark mode via Tailwind's `dark:` prefix:

```vue
<!-- Light mode: bg-white, Dark mode: bg-gray-900 -->
<div class="bg-white dark:bg-gray-900"></div>
```

---

## ♿ Accessibility Features

1. **Semantic HTML**

   - Proper heading hierarchy (h1 → h2 → h3)
   - Button vs link distinction
   - Section landmarks

2. **Keyboard Navigation**

   - All interactive elements focusable
   - Enter key support on SearchBar
   - Tab order follows visual order

3. **Screen Readers**

   - Descriptive alt text
   - ARIA labels where needed
   - Clear button text

4. **Color Contrast**
   - WCAG AA compliant
   - Dark mode high contrast
   - Text readable on all backgrounds

---

## 🚀 Performance Tips

1. **Lazy Loading**: Components auto-import via Nuxt
2. **Debouncing**: Search uses 500ms debounce
3. **Pagination**: Limit displayed items
4. **Computed Properties**: Efficient reactivity
5. **V-if vs V-show**: Use v-if for conditional rendering

---

## 🧪 Testing Examples

### Unit Test (Vitest)

```typescript
import { mount } from "@vue/test-utils";
import ActionButton from "@/components/ActionButton.vue";

describe("ActionButton", () => {
  it("renders label and description", () => {
    const wrapper = mount(ActionButton, {
      props: {
        label: "Test",
        description: "Description",
      },
    });
    expect(wrapper.text()).toContain("Test");
    expect(wrapper.text()).toContain("Description");
  });
});
```

### Component Test

```typescript
it("emits search event", async () => {
  const wrapper = mount(SearchBar);
  await wrapper.find("input").setValue("test query");
  await wrapper.find("button").trigger("click");

  expect(wrapper.emitted("search")).toBeTruthy();
  expect(wrapper.emitted("search")[0]).toEqual(["test query"]);
});
```

---

## 📊 Component Metrics

| Component    | Lines | Props | Events | Slots | Complexity |
| ------------ | ----- | ----- | ------ | ----- | ---------- |
| HeroSection  | 60    | 2     | 0      | 2     | Low        |
| SearchBar    | 50    | 0     | 1      | 0     | Low        |
| ActionButton | 40    | 5     | 0      | 0     | Low        |
| DomainGrid   | 110   | 1     | 1      | 0     | Medium     |

---

## 🎯 Best Practices Applied

1. ✅ Single Responsibility Principle
2. ✅ Prop validation with TypeScript
3. ✅ Event-driven communication
4. ✅ Composable logic separation
5. ✅ Consistent naming conventions
6. ✅ Responsive-first design
7. ✅ Accessibility-first approach
8. ✅ Performance optimization

---

**Need help?** Check IMPLEMENTATION.md for detailed documentation!
