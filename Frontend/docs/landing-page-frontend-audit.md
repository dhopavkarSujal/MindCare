# MindCare Landing Page — Frontend Audit and Improvement Plan

**Audit date:** 2026-10-26  
**Repository:** dhopavkarSujal/MindCare  
**Working branch:** feature/frontend-improvements  
**Scope:** Existing landing page components and marketing styles. This is an audit only; the UI has not been changed yet.

## 1. Executive summary

The landing page is already a structured Next.js page, not a blank template. It uses reusable components, meaningful product copy, basic metadata, a skip link, responsive CSS, reduced-motion handling, and explicit labels for illustrative product previews.

The best next step is a controlled refinement, not a wholesale redesign. The main findings are:
1. The hero CTA “See how it works” links to the features section, although a dedicated “How it works” section exists.
2. The desktop and mobile headers use plain anchors for internal pages such as /about and /resources, causing full-document navigations instead of Next.js client navigation.
3. The marketing styles are split across large, heavily overlapping global stylesheets. This makes changes order-dependent and difficult to maintain.
4. Some small text in the mock UI has low contrast and very small type sizes.
5. Header, entrance effects, and responsive layouts need browser verification before broad style refactoring.

No .env values, API contracts, authentication, or backend behavior are in scope.

## 2. Existing landing-page structure

Frontend/src/app/page.tsx composes the page in this order:

1. ScrollEffects
2. SiteHeader
3. HeroSection
4. ValueStrip
5. ExperienceSection
6. FeaturesSection
7. HowItWorksSection
8. ApproachSection
9. CtaSection
10. FaqSection
11. SiteFooter

Keep the homepage as a server component. Retain client-side behavior only in components that need it, such as the mobile/scroll-aware header, interactive mood preview, and scroll effects.

### Files to inspect

- Frontend/src/app/page.tsx — page composition and metadata.
- Frontend/src/components/marketing/site-header.tsx — desktop/mobile navigation.
- Frontend/src/components/marketing/hero-section.tsx — headline and primary/secondary CTAs.
- Frontend/src/components/marketing/mood-preview.tsx — interactive illustrative mood preview.
- Frontend/src/components/marketing/experience-section.tsx — illustrative dashboard.
- Frontend/src/components/marketing/features-section.tsx — feature cards.
- Frontend/src/components/marketing/how-it-works-section.tsx — process section.
- Frontend/src/components/marketing/approach-section.tsx — privacy, wellbeing, and product limits.
- Frontend/src/components/marketing/cta-section.tsx — registration CTA.
- Frontend/src/components/marketing/faq-section.tsx — FAQ disclosure controls.
- Frontend/src/components/marketing/site-footer.tsx — footer links and disclaimer.
- Frontend/src/lib/marketing-content.ts — centralized navigation and marketing copy.
- Frontend/src/app/globals.css — shared tokens and base styles.
- Frontend/src/app/marketing.css — main marketing styles.
- Frontend/src/app/marketing-botanical.css — later visual overrides.
- Frontend/src/app/layout.tsx — fonts and global CSS imports.

## 3. What is already good

- The home page is composed from small, understandable components.
- The headline and body copy communicate that MindCare is a student wellbeing platform.
- The semantic foundation includes a main region, main heading, skip link, labelled navigation, and native details/summary FAQ.
- The mood preview explicitly says it is a demo and is not saved. The sample dashboard chart is labelled illustrative, not personal data. Preserve this honesty.
- The page already has responsive breakpoints and reduced-motion support.
- The main account actions use the existing /register and /login routes.
- The homepage has a title, description, and basic Open Graph metadata.
- The product-limit text says MindCare is not a replacement for professional mental-health or emergency care. Keep such limits clear and do not add unverified clinical claims.

## 4. Findings and priority

### P1 — Fix the hero CTA destination

File: Frontend/src/components/marketing/hero-section.tsx

The secondary CTA is labelled “See how it works” but links to #features. The actual process section is id="how-it-works" in HowItWorksSection.

**Improvement:** point the CTA to #how-it-works, then verify that the sticky header does not cover the target heading.

**Benefit:** the user's expectation matches the action.

### P1 — Use Next.js navigation for internal page links

File: Frontend/src/components/marketing/site-header.tsx

Desktop and mobile menus render all navigationItems as plain anchors, including /about and /resources. Those internal page links cause full-document navigation rather than using Next.js Link.

**Improvement:** use next/link for internal routes while retaining correct hash navigation for sections. Keep the existing mobile menu close behavior, Escape-key behavior, aria-expanded, aria-controls, and accessible toggle name.

