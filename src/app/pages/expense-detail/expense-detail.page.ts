import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
  IonButton,
  IonButtons,
  IonBackButton,
  IonIcon,
  IonItem,
  IonLabel,
  AlertController
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { create, trash, calendar, pricetag, receipt } from 'ionicons/icons';
import { SupabaseService } from '../../services/supabase.service';
import { StorageService } from '../../services/storage.service';
import { Expense } from '../../models/expense.model';

@Component({
  selector: 'app-expense-detail',
  templateUrl: './expense-detail.page.html',
  styleUrls: ['./expense-detail.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonCard,
    IonCardHeader,
    IonCardTitle,
    IonCardContent,
    IonButton,
    IonButtons,
    IonBackButton,
    IonIcon,
    IonItem,
    IonLabel
  ],
})
export class ExpenseDetailPage implements OnInit {
  expense: Expense | null = null;
  expenseId: string = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private supabaseService: SupabaseService,
    private storageService: StorageService,
    private alertController: AlertController
  ) {
    addIcons({ create, trash, calendar, pricetag, receipt });
  }

  ngOnInit() {
    this.expenseId = this.route.snapshot.paramMap.get('id') || '';
    this.loadExpense();
  }

  async loadExpense() {
    // Try loading from Supabase first
    try {
      this.expense = await this.supabaseService.getExpenseById(this.expenseId);
      
      if (this.expense) {
        console.log(' Loaded expense from Supabase');
        return;
      }
    } catch (error) {
      console.warn('Could not load from Supabase, trying local storage:', error);
    }
    
    // Fallback to local storage
    const expenses = await this.storageService.loadOfflineExpenses();
    this.expense = expenses.find(e => e.id === this.expenseId) || null;
    
    if (this.expense) {
      console.log(' Loaded expense from local storage');
    } else {
      console.error('Expense not found:', this.expenseId);
      window.alert('Expense not found');
      this.router.navigate(['/expenses']);
    }
  }

  editExpense() {
    this.router.navigate(['/edit-expense', this.expenseId]);
  }

  async deleteExpense() {
    const alert = await this.alertController.create({
      header: 'Delete Expense',
      message: 'Are you sure you want to delete this expense?',
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel'
        },
        {
          text: 'Delete',
          role: 'destructive',
          handler: async () => {
            try {
              // Try to delete from Supabase
              const supabaseSuccess = await this.supabaseService.deleteExpense(this.expenseId);
              
              if (supabaseSuccess) {
                console.log(' Deleted from Supabase');
              }
            } catch (error) {
              console.warn('Could not delete from Supabase (might be local-only):', error);
            }
            
            // Always delete from local storage too
            const expenses = await this.storageService.loadOfflineExpenses();
            const filtered = expenses.filter(e => e.id !== this.expenseId);
            await this.storageService.saveOfflineExpenses(filtered);
            
            console.log(' Expense deleted:', this.expenseId);
            this.router.navigate(['/expenses']);
          }
        }
      ]
    });

    await alert.present();
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

