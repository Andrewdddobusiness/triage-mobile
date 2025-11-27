# Ticket 0.1/0.2: Environment Config Parity & Brand Tokens

## Environment & Secrets (T0.1)
- Mobile uses the same Supabase/Stripe/Twilio backends as web. Ensure the public Supabase URL + anon key and API base URLs match triage-web values.
- Required public env (bundled in app): `EXPO_PUBLIC_SUPABASE_URL`, `EXPO_PUBLIC_SUPABASE_ANON_KEY`, `EXPO_PUBLIC_API_URL_PROD`, `EXPO_PUBLIC_API_URL_DEV_IOS`, `EXPO_PUBLIC_API_URL_DEV_ANDROID`, `EXPO_PUBLIC_GOOGLE_MAPS_API_KEY`, `EXPO_PUBLIC_GOOGLE_CLIENT_ID`, `EXPO_PUBLIC_WEB_RESET_URL`.
- Run `npm run env:check` to verify required variables locally. Use `.env.local` for dev; never commit it.
- EAS secrets: store the above public keys plus platform creds (APNs key `AuthKey_WYTWHJ77F7.p8`, FCM if used) in the Expo dashboard. Keep server-side secrets (Supabase service role, Twilio, Stripe) in backend/.env or Supabase config only—do not ship in the app.
- Fresh-clone steps: `cp .env.example .env.local`, fill with shared values from web, `npm install`, `npm run env:check`, then `npx expo start`. Supabase CLI and Edge functions live at repo root (`supabase/`) and are shared with web.

## Brand Tokens (T0.2)
- Colors (lib/theme.ts): `primary #fe885a`, `primaryDark #f06936`, `primaryMuted #ffb351`, `accent #fbbf24`, `text #111827`, `textMuted #6b7280`, `surface #ffffff`, `surfaceMuted #f7f8fa`, `border #e5e7eb`, `success #22c55e`, `danger #ef4444`.
- Radii: `card 12`, `pill 24`, `button 16`. Shadows: `shadows.card` for elevated cards.
- Typography: prefer bold headings with `palette.text`, body with `palette.textMuted`, and primary actions with `palette.primary`.
- Usage: import `{ palette, radii, shadows }` from `~/lib/theme` instead of hard-coded hex values. Key screens (Help, Profile, Assistant, Requests) now use these tokens; follow the same pattern for new UI.
