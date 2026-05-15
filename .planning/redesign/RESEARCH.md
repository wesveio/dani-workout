# Redesign Research: Minimal Athletic Dark Mode

Direction: Dark-only PWA, "Minimal Athletic" (Strava/Whoop/Oura energy), lime `#a3e635` accent, mobile-only, data-dense with equal surface area for all features (no single hero).

Below: 13 references, each with what to steal, URL, and fit score (1-10). Top-5 curation with grouped "steals" at the bottom.

---

## 1. WHOOP

**What it is:** Recovery/strain/sleep wearable app. The reference for data-dense dark UI.

**Steal:**
- **Almost-black background** to let colored data pop. Recovery score is the entire experience — a single 0-100 number front-and-center.
- **Three-layer information architecture:** glance score (big number) → trend chart (week) → deep readout (full graph). Apply to our session view: big "today" number → weekly view → exercise history detail.
- **Narrow 3-color semantic system** (green=ready, yellow=mid, red=strain). For our app: lime=PR/done, neutral gray=normal, amber=warning (missed weeks). Don't add more colors.
- **Morning ritual via daily score.** Open app → one number to act on. Our equivalent: today's planned session OR last session delta.
- **Card stacking** — every metric is its own tappable card; no hero, all equal weight.

**URL:** https://www.925studios.co/blog/whoop-design-breakdown, https://www.whoop.com/us/en/thelocker/the-all-new-whoop-home-screen/, https://uiuxshowcase.com/industrial-design/whoop/

**Fit:** 10/10. This is the closest spiritual match to the direction.

---

## 2. Strava (mobile, dark mode)

**What it is:** Activity tracking. Dark mode shipped after years of holdout; the Progress Summary Chart on mobile is the gold standard for weekly bar chart UX.

