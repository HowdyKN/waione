# HealthyWAI2

Single-screen React Native (Expo) app: homepage + ordering for a single-restaurant, single-item food delivery business.

## Run locally

```bash
cd healthywai2
npm install
npx expo start
```

Then open in iOS Simulator (`i`), Android Emulator (`a`), or scan the QR code with Expo Go on your phone (same Wi‑Fi).

## Project layout

- `App.tsx` — Entry point; renders `HomeOrderScreen`.
- `src/screens/HomeOrderScreen.tsx` — Main screen (product, delivery, order summary, FAQ).

## Tech

- React Native (Expo 54), TypeScript, StyleSheet only. No Tailwind, no external UI libs.
