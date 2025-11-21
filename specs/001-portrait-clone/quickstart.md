# Quickstart Guide: Portrait.so Clone Page

**Date**: 2025-01-27  
**Feature**: Portrait.so Clone Page  
**Purpose**: Get the Portrait clone page up and running quickly

## Prerequisites

- Node.js 18+ installed
- pnpm package manager
- Existing Next.js application running
- All dependencies from `package.json` installed

## Installation Steps

### 1. Verify Dependencies

All required dependencies are already installed:
- ✅ Framer Motion 12.23.24
- ✅ GSAP 3.13.0
- ✅ next-themes 0.2.1
- ✅ Tailwind CSS 4
- ✅ shadcn/ui components

No additional npm install required.

### 2. Create Page Route

Create the page file:
```bash
mkdir -p app/portrait
touch app/portrait/page.tsx
```

### 3. Integrate Magic UI Components

Magic UI components are available via MCP. Use the MCP tools to fetch components as needed:
- `mcp_magicuidesignmcp_getComponents` - Get component implementations
- `mcp_magicuidesignmcp_getTextAnimations` - Get text animation components
- `mcp_magicuidesignmcp_getButtons` - Get button components
- `mcp_magicuidesignmcp_getBackgrounds` - Get background pattern components

### 4. Create Component Structure

```
app/portrait/
├── page.tsx                 # Main page component
└── components/
    ├── portrait-header.tsx  # Page-specific navigation
    ├── portrait-hero.tsx    # Hero section
    ├── portrait-features.tsx # Features section
    ├── portrait-faq.tsx     # FAQ accordion
    └── portrait-footer.tsx  # Footer section
```

### 5. Add Navigation Link

Update `app/layout.tsx` to add `/portrait` link to main navigation:

```typescript
<Link href="/portrait">Portrait</Link>
```

## Development Workflow

### 1. Start Development Server

```bash
pnpm dev
```

### 2. Navigate to Page

Open browser to: `http://localhost:3000/portrait`

### 3. Component Development Order

1. **Hero Section** (`portrait-hero.tsx`)
   - Large headline with adapted text
   - Subheadline
   - CTA buttons (visual placeholders)

2. **Navigation Header** (`portrait-header.tsx`)
   - Page-specific header matching portrait.so design
   - Smooth scroll links to sections

3. **Features Section** (`portrait-features.tsx`)
   - Feature cards with icons/images
   - Scroll-triggered animations

4. **FAQ Section** (`portrait-faq.tsx`)
   - Accordion component (shadcn/ui)
   - One-at-a-time expansion

5. **Footer** (`portrait-footer.tsx`)
   - Links, social media, legal pages

### 4. Add Animations

1. **Scroll Animations**: Add Framer Motion `whileInView` props to sections
2. **Hover Effects**: Add Tailwind hover utilities and Framer Motion `whileHover`
3. **Text Animations**: Integrate Magic UI text animation components
4. **Button Effects**: Use Magic UI button components for CTAs

### 5. Style with Tailwind

Use Tailwind utility classes for all styling:
- Typography: `text-4xl`, `font-bold`, etc.
- Spacing: `py-16`, `px-4`, `gap-8`, etc.
- Colors: Use theme colors or custom palette
- Responsive: `md:`, `lg:`, `xl:` breakpoints

## Key Implementation Patterns

### Scroll-triggered Animation

```typescript
import { motion } from 'framer-motion';

<motion.section
  initial={{ opacity: 0, y: 20 }}
  whileInView={{ opacity: 1, y: 0 }}
  viewport={{ once: true }}
  transition={{ duration: 0.6 }}
>
  {/* Content */}
</motion.section>
```

### Accordion FAQ

```typescript
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

<Accordion type="single" collapsible>
  <AccordionItem value="item-1">
    <AccordionTrigger>Question?</AccordionTrigger>
    <AccordionContent>Answer.</AccordionContent>
  </AccordionItem>
</Accordion>
```

### Smooth Scrolling

Add to `app/globals.css` or page component:
```css
html {
  scroll-behavior: smooth;
}
```

Or use Tailwind utility:
```typescript
<html className="scroll-smooth">
```

## Content Adaptation

Adapt portrait.so content to match image hub/search theme:

**Original**: "Your forever space for everything you are"  
**Adapted**: "Your forever space for all your visual creations"

**Original**: "More than a link—a decentralized canvas"  
**Adapted**: "More than a gallery—a visual canvas for your work"

## Testing Checklist

- [ ] Page loads at `/portrait` route
- [ ] Navigation header displays correctly
- [ ] Hero section renders with adapted content
- [ ] Smooth scrolling works for anchor links
- [ ] FAQ accordion expands/collapses (one at a time)
- [ ] Scroll animations trigger on scroll
- [ ] Hover effects work on interactive elements
- [ ] Responsive design works (mobile/tablet/desktop)
- [ ] CTA buttons show "Coming soon" on click
- [ ] Accessibility: keyboard navigation works
- [ ] Accessibility: screen reader compatible

## Performance Optimization

1. **Lazy Load Images**: Use Next.js `Image` component
2. **Code Split Animations**: Load GSAP dynamically if needed
3. **Optimize Animations**: Use `will-change` CSS property sparingly
4. **Reduce Motion**: Respect `prefers-reduced-motion`

## Troubleshooting

### Animations Not Working
- Check Framer Motion is imported correctly
- Verify `viewport` props are set
- Check browser console for errors

### Smooth Scroll Not Working
- Verify `scroll-smooth` class is applied
- Check for conflicting CSS
- Test in different browsers

### Magic UI Components Not Rendering
- Verify component code is copied correctly
- Check dependencies are installed
- Review component props and usage

## Next Steps

After quickstart:
1. Fine-tune animations and timings
2. Optimize images and assets
3. Add more Magic UI effects
4. Polish responsive design
5. Accessibility audit
6. Performance testing

## Resources

- [Framer Motion Docs](https://motion.dev/docs)
- [GSAP Docs](https://greensock.com/docs)
- [Tailwind CSS Docs](https://tailwindcss.com/docs)
- [shadcn/ui Docs](https://ui.shadcn.com)
- Magic UI Components (via MCP)