**Benefit:** more consistent App Router navigation and less avoidable reload work.

### P1 — Reduce CSS duplication and cascade uncertainty

Files: Frontend/src/app/marketing.css, Frontend/src/app/marketing-botanical.css, Frontend/src/app/layout.tsx

Current source sizes:
- marketing.css: 2,414 lines / about 78 KB.
- marketing-botanical.css: 1,839 lines / about 32 KB.
- Combined: about 4,253 source lines / 110 KB before production bundling and compression.

Both stylesheets are imported from the root layout. They share all 166 unique class names present in the botanical stylesheet. The main stylesheet also repeats 251 exact selector blocks, with some appearing as many as nine times. The active appearance therefore depends on cascade order and later overrides.

**Improvement:** map the currently winning declarations first, then consolidate repeated rules into one intentional source of truth. Centralize colors, typography, spacing, radii, shadows, focus rings, and breakpoint values. Only after visual checks, consider scoping marketing styles closer to the public route with a route-level layout or CSS Modules.

**Do not simply delete marketing-botanical.css.** It currently supplies active styling; removing it without migrating the winning rules would break the design.

**Benefit:** easier future refinement, fewer accidental regressions, and a path toward reducing marketing-specific CSS applied to other routes.

### P1 — Improve contrast and microcopy readability

Files: the two marketing stylesheets, particularly mood-preview and illustrative dashboard styles.

Calculated from the declared CSS color pairs, some effective text combinations are below 4.5:1:
- #6F7D72 on white: approximately 4.33:1.
- #68766C on #F0F3EB: approximately 4.26:1.
- #69776D on #F5F5EE: approximately 4.30:1.

Several illustrative labels are also around 7–10 CSS pixels, and some mobile styles go smaller. This makes informative UI details difficult to read.

**Improvement:** verify the computed colors in a browser, raise informative text contrast to the applicable WCAG AA minimum, and increase meaningful microcopy to a comfortable size. Tiny purely decorative text inside the dashboard mockup can be simplified rather than emphasized.

**Reference:** W3C WCAG 2.2, Success Criterion 1.4.3 (Contrast Minimum): https://www.w3.org/TR/WCAG/#contrast-minimum. Normal text generally requires at least 4.5:1; large text has a 3:1 threshold.

**Benefit:** improved readability while retaining the calm palette.

### P2 — Verify responsive navigation and focus

File: Frontend/src/components/marketing/site-header.tsx

The menu already has useful accessibility foundations. Do not remove them.

**Improvement:** test Escape close, returning focus to the toggle, choosing a destination, keyboard-only use, and menu behavior across 821–1080 px. Multiple stylesheets define overlapping responsive rules, so do not assume the breakpoint behavior is correct without testing.

**Benefit:** fewer issues on tablets and small laptops.

### P2 — Simplify overlapping motion behavior

Files: Frontend/src/components/marketing/scroll-effects.tsx and the marketing stylesheets.

The hero has CSS entry animations while its elements also use the IntersectionObserver-based data-reveal system. Additional floating, pulsing, and shape-morphing animations are used decoratively.

**Improvement:** use one predictable reveal mechanism for content, avoid overlapping opacity/transform ownership, keep decorative movement restrained, and preserve reduced-motion and no-JavaScript visibility.

**Benefit:** more stable animation behavior and less distraction.

### P2 — Refine the hero before changing every section

Files: hero-section.tsx, mood-preview.tsx, relevant marketing CSS.

The headline and preview establish a useful product story. Focus first on line wrapping, content width, type sizes, CTA hierarchy, preview scale, and floating-note collisions across viewport sizes. Do not add fictional testimonials, invented statistics, or clinical outcome claims. Keep the mood preview visibly marked as a demo that does not save.

**Benefit:** a clearer first screen without replacing MindCare's identity.

### P2 — Make the whole-page story less repetitive

Files: section components and marketing-content.ts.

Current order is logical: promise → values → product preview → features → steps → approach/limits → CTA → FAQ. The experience preview and feature cards discuss some of the same tools.

**Improvement:** retain the sections initially, but give each a distinct job:
- Hero: audience, core promise, next action.
- Value strip: principles at a glance.
- Experience preview: what the product feels like.
- Features: which tools exist.
- How it works: what a new user does.
- Approach: privacy, limits, and trust.
- CTA/FAQ: registration and remaining questions.

Shorten repeated lines only when it improves clarity. Keep product limitations and privacy language accurate.

