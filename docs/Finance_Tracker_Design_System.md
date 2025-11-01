
# 💰 Finance Tracker App — Design System Specification

## 🧭 1. Brand Design Philosophy

**Keywords:**  
Clean · Confident · Modern · Trustworthy · Empowering

This finance tracker app design emphasizes **clarity, usability, and elegance**. Users should feel calm and in control while viewing financial data.

---

## 🎨 2. Color System

### 🌞 Light Theme
| Role | Color | Usage |
|------|--------|--------|
| Primary | `#2563EB` | Buttons, highlights, graphs |
| Secondary | `#7C3AED` | Gradient partner, CTAs |
| Accent Gradient | `linear-gradient(135deg, #2563EB, #7C3AED)` | Buttons, headers |
| Background Light | `#F8FAFC` | Primary background |
| Card Surface | `rgba(255, 255, 255, 0.7)` + blur(16px) | Glassmorphic cards |
| Background Dark (for contrast) | `#0F172A` | Text or highlights |
| Success | `#10B981` | Positive changes |
| Warning | `#F59E0B` | Warnings or pending actions |
| Error | `#EF4444` | Negative transactions |

### 🌚 Dark Theme
| Role | Color | Usage |
|------|--------|--------|
| Primary | `#3B82F6` | Buttons, links, graphs |
| Secondary | `#8B5CF6` | Gradient partner, CTAs |
| Accent Gradient | `linear-gradient(135deg, #3B82F6, #8B5CF6)` | Buttons, highlights |
| Background Dark | `#0F172A` | App background |
| Card Surface | `rgba(255,255,255,0.08)` + blur(16px) | Glassmorphic cards |
| Text Primary | `#E2E8F0` | High-contrast text |
| Text Secondary | `#94A3B8` | Secondary text |
| Success | `#22C55E` | Positive growth |
| Warning | `#FACC15` | Alerts |
| Error | `#F87171` | Loss or decrease |

---

## 🔠 3. Typography

**Primary Font:** [Inter](https://fonts.google.com/specimen/Inter)  
Weights: 400, 500, 600, 700  

| Use Case | Size | Weight | Example |
|-----------|------|---------|---------|
| App Title | 28–32px | 700 | "Finance Tracker" |
| Section Header | 20–24px | 600 | "Monthly Overview" |
| Card Label | 16–18px | 500 | "Spending Summary" |
| Body Text | 14–16px | 400 | "You spent €230 this week." |
| Caption | 12px | 400 | "Updated 2 hours ago" |

**Guidelines:**
- Use **bold weights** for important data.  
- Maintain a line height of `1.4x`.  
- Ensure contrast ratio meets **WCAG AA** accessibility.

---

## 🧩 4. UI Components

### Cards
- Rounded corners: `20px`
- Padding: `20px`
- Shadow: `0 4px 16px rgba(0,0,0,0.08)` (Light) / `0 4px 16px rgba(0,0,0,0.4)` (Dark)
- Background: Glassmorphic blur (`backdrop-filter: blur(16px)`)

### Buttons
| Type | Style | Notes |
|------|--------|-------|
| Primary | Gradient (Blue → Violet) with white text | Rounded (12px) |
| Secondary | Outline with neutral text | Hover glow |
| Icon Buttons | Circular with soft shadow | Used for quick actions |

### Inputs
- Border-radius: 12px  
- Focus state: glow (`rgba(37,99,235,0.3)`)  
- Background: subtle glass effect or neutral fill

### Navigation
- **Mobile:** bottom nav bar with icons  
- **Web:** sidebar + top bar  
- Active state = gradient underline or highlight

---

## 📊 5. Data Visualizations

- Use soft gradient fills for charts.  
- Animate line and bar graphs smoothly (ease-in-out, 300–400ms).  
- Primary color should adapt based on theme (blue gradients on light/dark backgrounds).

---

## 💎 6. Layout System

| Device | Grid | Layout Type |
|---------|------|-------------|
| Mobile | 4-column | Card-based vertical scroll |
| Tablet | 8-column | Two-column overview |
| Web | 12-column | Dashboard layout with sidebar |

**Spacing Scale:** 4, 8, 12, 16, 24, 32, 48

---

## ✨ 7. Motion & Interaction

| Type | Duration | Easing | Example |
|------|-----------|--------|----------|
| Hover / Tap | 150–200ms | ease-out | Button hover glow |
| Card Load | 250ms | ease-in | Smooth pop-in |
| Chart Animate | 400–500ms | cubic-bezier(0.4,0,0.2,1) | Line drawing effect |
| Screen Transition | 300ms | ease-in-out | Slide or fade |

**Microinteractions:** feedback on taps, smooth state changes, and animated progress indicators.

---

## 🪞 8. Glassmorphism Settings

| Property | Light | Dark |
|-----------|--------|-------|
| Background | `rgba(255,255,255,0.7)` | `rgba(255,255,255,0.08)` |
| Border | `1px solid rgba(255,255,255,0.4)` | `1px solid rgba(255,255,255,0.15)` |
| Blur | `16px` | `20px` |
| Shadow | `0 4px 30px rgba(0,0,0,0.1)` | `0 4px 30px rgba(0,0,0,0.3)` |

---

## 🌈 9. Iconography

- Icon Set: **Lucide** or **Phosphor Icons**  
- Line weight: 1.5–2px  
- Consistent padding and corner rounding  
- Adaptive color (auto white/black depending on theme)

---

## ⚙️ 10. Example Card Styling (CSS Snippet)

```css
.card {
  background: rgba(255, 255, 255, 0.7);
  backdrop-filter: blur(16px);
  border-radius: 20px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
  padding: 20px;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}
.card:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 24px rgba(0, 0, 0, 0.12);
}
.dark .card {
  background: rgba(255, 255, 255, 0.08);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.4);
}
```

---

## 🔧 11. Summary

| Element | Light Theme | Dark Theme |
|----------|--------------|------------|
| Base | Minimal, bright, white space | Glassy, deep, contrast-rich |
| Accent | Blue–Violet gradient | Blue–Purple neon gradient |
| Typography | Black text on light | White text on dark |
| Cards | Frosted glass with light shadow | Dark glass with glow |
| Interactions | Subtle, smooth animations | Fluid, luminous transitions |

---

**Design Direction Summary:**  
> The Finance Tracker app blends **Stripe’s clarity**, **Linear’s polish**, and **Revolut’s emotional appeal**, balancing data precision with visual sophistication — in both light and dark modes.
