# Skip the Gym

A walking tracker for everyday movement — outdoors, at home, or on a treadmill. Detected walks, recorded treadmill sessions, and manual entries share one honest history. Estimates are never labeled as measurements.

Built with Expo SDK 57 for iOS and Android.

## Run locally

```bash
npm start
```

Then press `i` for the iOS simulator or `a` for an Android emulator. Motion detection and the pedometer need a physical device.

## What the MVP includes

- Today and weekly walking totals
- Start/pause/finish treadmill recording
- Manual treadmill and other walks (date and duration are enough)
- Source labels: Detected, User entered, Estimated
- Local-only storage (no account)
- Metric and imperial units

A phone left on a treadmill desk cannot detect steps. That limitation is shown in the recording flow.

## Project layout

```
src/app            Expo Router screens and layouts
src/features       Today, history, profile, session, and walk flows
src/components/ui  Shared UI primitives
src/constants      Theme and app identity
src/lib            Dates, units, and formatting
assets             Store icons, splash, and fonts
```

## Store releases

1. Install EAS CLI: `npm install -g eas-cli`
2. Log in and create the Expo project: `eas login` then `eas init`
3. Build store binaries: `npm run build:ios` and `npm run build:android`
4. Submit: `npm run submit:ios` and `npm run submit:android`

Replace `assets/images` icons before the first store review. The iOS bundle identifier and Android package are both `com.skipthegym.app`.
