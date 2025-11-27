# Welcome to your Expo app 👋

This is an [Expo](https://expo.dev) project created with [`create-expo-app`](https://www.npmjs.com/package/create-expo-app).

## Supabase backend

The web and mobile apps share a single Supabase workspace at the repository root (`supabase/`). Run Supabase CLI commands (migrations, Edge Functions, local stack) from that directory so both apps stay in sync.

## Environment setup

See `docs/00-env-and-brand-tokens.md` for the full checklist. Quick start:

1) Copy the sample env and fill in values (public keys only for mobile builds):

```bash
cp .env.example .env.local
```

Required values:
- `EXPO_PUBLIC_SUPABASE_URL`, `EXPO_PUBLIC_SUPABASE_ANON_KEY`
- `EXPO_PUBLIC_API_URL_PROD`, `EXPO_PUBLIC_API_URL_DEV_IOS`, `EXPO_PUBLIC_API_URL_DEV_ANDROID`
- `EXPO_PUBLIC_GOOGLE_MAPS_API_KEY`, `EXPO_PUBLIC_GOOGLE_CLIENT_ID`
- `EXPO_PUBLIC_WEB_RESET_URL`

Optional server-side variables (Twilio, Supabase service role, VAPI) are for local backend use only—never ship them in mobile builds. Run `npm run env:check` to verify required values are present. EAS secrets should mirror web values for Supabase/Stripe/Twilio; keep private keys server-side only.

## Get started

1. Install dependencies

   ```bash
   npm install
   ```

2. Start the app

   ```bash
    npx expo start
   ```

In the output, you'll find options to open the app in a

- [development build](https://docs.expo.dev/develop/development-builds/introduction/)
- [Android emulator](https://docs.expo.dev/workflow/android-studio-emulator/)
- [iOS simulator](https://docs.expo.dev/workflow/ios-simulator/)
- [Expo Go](https://expo.dev/go), a limited sandbox for trying out app development with Expo

You can start developing by editing the files inside the **app** directory. This project uses [file-based routing](https://docs.expo.dev/router/introduction).

## Get a fresh project

When you're ready, run:

```bash
npm run reset-project
```

This command will move the starter code to the **app-example** directory and create a blank **app** directory where you can start developing.

## Learn more

To learn more about developing your project with Expo, look at the following resources:

- [Expo documentation](https://docs.expo.dev/): Learn fundamentals, or go into advanced topics with our [guides](https://docs.expo.dev/guides).
- [Learn Expo tutorial](https://docs.expo.dev/tutorial/introduction/): Follow a step-by-step tutorial where you'll create a project that runs on Android, iOS, and the web.

## Join the community

Join our community of developers creating universal apps.

- [Expo on GitHub](https://github.com/expo/expo): View our open source platform and contribute.
- [Discord community](https://chat.expo.dev): Chat with Expo users and ask questions.
