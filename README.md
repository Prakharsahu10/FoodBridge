# 🍽️ FoodBridge - Food Waste Reduction App

FoodBridge is a React Native mobile application built with Expo that connects food donors (restaurants, individuals) with food receivers (NGOs, individuals) to reduce food waste and help those in need.

## 🌟 Features

### Core Features

- **User Authentication**: Role-based sign-up (Donor/Receiver) with Firebase Auth
- **Food Listing**: Donors can create listings with photos, quantity, expiry time, and pickup location
- **Real-time Map**: Interactive map showing available food nearby with Google Maps integration
- **Request System**: Receivers can request food and donors can accept/reject requests
- **In-app Chat**: Real-time messaging between donors and receivers
- **Rating System**: Trust and safety through user ratings and reviews
- **Location Services**: GPS-based pickup location and distance calculation

### Advanced Features

- **Smart Notifications**: Push notifications for requests, acceptances, and expiring food
- **Impact Dashboard**: Track donations, people helped, and environmental impact
- **Geolocation Filtering**: Find food within specified radius
- **Image Upload**: Multiple photos per food listing
- **Expiry Management**: Automatic food expiry tracking with visual indicators

## 🛠️ Tech Stack

### Frontend

- **React Native** with Expo CLI
- **TypeScript** for type safety
- **React Navigation** for navigation
- **React Native Maps** for map functionality
- **Expo Location** for GPS services
- **Expo Image Picker** for photo uploads

### Backend

- **Firebase Authentication** for user management
- **Firestore Database** for real-time data storage
- **Firebase Storage** for image storage
- **Firebase Cloud Messaging** for push notifications

### UI/UX

- **Expo Vector Icons** for consistent iconography
- **React Native Async Storage** for local storage
- **Custom UI Components** with Material Design principles

## 📱 Screenshots

_Add screenshots here when available_

## 🚀 Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Expo CLI (`npm install -g @expo/cli`)
- Firebase project setup

### Installation

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd foodbridge
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Firebase Setup**

   - Create a new Firebase project at [Firebase Console](https://console.firebase.google.com)
   - Enable Authentication (Email/Password)
   - Create a Firestore database
   - Enable Storage
   - Get your Firebase configuration
   - Update `src/services/firebase.ts` with your config:

   ```typescript
   const firebaseConfig = {
     apiKey: "your-api-key",
     authDomain: "your-project.firebaseapp.com",
     projectId: "your-project-id",
     storageBucket: "your-project.appspot.com",
     messagingSenderId: "your-sender-id",
     appId: "your-app-id",
   };
   ```

4. **Run the application**

   ```bash
   npm start
   # or
   expo start
   ```

5. **Run on device**
   - Install Expo Go app on your mobile device
   - Scan the QR code from the terminal
   - Or use simulators: `npm run ios` or `npm run android`

### Firebase Firestore Rules

Set up these security rules in Firebase Console > Firestore Database > Rules:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can only read/write their own user document
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }

    // Anyone can read listings, only creators can modify
    match /listings/{listingId} {
      allow read: if request.auth != null;
      allow create: if request.auth != null && request.auth.uid == resource.data.donorId;
      allow update: if request.auth != null &&
        (request.auth.uid == resource.data.donorId ||
         request.auth.uid in resource.data.requestedBy);
    }

    // Requests can be read by donor and requester
    match /requests/{requestId} {
      allow read, write: if request.auth != null;
    }

    // Messages can be read by participants
    match /messages/{messageId} {
      allow read, write: if request.auth != null;
    }

    // Ratings can be read by anyone, written by authenticated users
    match /ratings/{ratingId} {
      allow read: if request.auth != null;
      allow create: if request.auth != null;
    }
  }
}
```

### Firebase Storage Rules

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /listings/{userId}/{imageId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

## 📁 Project Structure

```
foodbridge/
├── src/
│   ├── components/          # Reusable UI components
│   │   ├── FoodCard.tsx
│   │   └── index.tsx
│   ├── contexts/           # React Context providers
│   │   └── AuthContext.tsx
│   ├── navigation/         # Navigation configuration
│   │   └── AppNavigator.tsx
│   ├── screens/           # Screen components
│   │   ├── SplashScreen.tsx
│   │   ├── LoginScreen.tsx
│   │   ├── RegisterScreen.tsx
│   │   ├── HomeScreen.tsx
│   │   ├── MapScreen.tsx
│   │   ├── CreateListingScreen.tsx
│   │   ├── ListingDetailScreen.tsx
│   │   ├── ChatScreen.tsx
│   │   └── ProfileScreen.tsx
│   ├── services/          # External service integrations
│   │   ├── firebase.ts
│   │   └── api.ts
│   ├── types/             # TypeScript type definitions
│   │   └── index.ts
│   └── utils/             # Utility functions
│       └── helpers.ts
├── assets/                # Static assets
├── App.tsx               # Main application component
├── app.json             # Expo configuration
└── package.json         # Dependencies and scripts
```

## 🔧 Available Scripts

- `npm start` - Start the Expo development server
- `npm run android` - Run on Android simulator/device
- `npm run ios` - Run on iOS simulator (macOS only)
- `npm run web` - Run in web browser
- `npm run build` - Build for production

## 🌍 Environment Setup

Create a `.env` file in the root directory:

```env
EXPO_PUBLIC_GOOGLE_MAPS_API_KEY=your_google_maps_api_key
EXPO_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
```

## 🔑 Key Features Implementation

### User Roles

- **Donors**: Can create food listings, manage requests, chat with receivers
- **Receivers**: Can browse food, request items, chat with donors

### Real-time Features

- Live chat messaging
- Instant notifications for requests and updates
- Real-time listing status updates

### Location Services

- GPS-based location detection
- Map visualization of food listings
- Distance calculation and filtering
- Address geocoding/reverse geocoding

### Image Handling

- Multiple image upload per listing
- Image compression and optimization
- Firebase Storage integration

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- Firebase for backend services
- Expo for React Native development platform
- Google Maps for location services
- React Navigation for navigation
- All contributors and testers

## 📞 Support

For support, email support@foodbridge.app or join our community Discord.

## 🔮 Future Roadmap

- AI-powered food expiry prediction
- Multi-language support
- Integration with restaurant POS systems
- IoT sensor integration for smart fridges
- Blockchain-based donation tracking
- Advanced analytics dashboard for NGOs
- Social media sharing features
- Volunteer delivery system

---

Made with ❤️ to reduce food waste and help communities
