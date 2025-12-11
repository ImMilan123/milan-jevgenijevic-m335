import { Injectable } from '@angular/core';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { environment } from '../../environments/environment';
import { Expense } from '../models/expense.model';

@Injectable({
  providedIn: 'root'
})
export class SupabaseService {
  private supabase: SupabaseClient;
  private isSyncing = false;

  constructor() {
    this.supabase = createClient(
      environment.supabase.url,
      environment.supabase.anonKey
    );
    console.log('Supabase initialized:', environment.supabase.url);
  }

  async syncOfflineExpenses(offlineExpenses: Expense[]): Promise<number> {
    if (offlineExpenses.length === 0) {
      return 0;
    }

    if (this.isSyncing) {
      console.log('Sync already in progress, skipping...');
      return 0;
    }

    this.isSyncing = true;
    let syncedCount = 0;

    try {
      for (const expense of offlineExpenses) {
        const { id, created_at, updated_at, ...expenseData } = expense;
        
        const { data, error } = await this.supabase
          .from('expenses')
          .insert([expenseData])
          .select()
          .single();

        if (!error && data) {
          syncedCount++;
          console.log(' Synced offline expense to Supabase:', data.title);
        } else {
          console.error('Failed to sync expense:', expense.title, error);
        }
      }

      console.log(`Synced ${syncedCount} of ${offlineExpenses.length} offline expenses to Supabase`);
      return syncedCount;
    } catch (error) {
      console.error('Error syncing offline expenses:', error);
      return syncedCount;
    } finally {
      this.isSyncing = false;
    }
  }

  async testConnection(): Promise<{connected: boolean, message: string, hasTable: boolean, rowCount: number}> {
    try {
      // Try to query the expenses table
      const { data, error, count } = await this.supabase
        .from('expenses')
        .select('*', { count: 'exact', head: false });
      
      if (error) {
        console.error('Supabase connection test failed:', error);
        
        if (error.message.includes('relation "public.expenses" does not exist')) {
          return {
            connected: true,
            message: 'Connected to Supabase, but expenses table does not exist. Run the SQL setup!',
            hasTable: false,
            rowCount: 0
          };
        }
        
        return {
          connected: false,
          message: 'Connection failed: ' + error.message,
          hasTable: false,
          rowCount: 0
        };
      }
      
      console.log('Supabase connected! Found', count, 'expenses');
      return {
        connected: true,
        message: `Connected! Found ${count} expense(s) in database`,
        hasTable: true,
        rowCount: count || 0
      };
      
    } catch (error) {
      console.error('Supabase test error:', error);
      return {
        connected: false,
        message: 'Connection error: ' + (error as Error).message,
        hasTable: false,
        rowCount: 0
      };
    }
  }

  async getExpenses(): Promise<Expense[]> {
    try {
      const { data, error } = await this.supabase
        .from('expenses')
        .select('*')
        .order('date', { ascending: false });
      
      if (error) {
        console.error('Error fetching expenses:', error);
        return [];
      }
      
      console.log(' Loaded', data?.length || 0, 'expenses from Supabase');
      return data as Expense[];
    } catch (error) {
      console.error('Error in getExpenses:', error);
      return [];
    }
  }

  async getExpenseById(id: string): Promise<Expense | null> {
    try {
      const { data, error } = await this.supabase
        .from('expenses')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) {
        console.error('Error fetching expense:', error);
        return null;
      }
      
      console.log(' Loaded expense:', data?.title);
      return data as Expense;
    } catch (error) {
      console.error('Error in getExpenseById:', error);
      return null;
    }
  }

  async addExpense(expense: Expense): Promise<Expense | null> {
    try {
      const { data, error } = await this.supabase
        .from('expenses')
        .insert([{
          title: expense.title,
          amount: expense.amount,
          category: expense.category,
          date: expense.date,
          receipt_url: expense.receipt_url
        }])
        .select()
        .single();
      
      if (error) {
        console.error('Error adding expense:', error);
        return null;
      }
      
      console.log(' Added expense to Supabase:', data?.title);
      return data as Expense;
    } catch (error) {
      console.error('Error in addExpense:', error);
      return null;
    }
  }

  async updateExpense(expense: Expense): Promise<Expense | null> {
    try {
      const { data, error } = await this.supabase
        .from('expenses')
        .update({
          title: expense.title,
          amount: expense.amount,
          category: expense.category,
          date: expense.date,
          receipt_url: expense.receipt_url,
          updated_at: new Date().toISOString()
        })
        .eq('id', expense.id)
        .select()
        .single();
      
      if (error) {
        console.error('Error updating expense:', error);
        return null;
      }
      
      console.log(' Updated expense in Supabase:', data?.title);
      return data as Expense;
    } catch (error) {
      console.error('Error in updateExpense:', error);
      return null;
    }
  }

  async deleteExpense(id: string): Promise<boolean> {
    try {
      const { error } = await this.supabase
        .from('expenses')
        .delete()
        .eq('id', id);
      
      if (error) {
        console.error('Error deleting expense:', error);
        return false;
      }
      
      console.log(' Deleted expense from Supabase:', id);
      return true;
    } catch (error) {
      console.error('Error in deleteExpense:', error);
      return false;
    }
  }

  async uploadReceipt(imageData: string, fileName: string): Promise<string | null> {
    try {
      const base64Response = await fetch(imageData);
      const blob = await base64Response.blob();
      
      // Upload to Supabase Storage
      const { data, error } = await this.supabase.storage
        .from('receipts')
        .upload(fileName, blob, {
          contentType: 'image/jpeg',
          upsert: false
        });
      
      if (error) {
        console.error('Error uploading receipt:', error);
        return null;
      }
      
      // Get public URL
      const { data: urlData } = this.supabase.storage
        .from('receipts')
        .getPublicUrl(data.path);
      
      console.log(' Uploaded receipt to Supabase:', fileName);
      return urlData.publicUrl;
    } catch (error) {
      console.error('Error in uploadReceipt:', error);
      return null;
    }
  }
}

