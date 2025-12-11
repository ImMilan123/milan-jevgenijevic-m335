import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonList,
  IonItem,
  IonLabel,
  IonButton,
  IonButtons,
  IonBackButton,
  IonIcon,
  IonBadge,
  IonSearchbar,
  IonFab,
  IonFabButton
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { add, chevronForward } from 'ionicons/icons';
import { SupabaseService } from '../../services/supabase.service';
import { StorageService } from '../../services/storage.service';
import { NetworkService } from '../../services/network.service';
import { Expense } from '../../models/expense.model';

@Component({
  selector: 'app-expenses',
  templateUrl: './expenses.page.html',
  styleUrls: ['./expenses.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonList,
    IonItem,
    IonLabel,
    IonButton,
    IonButtons,
    IonBackButton,
    IonIcon,
    IonBadge,
    IonSearchbar,
    IonFab,
    IonFabButton
  ],
})
export class ExpensesPage implements OnInit {
  expenses: Expense[] = [];
  filteredExpenses: Expense[] = [];
  isOnline = true;

  constructor(
    private router: Router,
    private supabaseService: SupabaseService,
    private storageService: StorageService,
    private networkService: NetworkService
  ) {
    addIcons({ add, chevronForward });
  }

  ngOnInit() {
    this.loadExpenses();
  }

  ionViewWillEnter() {
    this.loadExpenses();
  }

  async loadExpenses() {
    // Check network status
    this.isOnline = await this.networkService.getNetworkStatus();
    
    // Subscribe to network changes (only once)
    if (!this.networkService.getNetworkStatusObservable()['_isScalar']) {
      this.networkService.getNetworkStatusObservable().subscribe(async (status) => {
        const wasOffline = !this.isOnline;
        this.isOnline = status;
        console.log('📋 Expenses: Network is now', this.isOnline ? 'online' : 'offline');
        
        // If just came back online, sync offline data
        if (this.isOnline && wasOffline) {
          console.log(' Back online! Syncing offline data...');
          await this.syncOfflineData();
          // Reload without re-subscribing
          await this.reloadExpensesData();
        }
      });
    }
    
    
    await this.reloadExpensesData();
  }

  async reloadExpensesData() {
    if (this.isOnline) {
      // Sync any pending offline expenses first
      await this.syncOfflineData();
      
      // Then load from Supabase when online
      try {
        this.expenses = await this.supabaseService.getExpenses();
        // Cache for offline use
        await this.storageService.saveOfflineExpenses(this.expenses);
        console.log(' Loaded from Supabase');
      } catch (error) {
        console.warn('Failed to load from Supabase, using local cache:', error);
        this.expenses = await this.storageService.loadOfflineExpenses();
        console.log(' Loading from offline cache (Supabase error)');
      }
    } else {
      // Load from local storage when offline
      this.expenses = await this.storageService.loadOfflineExpenses();
      console.log(' Loading from offline cache');
    }
    
    this.filteredExpenses = [...this.expenses];
    console.log(' Loaded', this.expenses.length, 'expenses');
  }

  async syncOfflineData() {
    try {
      // Get expenses that were created offline (have timestamp IDs)
      const pendingExpenses = await this.storageService.getPendingOfflineExpenses();
      
      if (pendingExpenses.length > 0) {
        console.log(' Found', pendingExpenses.length, 'offline expenses to sync');
        
        // Upload to Supabase
        const syncedCount = await this.supabaseService.syncOfflineExpenses(pendingExpenses);
        
        if (syncedCount > 0) {
          // Remove synced expenses from local storage
          const syncedIds = pendingExpenses.slice(0, syncedCount).map(e => e.id || '');
          await this.storageService.removeSyncedExpenses(syncedIds);
          
          console.log(' Synced', syncedCount, 'offline expenses to Supabase');
        }
      }
    } catch (error) {
      console.error('Error syncing offline data:', error);
    }
  }

  searchExpenses(event: any) {
    const query = event.target.value.toLowerCase();
    
    if (!query) {
      this.filteredExpenses = [...this.expenses];
      return;
    }

    this.filteredExpenses = this.expenses.filter(expense =>
      expense.title.toLowerCase().includes(query) ||
      expense.category.toLowerCase().includes(query)
    );
  }

  viewExpenseDetail(expense: Expense) {
    this.router.navigate(['/expense-detail', expense.id]);
  }

  addExpense() {
    this.router.navigate(['/add-expense']);
  }

  getCategoryColor(category: string): string {
    const colors: { [key: string]: string } = {
      'Food': 'success',
      'Transport': 'primary',
      'Shopping': 'secondary',
      'Entertainment': 'tertiary',
      'Health': 'danger',
      'Bills': 'warning',
      'Other': 'medium'
    };
    return colors[category] || 'medium';
  }

  goHome() {
    this.router.navigate(['/dashboard']);
  }
}