### P3 — Verify social/SEO details

Basic title, description, and Open Graph metadata already exist. Check the rendered title template, descriptions, and whether a real approved social preview asset exists. Add an Open Graph image only when a suitable asset is present. Do not invent asset paths or modify NEXT_PUBLIC_SITE_URL.

## 5. Recommended implementation sequence

### Step 0 — Check out the feature branch

The branch has been created from main as feature/frontend-improvements.

From the existing local repository, run:

    git fetch origin
    git switch --track origin/feature/frontend-improvements
    git status --short

If there are unrelated local changes, commit or save them before starting.

### Step 1 — Capture the current UI before edits

Run the existing app and capture screenshots at:
- 1440 × 900 desktop
- 1024 × 768 small desktop/tablet landscape
- 768 × 1024 tablet portrait
- 390 × 844 mobile
- 360 × 800 narrow mobile

Test header links, both hero CTAs, section anchors, registration/sign-in links, FAQ controls, and mobile-menu behavior. Record pre-existing issues separately from regressions.

### Step 2 — Make small, high-confidence corrections

1. Fix the hero CTA destination.
2. Use Next.js Link for internal page navigation.
3. Check anchor offsets with the sticky header.
4. Verify keyboard focus and mobile-menu close behavior.

### Step 3 — Establish the real effective design tokens

Document the computed/winning colors, fonts, type scale, container widths, spacing, buttons, borders, radii, shadows, focus rings, breakpoints, and motion. Consolidate only after confirming which stylesheet currently wins.

### Step 4 — Refine the hero and preview

Compare every viewport screenshot. Improve heading wrap, text measure, CTA alignment, preview proportions, contrast, and microcopy legibility. Keep the preview clearly illustrative and non-persistent.

### Step 5 — Improve the remaining sections in page order

Work one section at a time: value strip → experience preview → feature cards → how it works → approach → CTA → FAQ → footer. Test all links and avoid repetitive copy.

### Step 6 — Consolidate styles carefully

Merge duplicate declarations and tokens without deleting effective rules. Consider route-level style scoping after the visual result is stable. Take screenshots again after significant CSS changes.

### Step 7 — Run responsive and accessibility checks

Check horizontal overflow, clipped artwork, awkward wrapping, targets obscured by the sticky header, keyboard focus, contrast, hit areas, and reduced-motion behavior. Use computed colors rather than judging contrast by appearance.

### Step 8 — Measure and test

From the complete Frontend project, run the supported commands:

    npm run lint
    npm run typecheck
    npm run build

Then use the browser to check runtime errors, navigation, keyboard behavior, and Lighthouse/Core Web Vitals where the environment supports them. Report actual measurements; never invent scores. Do not convert the whole landing page into a client component or add dependencies without a demonstrated need.

### Step 9 — Review and commit in small units

Review git diff and git status. Confirm changes are limited to the landing page, environment files are untouched, and API/auth/backend files were not changed. Commit navigation fixes, visual refinement, and CSS consolidation in reviewable units. Keep chatbot changes out of this first landing-page pass.

## 6. Acceptance criteria

- All CTA/header links lead to the intended destination.
- Internal page navigation uses Next.js navigation where appropriate.
- The page retains a recognisable MindCare brand and consistent visual hierarchy.
- Hero content and preview fit well at all target widths.
- No horizontal overflow at 360, 390, 768, 1024, and 1440 px.
- Sticky navigation does not cover section headings reached by anchors.
- Informative text meets applicable WCAG contrast requirements and remains legible.
- Keyboard focus is visible and mobile navigation works without a mouse.
- Reduced-motion behavior remains intact.
- Demo data remains explicitly illustrative and is never presented as a saved user record.
- No fabricated claims, dead buttons, avoidable runtime errors, or unrelated API/configuration changes are introduced.
- Test results are accurately marked passed, failed, or not run.

## 7. Audit limitations

This is a static code audit based on the uploaded src archive and the matching homepage/package metadata inspected from GitHub. The uploaded archive itself does not include the complete runnable project or public assets. A local browser run, production build, Lighthouse result, and multi-viewport screenshot comparison have not been completed. Therefore, actual clipping and runtime behavior at the target sizes remain to be verified in Step 1; they are not claimed as tested.

## 8. Out of scope for this first pass

- AI model latency or Express/FastAPI streaming.
- Chat request/response contract changes.
- Supabase authentication changes.
- Backend, Prisma, or database changes.
- Environment file changes or new environment variables.
- New npm dependencies.
- Replacing the existing website with a generic template.
