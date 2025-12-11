import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'ch.m335.budgetbuddy',
  appName: 'BudgetBuddy',
  webDir: 'www',
  server: {
    androidScheme: 'https'
  },
  plugins: {
    Camera: {
      quality: 90,
      allowEditing: false,
      resultType: 'dataUrl'
    },
    Network: {
      enabled: true
    },
    Preferences: {
      enabled: true
    }
  }
};

export default config;

