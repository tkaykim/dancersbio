/// <reference types="@capacitor-firebase/messaging" />
import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.dancersbio.app',
  appName: 'DancersBio',
  webDir: 'out',
  server: {
    androidScheme: 'https',
    url: 'https://dancersbio.vercel.app',
  },
  plugins: {
    FirebaseMessaging: {
      presentationOptions: ['alert', 'badge', 'sound'],
    },
  },
};

export default config;
