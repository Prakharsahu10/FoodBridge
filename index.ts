// Entry point for Expo app registration
import { registerRootComponent } from "expo";

import App from "./App";

// Registers App component as root component for both Expo Go and native builds
// Ensures proper environment setup for different deployment methods
registerRootComponent(App);
