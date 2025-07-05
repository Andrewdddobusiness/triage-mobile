# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

### Core Commands
- `npm start` - Start Expo development server
- `npm run android` - Run on Android emulator/device
- `npm run ios` - Run on iOS simulator/device
- `npm run web` - Run web version
- `npm run dev:all` - Run both backend and frontend concurrently

### Backend Commands
- `npm run backend:dev` - Start backend development server with hot reload
- `npm run backend:build` - Build backend TypeScript
- `npm run backend:start` - Start production backend

### Testing & Quality
- `npm test` - Run Jest tests in watch mode
- `npm run lint` - Run Expo linting

### Utility Commands
- `npm run reset-project` - Reset to blank project structure

## Architecture Overview

### Project Structure
This is a React Native Expo application with a Node.js/Express backend:

**Frontend (React Native + Expo):**
- `app/` - File-based routing with Expo Router
- `components/` - Reusable UI components including onboarding flow
- `lib/` - Core utilities, auth context, services, and types
- `stores/` - Zustand state management
- `assets/` - Images, fonts, and static assets

**Backend:**
- `backend/src/` - Express.js server (though backend directory appears empty in current state)
- `supabase/` - Supabase functions and migrations

### Key Technologies
- **Frontend:** React Native, Expo Router, NativeWind (Tailwind CSS), Zustand
- **Backend:** Node.js, Express, TypeScript
- **Database:** Supabase
- **Authentication:** Supabase Auth + Google Sign-in
- **Payments:** Stripe integration
- **Voice/Calling:** Twilio Voice SDK
- **Maps:** React Native Maps
- **UI:** Custom components with Tailwind CSS styling

### App Architecture
The app follows a tab-based navigation structure:
- **Main tabs:** Home, Assistant Settings, Profile
- **Onboarding flow:** Multi-step wizard for user setup
- **Request system:** Dynamic routes for handling customer requests
- **Authentication:** Sign-in/Sign-up flows with Google integration

### Key Features
- Voice calling functionality with Twilio
- AI assistant integration (VAPI)
- Stripe subscription management
- Location-based services
- Onboarding wizard with business setup
- File-based routing with typed routes

### State Management
- Zustand stores for global state
- Auth context for authentication state
- Async storage for persistence

### Styling
- NativeWind for Tailwind CSS in React Native
- Custom theme with CSS variables
- Dark mode support

## Development Notes

### Environment Setup
The app requires various API keys and configuration for:
- Supabase (database and auth)
- Google Sign-in
- Stripe payments
- Twilio Voice
- VAPI assistant

### Build Configuration
- iOS: Bundle identifier `com.spaak.mobile`
- Android: Package name `com.spaak.mobile`
- Uses Expo EAS Build with project ID `a8e32c86-9708-4a38-b110-b92d6a29e491`

### Testing
- Jest with Expo preset
- Component tests in `components/__tests__/`