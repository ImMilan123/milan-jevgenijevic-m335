import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonList,
  IonItem,
  IonLabel,
  IonToggle,
  IonButton,
  IonButtons,
  IonBackButton,
  IonIcon,
  IonBadge,
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardTitle
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { moon, wifi, informationCircle } from 'ionicons/icons';
import { StorageService } from '../../services/storage.service';
import { NetworkService } from '../../services/network.service';
import { SupabaseService } from '../../services/supabase.service';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.page.html',
  styleUrls: ['./settings.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonList,
    IonItem,
    IonLabel,
    IonToggle,
    IonButton,
    IonButtons,
    IonBackButton,
    IonIcon,
    IonBadge,
    IonCard,
    IonCardContent,
    IonCardHeader,
    IonCardTitle
  ],
})
export class SettingsPage implements OnInit {
  darkMode = false;
  isOnline = true;
  appVersion = '1.0.0';
  supabaseStatus = 'Not tested yet';
  supabaseConnected = false;

  constructor(
    private router: Router,
    private storageService: StorageService,
    private networkService: NetworkService,
    private supabaseService: SupabaseService
  ) {
    addIcons({ moon, wifi, informationCircle });
  }

  async ngOnInit() {
    await this.loadSettings();
    this.checkNetworkStatus();
  }

  async loadSettings() {
    // Load dark mode preference
    this.darkMode = await this.storageService.loadThemePreference();
    this.applyTheme();
  }

  async checkNetworkStatus() {
    // Get initial status
    this.isOnline = await this.networkService.getNetworkStatus();
    
    // Subscribe to changes
    this.networkService.getNetworkStatusObservable().subscribe(status => {
      this.isOnline = status;
      console.log(' Settings: Network is now', this.isOnline ? 'online' : 'offline');
    });
  }

  async toggleDarkMode(event: any) {
    this.darkMode = event.detail.checked;
    await this.storageService.saveThemePreference(this.darkMode);
    this.applyTheme();
  }

  applyTheme() {
    const html = document.documentElement;
    if (this.darkMode) {
      html.setAttribute('data-theme', 'dark');
    } else {
      html.removeAttribute('data-theme');
    }
  }

  async clearCache() {
    const confirmation = window.confirm('This will only clear the offline cache. Your online data in Supabase will not be affected. Continue?');
    if (confirmation) {
      await this.storageService.clearOfflineExpenses();
      console.log(' Offline cache cleared');
      window.alert('Offline cache cleared. Refresh the expenses page to reload from Supabase.');
    }
  }

  async testSupabaseConnection() {
    this.supabaseStatus = 'Testing connection...';
    
    const result = await this.supabaseService.testConnection();
    
    this.supabaseConnected = result.connected && result.hasTable;
    this.supabaseStatus = result.message;
    
    console.log('Supabase test result:', result);
    
    // Show detailed alert
    if (result.connected && result.hasTable) {
      window.alert(`Supabase Connected!\n\nDatabase: ${result.rowCount} expense(s) found\n\nYour app is saving to the cloud!`);
    } else if (result.connected && !result.hasTable) {
      window.alert(`Connected but table missing!\n\nYou need to run the SQL setup in Supabase.\n\nGo to: SQL Editor → New Query → Paste the SQL`);
    } else {
      window.alert(`Connection Failed\n\n${result.message}\n\nCheck your Supabase credentials.`);
    }
  }

  navigateToDashboard() {
    this.router.navigate(['/dashboard']);
  }

  goHome() {
    this.router.navigate(['/dashboard']);
  }
}

