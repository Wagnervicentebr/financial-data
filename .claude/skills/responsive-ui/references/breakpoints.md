# Tailwind Breakpoints

Default Tailwind CSS breakpoints used in this project:

| Prefix | Min width | Typical use |
| ------ | --------- | ----------- |
| `sm:` | 640px | Large phones, small tablets |
| `md:` | 768px | Tablets |
| `lg:` | 1024px | Small desktops, laptops |
| `xl:` | 1280px | Desktops |
| `2xl:` | 1536px | Large desktops |

## Common patterns

```tsx
// Mobile-first: base styles apply to mobile, override at breakpoints
<div className="flex flex-col gap-2 md:flex-row md:gap-4 lg:gap-6">

// Hide on mobile, show on desktop
<span className="hidden lg:inline">Full label</span>
<span className="lg:hidden">Short</span>

// Responsive padding
<main className="p-4 md:p-6 lg:p-8">

// Responsive modal width
<SheetContent className="w-full sm:max-w-md lg:max-w-lg">
```

## Sheet vs Drawer vs Dialog

| Viewport | Filter/form overlay | Confirmation |
| -------- | ------------------- | ------------ |
| Mobile (`< md`) | `Drawer` (full width) | `AlertDialog` |
| Tablet (`md`–`lg`) | `Sheet` (side panel, ~50%) | `Dialog` |
| Desktop (`≥ lg`) | `Sheet` (side panel, ~30–40%) | `Dialog` |

Adjust `SheetContent` width with Tailwind: `sm:max-w-sm md:max-w-md lg:max-w-lg`.