**Steal:**
- **Weekly bar chart with tap-to-drill:** tap a bar → list of that week's activities → tap any → activity detail. Direct map for our Week view → Session view.
- **Toggle Y-axis variable** (time / distance / elevation). Our equivalent: toggle between volume (kg·reps), set count, or sessions.
- **Training Log** — calendar grid of weeks with activity dots/bars sized by intensity. Great pattern for our long-term history view.
- Dark theme uses dark gray (#121212-ish) rather than pure black; warm white text.

**URL:** https://support.strava.com/hc/en-us/articles/28437860016141-Progress-Summary-Chart, https://mobbin.com/explore/screens/852f7ee0-07a6-45cf-8111-ccad12d6e7fc (Strava Android Fitness Progress), https://press.strava.com/articles/available-today-strava-releases-dark-mode

**Fit:** 9/10. Direct steal for Week + Progress screens.

---

## 3. Oura Ring

**What it is:** Sleep/readiness ring tracker. Recently fully redesigned to "connect daily tracking with long-term health."

**Steal:**
- **Score-as-headline:** Readiness/Sleep/Activity each presented as a single large number with a ring or arc.
- **Color luminance variation, not gray scale, for hierarchy** — primary metric uses full saturation; secondary uses dim/desaturated version of same hue. Keeps the palette unified.
- **Increased letter-spacing on display sizes** for big numbers (premium feel).
- **Card-per-metric home** — each health domain (sleep, activity, readiness) is a horizontal card with sparkline. No hero, all equal.

**URL:** https://ouraring.com/blog/new-oura-app-experience/, https://dribbble.com/shots/26970862-Oura-Mobile-App-Smart-Ring-Health-Tracking-UI, https://www.behance.net/gallery/243126265/Oura-Health-App-SaaS-UX-UI-Dashboard-Design

**Fit:** 9/10. Pattern reference for Dashboard with equal-weight feature cards.

---

## 4. Hevy

**What it is:** #1 workout logger. Direct competitor; the canonical set-logging UX.

**Steal:**
- **Set row pattern:** `[set#] [prev: weight×reps]  [weight input]  [reps input]  [✓]`. Single-tap checkbox marks set complete, auto-starts rest timer.
- **Tap set type to switch** (Warm Up / Normal / Failure / Drop / Superset). Tiny pill replacing the set number.
- **Swipe left to delete** a set; `+ Add Set` button at row bottom.
- **Rest timer = persistent overlay** with ±15s buttons and skip. Plus iOS Live Activity surfacing it on lock screen — for PWA we mimic with a sticky bottom bar.
- **Previous performance ghosted in-row** — last session's weight/reps shown dimmed as the placeholder. This is the killer feature.

**URL:** https://apps.apple.com/us/app/hevy-workout-tracker-gym-log/id1458862350, https://screensdesign.com/showcase/hevy-workout-tracker-gym-log, https://www.hevyapp.com/features/workout-rest-timer/

**Fit:** 10/10. Steal the set logging row wholesale.

---

## 5. Linear

**What it is:** Project management tool. Not fitness — but the reference for "minimal dark UI with one accent."

**Steal:**
- **Inter Variable typography** with tight letter-spacing (`-0.22px` display, `-0.11px` body) — the "precise feel" we want for big numbers.
- **Single accent color** (their purple, our lime) used sparingly on interactive states and the one number that matters.
- **LCH-based theme generation** — derive all UI grays from one base + accent + contrast. Three variables, not 98. Worth adopting for our token system.
- **Mono font for data** (numbers, technical details). Pair Inter for UI, JetBrains Mono / IBM Plex Mono for weight×reps so columns align.
- **Calm, almost-no-shadow surfaces** — borders and contrast do the layering work, not elevation.

**URL:** https://linear.app/now/how-we-redesigned-the-linear-ui, https://linear.app/brand, https://linear.app/now/behind-the-latest-design-refresh

**Fit:** 9/10. Typography + token system reference, not visual.

---

## 6. Apple Fitness (rings + summary)

**What it is:** Apple's built-in fitness app.

**Steal:**
- **SF Pro Rounded for big numbers** — proportional widths feel harmonious. We can pair with Inter for UI + Inter for numbers (Inter has a tabular figures variant).
- **Rings as primary metric viz** — three concentric arcs for three goals. For us: weekly target rings (sessions / volume / streak) on Dashboard.
- **Summary screen:** activity ring + workouts list + trends, stacked. Each row is tappable, no nesting deeper than 2 levels.
- **Grey "ghost" numbers** showing previous high or target alongside current value.

**URL:** https://developer.apple.com/design/human-interface-guidelines/activity-rings, https://mobbin.com/explore/screens/f8ca0d70-c83d-41de-94d0-2c45cd3c266d (Apple Fitness Summary)

**Fit:** 8/10. Rings + ghost-number pattern.

---

## 7. Athlytic

**What it is:** AI fitness coach over Apple Watch data. "Whoop for iPhone."

**Steal:**
- **Glanceable dashboard** — users check readiness in under 10s. Every card has the score in big and one supporting line.
- **Cards for Recovery / Exertion / Sleep** — equal size, vertical stack. No hierarchy between domains.
- **HR Zone chart with color-coded bars** — useful pattern for per-exercise intensity history.
- **Widget-first thinking** — every card is sized like a 2x2 widget. Forces brevity.

**URL:** https://apps.apple.com/us/app/athlytic-ai-fitness-coach/id1543571755, https://screensdesign.com/showcase/athlytic-ai-fitness-coach, https://www.athlyticapp.com/

**Fit:** 8/10. Strong "equal-surface-area cards" reference.

---

## 8. Strong

**What it is:** Long-running workout tracker, 3M+ users.

**Steal:**
- **Dark mode with green+blue accents, gym-readable** — high contrast, large hit targets, all-caps section labels.
- **Logbook layout** — each exercise is a card with the set table; reps/weight in mono.
- **Previous workout reference at top** of each exercise during a session (same idea as Hevy).
- **Inline plate calculator** triggered from weight input — solves a real gym problem.

**URL:** https://www.strong.app/, https://apps.apple.com/us/app/strong-workout-tracker-gym-log/id464254577

**Fit:** 8/10. Backup reference for Hevy set logging.

---

## 9. Garmin Connect

**What it is:** Garmin's companion app. Defaults to dark mode.

**Steal:**
- **Dense home with customizable card order** — every metric is a card the user can reorder/hide. Matches our "no hero" requirement.
- **Per-metric trend sparkline inline** — no big chart needed if you have a 30px sparkline next to the number.
- **Performance Dashboard** lays multiple charts in a single scroll for power users without forcing them through tabs.

**URL:** https://www.garmin.com/en-US/blog/fitness/what-is-the-garmin-connect-performance-dashboard/, https://support.garmin.com/en-US/?faq=XwPv4qgvAj4tlgpt0tSK18

**Fit:** 7/10. Reorderable card grid pattern.

---

## 10. Future (1:1 coaching app)

**What it is:** Premium remote-coaching app, known for polished UX.

**Steal:**
- **Workout Overview screen** — calendar/consistency at top, today's session card mid, history list below. Clean information hierarchy without a dominating hero.
- **Coach message inline** — humanizing touch. We don't have a coach, but the "note from last session" or "Dani's note" could occupy that slot.
- **Bottom-anchored primary CTA** ("Start Workout") always reachable with thumb.

**URL:** https://mobbin.com/explore/screens/7a7d0256-2454-4e34-88da-fce5571d6686 (Future iOS Workout Overview)

**Fit:** 7/10.

---

## 11. Gentler Streak

**What it is:** 2024 Apple Design Award winner. "Friendly fitness."

**Steal:**
- **Warmth in tone without losing minimalism** — the copy and micro-illustration character ("Yorhart") add personality. Our app has a single user (Dani); a small mascot or signature illustration could anchor empty states without cluttering the data UI.
- **Color via gradient backgrounds** (used sparingly on featured cards) — could be a lime-tinted gradient for "today's session" card vs neutral cards for the rest.
- **Approachable-but-clean** is a tone we want — the app is for personal use, not a stoic athlete brand.

**URL:** https://apps.apple.com/us/app/gentler-streak-workout-tracker/id1576857102, https://developer.apple.com/news/?id=3m0ht22s, https://www.sketch.com/blog/gentler-streak/

**Fit:** 7/10. Tone/voice reference.

---

## 12. Robinhood

**What it is:** Stock trading. Not fitness, but the reference for **numbers-as-the-product**.

**Steal:**
- **Mono / tabular numbers** so digits align — critical for our weight/reps columns and PR comparisons.
- **4-color minimum palette** (white, near-black, green, red). Apply: bg, text, lime (positive/PR/done), amber-red (regression). Refuse to add more.
- **Number-with-graph hero pattern** — value on top, sparkline below. Useful for exercise history page (current 1RM + sparkline).
- **Subtle number animation** on change — count-up when a set is logged, gives positive feedback.

**URL:** https://apps.apple.com/us/app/robinhood-trading-investing/id938003185, https://design.google/library/robinhood-investing-material, https://www.telerik.com/blogs/font-strategies-fintech-websites-apps

**Fit:** 8/10. Typography/number-treatment reference.

---

## 13. Eight Sleep

**What it is:** Smart mattress app. Pure dark UI with gradient accents.

**Steal:**
- **Gradient as data** — sunset/dawn gradient used to represent sleep phases. We could use a lime-to-dim gradient for set completion progress within an exercise.
- **Long scroll dashboard** with section dividers — no tabs, just stacked sections. Works well on PWA where deep navigation is awkward.
- **Score + adaptive trend** — readiness score is contextual to the user's own baseline. Our equivalent: PR delta relative to user's own history, not absolute weight.

**URL:** https://apps.apple.com/us/app/eight-sleep/id1086913845, https://www.eightsleep.com/ca/sleepos/

**Fit:** 6/10. Mostly gradient + scroll pattern.

---

# TOP 5 CURATION

The five references to lean on hardest, with steals grouped by theme.

## Top 5 picks
1. **Hevy** (10) — set logging UX
2. **WHOOP** (10) — data-dense dark dashboard philosophy
3. **Strava** (9) — weekly progress chart + training log
4. **Oura** (9) — equal-weight metric cards + score typography
5. **Linear** (9) — typography system, mono numbers, single-accent token discipline

## Grouped steals

### Typography system
- **Inter Variable** for UI, with tight letter-spacing (Linear: `-0.22px` display, `-0.11px` body).
- **Tabular/mono numbers** for all weight×reps×sets (Robinhood, Linear). Inter has a `tnum` variant — enable it. For the heaviest data tables, swap to JetBrains Mono or IBM Plex Mono.
- **Big numbers, thin weight** — Oura/Whoop style. Display sizes at 300-400 weight, not 700. Lightness conveys precision.
- **All-caps micro-labels** at 11px with wider tracking for section headers (Strong, Whoop).

### Color & tokens
- **3-variable theme system** (Linear LCH approach): base gray, accent lime `#a3e635`, contrast level. Derive everything else.
- **Background:** `#0a0a0a` or `#111` (not pure black — Strava lesson).
- **Accent used sparingly:** only on (a) the one CTA per screen, (b) PR/done states, (c) the current/today indicator. Everything else is grayscale.
- **Semantic colors:** lime = positive/done/PR, dim amber = warning/missed, red only for destructive confirms. No blues, no purples, no extras.

### Set logging row (the Hevy steal)
- Row anatomy: `[set#/type pill] [previous: 40×8 ghosted]  [weight ⌨]  [reps ⌨]  [✓]`
- Tap the set-number pill to switch type (Normal/Warm/Failure/Drop).
- Tap ✓ to complete → triggers rest timer overlay.
- Swipe left to delete; `+ Add Set` row at bottom of exercise card.
- Previous session's values shown dimmed in the inputs as placeholder.

### Rest timer
- Sticky bottom sheet with countdown, `-15s` / `+15s` / `Skip` controls (Hevy).
- For PWA: stays visible across navigation within the session. Use `position: sticky` over bottom tab bar.

### Weekly navigation (Strava steal)
- Horizontal bar chart, one bar per day OR one bar per week.
- Tap a bar → drill into that day's session.
- Y-axis toggle: volume / sets / sessions (Strava toggles time/distance/elevation).
- Use lime for current week, dim gray for past, ghost outline for future.

### Dashboard / equal-surface cards (Oura + Whoop + Athlytic)
- Vertical stack of equal-width cards. No hero card.
- Each card: big number (40-60px) + one supporting line + mini sparkline.
- Card categories for our app: Today's Session · This Week · Last Workout · Body Metric · Streak · Progress Photo prompt.
- Reorderable (Garmin pattern) — let user pin what matters.

### Exercise history detail (Robinhood + Oura)
- Top: current best (1RM est) as big number with delta vs last month in lime/red.
- Sparkline of weight progression across all sessions.
- List of sessions below with set summary in mono columns.

### Voice/tone (Gentler Streak)
- Warm but minimal. PT-BR copy stays human ("Bom treino, Dani") without being cheesy.
- Empty states with a tiny illustration or single sentence — not a stock graphic.

### What NOT to take
- No neumorphism (Bevel) — flat is correct.
- No saturated red CTAs (Peloton) — lime is the only accent.
- No 5+ tab bottom nav — keep to 3-4 tabs.
- No light mode — we are dark-only by direction.

---

## Reference URLs (consolidated)

- Whoop home screen: https://www.whoop.com/us/en/thelocker/the-all-new-whoop-home-screen/
- Whoop design breakdown: https://www.925studios.co/blog/whoop-design-breakdown
- Strava Progress chart: https://support.strava.com/hc/en-us/articles/28437860016141-Progress-Summary-Chart
- Strava on Mobbin: https://mobbin.com/explore/screens/852f7ee0-07a6-45cf-8111-ccad12d6e7fc
- Oura redesign: https://ouraring.com/blog/new-oura-app-experience/
- Oura on Dribbble: https://dribbble.com/shots/26970862-Oura-Mobile-App-Smart-Ring-Health-Tracking-UI
- Hevy App Store: https://apps.apple.com/us/app/hevy-workout-tracker-gym-log/id1458862350
- Hevy on ScreensDesign: https://screensdesign.com/showcase/hevy-workout-tracker-gym-log
- Hevy rest timer: https://www.hevyapp.com/features/workout-rest-timer/
- Linear redesign post: https://linear.app/now/how-we-redesigned-the-linear-ui
- Linear brand: https://linear.app/brand
- Apple Activity Rings HIG: https://developer.apple.com/design/human-interface-guidelines/activity-rings
- Apple Fitness on Mobbin: https://mobbin.com/explore/screens/f8ca0d70-c83d-41de-94d0-2c45cd3c266d
- Athlytic: https://apps.apple.com/us/app/athlytic-ai-fitness-coach/id1543571755
- Strong: https://www.strong.app/
- Garmin Performance Dashboard: https://www.garmin.com/en-US/blog/fitness/what-is-the-garmin-connect-performance-dashboard/
- Future on Mobbin: https://mobbin.com/explore/screens/7a7d0256-2454-4e34-88da-fce5571d6686
- Gentler Streak (ADA): https://developer.apple.com/news/?id=3m0ht22s
- Robinhood App Store: https://apps.apple.com/us/app/robinhood-trading-investing/id938003185
- Eight Sleep: https://www.eightsleep.com/ca/sleepos/
- Mobbin fitness category: https://mobbin.com/explore/mobile/app-categories/health-fitness
