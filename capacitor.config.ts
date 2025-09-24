import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.lovable.bcd3ace45f284649b795a03fa8188d09',
  appName: 'sm-ai-detection',
  webDir: 'dist',
  server: {
    url: 'https://bcd3ace4-5f28-4649-b795-a03fa8188d09.lovableproject.com?forceHideBadge=true',
    cleartext: true
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 0
    }
  }
};

export default config;