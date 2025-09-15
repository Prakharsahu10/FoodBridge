<div align="center">

# 🍽️ FoodBridge

Reduce food waste. Feed more people. Built with Expo + Firebase.

[![Expo](https://img.shields.io/badge/Expo-%5E51-000?logo=expo&logoColor=white)](https://expo.dev)
[![React Native](https://img.shields.io/badge/React%20Native-0.7x-61DAFB?logo=react&logoColor=white)](https://reactnative.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-Strict-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![Firebase](https://img.shields.io/badge/Firebase-Firestore%20%26%20Auth-FFCA28?logo=firebase&logoColor=black)](https://firebase.google.com)

</div>

---

## ✨ Overview

FoodBridge connects food donors (restaurants, individuals) with receivers (NGOs, individuals). Donors post surplus food; receivers request it; both coordinate pickup via in‑app chat and maps.

## 🌟 Features

- ✅ **Role‑based Auth** (Donor / Receiver)
- 🗺️ **Nearby Listings** with distance and expiry indicators
- 📨 **Request Flow** with accept/reject and cleanup actions
- 💬 **In‑app Chat** per listing
- ⭐ **Ratings** for trust and safety
- 📸 **Image Uploads** to Firebase Storage
- 📍 **GPS & Maps** via Expo Location

## 🧱 Architecture

- App: Expo (React Native, TypeScript)
- State: Local screen state + Context for auth
- Backend: Firebase (Auth, Firestore, Storage)
- Realtime: Firestore `onSnapshot` (requests, messages)

```
React Native (Expo)
   ├── Screens (Map, ListingDetail, IncomingRequests, Chat)
   ├── Components (FoodCard, ...)
   └── Contexts (Auth)
             │
             ▼
        Firebase Services
          ├── Auth
          ├── Firestore (users, listings, requests, messages, ratings)
          └── Storage (images)
```

## 🗃 Data Model (simplified)

- `users`: `{ id, name, role, rating, createdAt }`
- `listings`: `{ id, donorId, title, description, foodType, quantity, expiryTime, pickupLocation, images, status, requestedBy[], createdAt, updatedAt }`
- `requests`: `{ id, listingId, requesterId, requesterName, donorId, donorName, status, createdAt }`
- `messages`: `{ id, listingId, senderId, text, timestamp }`

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- Expo CLI: `npm i -g @expo/cli`
- Firebase project (Firestore + Auth + Storage enabled)

### Install & Run

```bash
git clone <your-repo-url>
cd foodbridge
npm install
npm run start
# or
expo start
```

Open on device with Expo Go, or run `npm run android` / `npm run ios`.

### Configure Firebase

Update `src/services/firebase.ts` with your Firebase config. Firestore is initialized with long polling for React Native reliability.

### Environment (.env)

```env
EXPO_PUBLIC_GOOGLE_MAPS_API_KEY=your_google_maps_api_key
EXPO_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
```

## 🔐 Firestore Rules (starter)

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    match /listings/{listingId} {
      allow read: if request.auth != null;
      allow create: if request.auth != null && request.resource.data.donorId == request.auth.uid;
      allow update: if request.auth != null && request.resource.data.donorId == request.auth.uid;
    }
    match /requests/{requestId} {
      allow read, create: if request.auth != null;
      allow update, delete: if request.auth != null;
    }
    match /messages/{messageId} {
      allow read, write: if request.auth != null;
    }
    match /ratings/{ratingId} {
      allow read, create: if request.auth != null;
    }
  }
}
```

## 🧰 Scripts

- `npm start` – Expo dev server
- `npm run android` / `npm run ios` – Run on emulator/device
- `npm run web` – Run in web
- `npm run build` – Build bundle

## 🧭 Troubleshooting

- **Realtime not updating**: Ensure each request document includes `donorId` and `donorName`. The app listens with `where("donorId", "==", donorId)`.
- **Firestore transport error**: We enable long polling via `initializeFirestore(..., { experimentalAutoDetectLongPolling: true })` for React Native.
- **Date errors**: Firestore Timestamps are normalized to JS `Date` objects in the API service.

## 🤝 Contributing

1. Fork & branch: `feat/your-feature`
2. Code with type safety and clear naming
3. PR with description and screenshots (if UI)

## 📜 License

MIT

---

Made with ❤️ to reduce food waste and help communities.
