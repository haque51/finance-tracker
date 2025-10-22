We’ll base this on the hybrid direction we discussed:
Minimal + Gradient Accents + Card-Based + Subtle Glassmorphism + Micro-Animations
inspired by Revolut + Stripe + Linear.

🧭 1. Brand Design Philosophy

Keywords:

Clean · Confident · Modern · Trustworthy · Empowering

Our finance tracker’s UI should make the user feel in control — data-rich yet calming.
The design should visually express clarity, trust, and a touch of luxury.

🎨 2. Color System
🎯 Primary Palette
Role	Color	Usage
Primary	#2563EB (Blue 600)	Buttons, highlights, graphs
Secondary	#7C3AED (Violet 600)	Gradient partner, CTAs
Accent Gradient	linear-gradient(135deg, #2563EB, #7C3AED)	Buttons, cards, top bars
Background Light	#F8FAFC	Main background
Background Dark	#0F172A	Dark mode background
Card Surface	rgba(255, 255, 255, 0.7) + blur(16px)	Glassmorphism card base
Success	#10B981	Positive change, growth
Warning	#F59E0B	Alerts, pending actions
Error	#EF4444	Negative transactions
🌗 Color Guidelines

Maintain 90% neutral and 10% accent usage for a clean look.

Use gradient accents only on key actions or hero elements.

Provide both light and dark mode palettes.

🔠 3. Typography
Primary Font

Inter (Google Fonts)

Modern, highly legible, pairs beautifully with minimalist design.

Weights: 400, 500, 600, 700

Use Case	Size	Weight	Example
App Title	28–32px	700	“Finance Tracker”
Section Header	20–24px	600	“Monthly Overview”
Card Label	16–18px	500	“Spending Summary”
Body Text	14–16px	400	“You spent €230 this week.”
Caption	12px	400	“Updated 2 hours ago”

Typography Behavior:

Large, bold balances or totals to create data hierarchy.

Consistent line height: 1.4x.

Use color contrast for readability (WCAG AA minimum).

🧩 4. UI Components
Cards

Rounded corners: 20px

Padding: 20px

Shadow: 0 4px 16px rgba(0,0,0,0.08)

Optional blur for frosted-glass effect: backdrop-filter: blur(16px)

Contain charts, transactions, or summaries.

Buttons
Type	Style	Notes
Primary	Gradient background (#2563EB → #7C3AED), white text	Rounded (12px), subtle hover glow
Secondary	Outline (1.5px solid #CBD5E1)	Neutral, minimal
Icon Buttons	Circular, subtle shadow	Used for quick actions
Inputs

Rounded corners (12px), soft shadow.

Focus state: blue glow (0 0 0 3px rgba(37, 99, 235, 0.3)).

Navigation

Bottom nav for mobile (icons + labels).

Side nav for web dashboard.

Active state = gradient highlight or underline.

Data Visualizations

Use soft gradient fills for area charts.

Bars and lines follow primary color palette.

Animation: smooth ease-in-out (200–300ms).

💎 5. Layout System
Device	Layout	Grid
Mobile	Card-based, vertical scroll	4-column fluid grid
Tablet	Two-column overview	8-column grid
Web	Dashboard style with sidebar	12-column grid

Spacing scale:
4, 8, 12, 16, 24, 32, 48 (use multiples of 4).

✨ 6. Motion & Interaction
Motion Type	Duration	Easing	Example
Hover / Tap	150–200ms	ease-out	Button hover glow
Card Appear	250ms	ease-in	On dashboard load
Chart Animate	400–500ms	cubic-bezier(0.4, 0, 0.2, 1)	Line drawing animation
Screen Transition	300ms	ease-in-out	Slide/opacity blend

Subtle motion = modern + premium feel.

🪞 7. Glassmorphism Settings

Background: rgba(255,255,255,0.7) or rgba(15,23,42,0.4) for dark mode

Border: 1px solid rgba(255,255,255,0.4)

Blur: 16px

Shadow: 0 4px 30px rgba(0, 0, 0, 0.1)

Use only for cards, modals, and nav bars — not full screens.

🌈 8. Iconography

Use Lucide or Phosphor Icons — minimalist, rounded edges.

Line weight: 1.5–2px.

Consistent padding and alignment.

🪄 9. Example Component Styling Summary

Dashboard Card Example:

.card {
  background: rgba(255,255,255,0.7);
  backdrop-filter: blur(16px);
  border-radius: 20px;
  box-shadow: 0 4px 16px rgba(0,0,0,0.08);
  padding: 20px;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}
.card:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 24px rgba(0,0,0,0.12);
}

🔧 10. Design System Summary
Category	Choice
Core Aesthetic	Minimal, gradient accents, subtle glass
Typography	Inter (400–700)
Color Accent	Blue–Violet gradient
Layout	Card-based, airy spacing
Animation	Micro, smooth, responsive
Dark Mode	Glassy dark surfaces, neon gradient accents
