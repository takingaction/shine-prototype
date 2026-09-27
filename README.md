# SHINE Refresh - Prototype (B2B / Institutional)

A single-page prototype of the SHINE site refresh, built for the **primary audience of institutional buyers** - venues, schools, and arts organizations that would license a SHINE intensive and then sell tickets to families in their community.

The Broward Center for the Performing Arts 2026 intensive is the **proof case study**, not the product being sold. There is no parent-facing "Reserve Your Spot" CTA; the conversion action is **"Inquire About Hosting."**

Open `index.html` in any modern browser, or run a local server:

```sh
python3 -m http.server 8000
# then visit http://localhost:8000
```

No build step, no dependencies, no framework.

---

## What's real vs. placeholder

Real (lifted from the plan, photos, or photos' visible text):

- All section headlines, subheadings, and the 6-day timeline copy
- Brian's pull quote, bio, and credential list
- The educator testimonial, trimmed to its strongest line
- Stats band numbers: **17 · 6 · 1**
- SHINE branding, Broward Center for the Performing Arts (visible on shirts + plan)
- All photos in `/assets/` (renamed from the scraped `imgi_X_default.*` filenames)
- The link to https://www.browardcenter.org/education/programs/intensives/ in the case study
- The two-column "We bring / You bring" copy structure

Placeholder (every `[bracketed]` shown with a subtle dashed underline in the browser):

| Field | Where |
|---|---|
| Ages `[X–Y]` | Hero, fit, FAQ |
| Daily hours `[9:00 AM – 3:00 PM]` | Timeline, program specs, FAQ |
| Phone, email | Footer, form, contact line |
| Featured parent quote | Testimonials |
| Student quotes (2) | Testimonials |
| Host/presenter quote (Broward Center contact) | Testimonials, case study |
| `[X]%` would recommend | Stats band |
| `[15–20]` student cohort floor | Fit section |
| Student-to-staff ratio `[X:1]` | Meet Brian |

**No pricing is shown on the page.** The program specs card explicitly says "Pricing varies by partnership model and cohort. Inquire for a tailored quote." This is intentional - institutional buyers qualify themselves via the inquiry form, and any price shown creates an anchor that can disqualify good leads.

---

## Phase 1 quick wins - what's already wired

From the plan's §10 Phase 1 checklist, adapted for B2B:

- [x] **Inquire About Hosting** button in nav, hero, video, case study, program specs, final CTA, mobile sticky bar
- [x] Program-spec facts bar (duration, format, ages, cohort) directly in the hero
- [x] Final section is an inquiry CTA, not a parent enrollment CTA
- [x] Video moved up, directly below the hero
- [x] Mailto replaced with on-page inquiry form
- [ ] Analytics, retargeting pixels, and email backend - not wired (per scope)
- [ ] Form submission endpoint - not wired (form is JS-only, shows success state)

---

## Asset rename map

The 18 source files were renamed for clarity:

| Old | New | Used in |
|---|---|---|
| `imgi_1_default.png` | `favicon.png`, `feinline-logo.png` | Favicon, footer |
| `imgi_2_default.png` | `logo-shine.png` | Nav |
| `imgi_3_default.jpg` | `hero.jpg` | Hero background |
| `imgi_4_default.jpg` | `brian-student.jpg` | Meet Brian |
| `imgi_5_default.jpg` | `day-3-guitar.jpg` | Not currently used |
| `imgi_6_default.jpg` | `day-1-ensemble.jpg` | Timeline Day 1 |
| `imgi_7_default.jpg` | `day-2-planning.jpg` | Timeline Day 2 |
| `imgi_8_default.jpg` | `day-3-piano-laugh.jpg` | Timeline Day 3 |
| `imgi_9_default.jpg` | `day-4-choreo.jpg` | Timeline Day 4 |
| `imgi_10_default.jpg` | `day-6-solo.jpg` | Timeline Day 6, gallery, case study |
| `imgi_11_default.jpg` | `staff.jpg` | Teaching staff block |
| `imgi_12_default.jpg` | `gallery-highfive.jpg` | Gallery |
| `imgi_13_default.jpg` | `gallery-choir.jpg` | Gallery |
| `imgi_14_default.jpg` | `gallery-cast-pose.jpg` | Gallery, case study |
| `imgi_15_default.jpg` | `gallery-cast-bow.jpg` | Gallery, hero video poster |
| `imgi_16_default.jpg` | `gallery-rehearsal.jpg` | Timeline Day 5, gallery, case study |
| `download.svg` | `play.svg` | Video facade |
| `download (1).svg` | `instagram.svg` | Footer |

---

## Things to collect from Brian before launch

1. **Ages, cohort size, and daily hours** - currently bracketed.
2. **Phone number** that should appear in the footer and form note.
3. **Featured parent quote + 2 student quotes** with permissions, for the testimonials section.
4. **A host/presenter quote from his Broward Center contact** - this is the most important missing piece of social proof. Without it, the case study lacks a voice from the buyer's side.
5. **Teaching staff bios and headshots** if there are other instructors.
6. **Highlight video** - replace the placeholder YouTube URL in `index.html` with the real 60–120 second re-edit.
7. **Host information packet (PDF)** - referenced via the "Download the host information packet" link. Mailto placeholder for now.
8. **Geographic / travel radius** - add to FAQ if Brian wants to scope this.
9. **Logo permissions** for Broward Center and ASCAP if those logos get added to the credibility strip.
10. **Pricing model language** - even though no number is shown, you may want to publish the *structure* (e.g., "tiered by cohort size, includes travel and licensing"). Currently the page just says "Inquire for a tailored quote."
