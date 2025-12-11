import { Injectable } from '@angular/core';
import { Preferences } from '@capacitor/preferences';
import { Expense } from '../models/expense.model';

@Injectable({
  providedIn: 'root'
})
export class StorageService {
  private readonly OFFLINE_EXPENSES_KEY = 'offline_expenses';
  private readonly THEME_KEY = 'theme_preference';

  constructor() { }

  async saveOfflineExpenses(expenses: Expense[]): Promise<void> {
    try {
      await Preferences.set({
        key: this.OFFLINE_EXPENSES_KEY,
        value: JSON.stringify(expenses)
      });
      console.log('Saved', expenses.length, 'expenses to local storage');
    } catch (error) {
      console.error('Error saving expenses:', error);
    }
  }

  async loadOfflineExpenses(): Promise<Expense[]> {
    try {
      const { value } = await Preferences.get({ key: this.OFFLINE_EXPENSES_KEY });
      if (value) {
        const expenses = JSON.parse(value);
        console.log('Loaded', expenses.length, 'expenses from local storage');
        return expenses;
      }
    } catch (error) {
      console.error('Error loading expenses:', error);
    }
    return [];
  }

  async clearOfflineExpenses(): Promise<void> {
    try {
      await Preferences.remove({ key: this.OFFLINE_EXPENSES_KEY });
      console.log('Cleared offline expenses');
    } catch (error) {
      console.error('Error clearing expenses:', error);
    }
  }

  async saveThemePreference(isDark: boolean): Promise<void> {
    try {
      await Preferences.set({
        key: this.THEME_KEY,
        value: isDark ? 'dark' : 'light'
      });
      console.log('Saved theme preference:', isDark ? 'dark' : 'light');
    } catch (error) {
      console.error('Error saving theme:', error);
    }
  }

  async loadThemePreference(): Promise<boolean> {
    try {
      const { value } = await Preferences.get({ key: this.THEME_KEY });
      return value === 'dark';
    } catch (error) {
      console.error('Error loading theme:', error);
      return false;
    }
  }

  async getPendingOfflineExpenses(): Promise<Expense[]> {
    const allExpenses = await this.loadOfflineExpenses();
    return allExpenses.filter(exp => {
      return exp.id && /^\d+$/.test(exp.id);
    });
  }

  async removeSyncedExpenses(syncedIds: string[]): Promise<void> {
    const expenses = await this.loadOfflineExpenses();
    const remaining = expenses.filter(exp => !syncedIds.includes(exp.id || ''));
    await this.saveOfflineExpenses(remaining);
    console.log('Removed', syncedIds.length, 'synced expenses from offline storage');
  }
}

