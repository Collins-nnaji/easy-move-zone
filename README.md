# EasyMoveZone

EasyMoveZone is a travel intelligence and execution platform for international travelers. The product combines destination decision support, on-the-ground awareness, and preparation workflows in one experience.

## Core Features

The current product architecture is documented in [docs/easymovezone-core-features.md](docs/easymovezone-core-features.md).

- Travel Intelligence Core
  - Visa Intelligence + Legal and Compliance Navigator + Decision Intelligence Coach
- Situational Awareness Core
  - Smart Map Safety Layer + Country Reality Check + Live News Event Map
- Travel Execution Core
  - Readiness Checklist + Persona Engine + Booking Integrations

## Local Development

Run the development server:

```bash
npm run dev
```

Then open `http://localhost:3000`.

## Main App Areas

- Public marketing site: `app/page.tsx` and `components/platform/*`
- Move app experience: `app/move/*`
- Auth and user workspace: `app/auth/*`, `app/profile/*`, `app/dashboard/*`
- APIs: `app/api/*`
- Shared libraries: `lib/*`

## Product Notes

- The homepage feature section reflects the three current product cores.
- Product copy, design direction, and feature planning should stay aligned to the architecture in `docs/easymovezone-core-features.md`.
