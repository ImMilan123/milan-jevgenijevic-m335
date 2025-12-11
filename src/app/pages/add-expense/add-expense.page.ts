import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonList,
  IonItem,
  IonLabel,
  IonInput,
  IonSelect,
  IonSelectOption,
  IonButton,
  IonButtons,
  IonBackButton,
  IonIcon,
  IonCard,
  IonCardContent,
  IonDatetime,
  IonModal
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { camera, save, images } from 'ionicons/icons';
import { SupabaseService } from '../../services/supabase.service';
import { CameraService } from '../../services/camera.service';
import { StorageService } from '../../services/storage.service';
import { Expense, EXPENSE_CATEGORIES, ExpenseCategory } from '../../models/expense.model';

@Component({
  selector: 'app-add-expense',
  templateUrl: './add-expense.page.html',
  styleUrls: ['./add-expense.page.scss'],
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
    IonInput,
    IonSelect,
    IonSelectOption,
    IonButton,
    IonButtons,
    IonBackButton,
    IonIcon,
    IonCard,
    IonCardContent,
    IonDatetime,
    IonModal
  ],
})
export class AddExpensePage implements OnInit {
  @ViewChild('dateModal') dateModal!: IonModal;
  
  isEditMode = false;
  expenseId: string = '';
  maxDate: string = '';
  
  expense: Expense = {
    title: '',
    amount: 0,
    category: 'Other',
    date: '',
    receipt_url: ''
  };

  categories = EXPENSE_CATEGORIES;
  receiptPhotoData: string | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private supabaseService: SupabaseService,
    private cameraService: CameraService,
    private storageService: StorageService
  ) {
    addIcons({ camera, save, images });
    // Initialize dates in constructor to ensure fresh values
    const today = new Date().toISOString();
    this.maxDate = today;
    this.expense.date = today;
  }

  ngOnInit() {
    this.expenseId = this.route.snapshot.paramMap.get('id') || '';
    this.isEditMode = !!this.expenseId;

    if (this.isEditMode) {
      this.loadExpense();
    } else {
      // Ensure date is set to today when creating new expense
      this.expense.date = new Date().toISOString();
      this.maxDate = new Date().toISOString();
    }
  }

  async loadExpense() {
    // Try loading from Supabase first
    let expense = await this.supabaseService.getExpenseById(this.expenseId);
    
    // Fallback to local storage if not found in Supabase
    if (!expense) {
      const expenses = await this.storageService.loadOfflineExpenses();
      expense = expenses.find(e => e.id === this.expenseId) || null;
      console.log(' Loaded expense from local storage for edit');
    } else {
      console.log(' Loaded expense from Supabase for edit');
    }
    
    if (expense) {
      this.expense = { ...expense };
      // Don't load receipt image for editing (keep existing URL)
    } else {
      console.error('Expense not found:', this.expenseId);
      window.alert('Expense not found');
      this.router.navigate(['/expenses']);
    }
  }

  async takePhoto() {
    const photoData = await this.cameraService.takeReceiptPhoto();
    if (photoData) {
      this.receiptPhotoData = photoData;
    }
  }

  async pickFromGallery() {
    const photoData = await this.cameraService.pickImageFromGallery();
    if (photoData) {
      this.receiptPhotoData = photoData;
    }
  }

  async saveExpense() {
    // Validate form
    if (!this.expense.title || !this.expense.title.trim()) {
      window.alert('Please enter a title for the expense');
      return;
    }
    
    if (!this.expense.amount || this.expense.amount <= 0 || isNaN(this.expense.amount)) {
      window.alert('Please enter a valid amount greater than 0');
      return;
    }

    try {
      let savedToSupabase = false;

      // Try to save to Supabase first
      try {
        // Upload receipt photo if a new one was taken/selected
        if (this.receiptPhotoData) {
          const fileName = `receipt_${Date.now()}.jpg`;
          const receiptUrl = await this.supabaseService.uploadReceipt(this.receiptPhotoData, fileName);
          if (receiptUrl) {
            this.expense.receipt_url = receiptUrl;
            console.log(' Receipt uploaded to Supabase Storage:', receiptUrl);
          } else {
            // Save as base64 if upload fails
            this.expense.receipt_url = this.receiptPhotoData;
            console.log(' Using base64 for receipt (upload failed)');
          }
        }

        if (this.isEditMode) {
          // Update existing expense in Supabase
          const result = await this.supabaseService.updateExpense(this.expense);
          if (result) {
            console.log(' Expense updated in Supabase');
            savedToSupabase = true;
          }
        } else {
          // Add new expense to Supabase
          const result = await this.supabaseService.addExpense(this.expense);
          if (result) {
            console.log(' Expense added to Supabase');
            savedToSupabase = true;
            this.expense = result; // Get the ID from Supabase
          }
        }
      } catch (supabaseError) {
        console.warn('Supabase save failed, falling back to local storage:', supabaseError);
        savedToSupabase = false;
      }

      // Fallback to local storage if Supabase fails OR always cache locally
      const expenses = await this.storageService.loadOfflineExpenses();
      
      if (!savedToSupabase) {
        // Supabase failed, save to local storage instead
        if (this.isEditMode) {
          const index = expenses.findIndex(e => e.id === this.expense.id);
          if (index !== -1) {
            // Update with receipt photo if new one was taken
            if (this.receiptPhotoData) {
              this.expense.receipt_url = this.receiptPhotoData;
            }
            expenses[index] = { ...this.expense, updated_at: new Date().toISOString() };
          }
        } else {
          const newExpense: Expense = {
            ...this.expense,
            id: Date.now().toString(),
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          };
          if (this.receiptPhotoData) {
            newExpense.receipt_url = this.receiptPhotoData;
          }
          expenses.push(newExpense);
        }
        await this.storageService.saveOfflineExpenses(expenses);
        console.log(' Expense saved locally (offline mode)');
      } else {
        // Also update local cache with Supabase data
        const supabaseExpenses = await this.supabaseService.getExpenses();
        await this.storageService.saveOfflineExpenses(supabaseExpenses);
      }

      // Navigate back
      this.router.navigate(['/expenses']);
    } catch (error) {
      console.error('Error saving expense:', error);
      window.alert('Failed to save expense. Error: ' + (error as Error).message);
    }
  }

  validateAmount(event: any) {
    const value = event.target.value;
    // Remove any non-numeric characters except decimal point
    const cleaned = value.replace(/[^0-9.]/g, '');
    // Ensure only one decimal point
    const parts = cleaned.split('.');
    if (parts.length > 2) {
      event.target.value = parts[0] + '.' + parts.slice(1).join('');
    } else {
      event.target.value = cleaned;
    }
    this.expense.amount = parseFloat(event.target.value) || 0;
  }

  cancel() {
    this.router.navigate(['/expenses']);
  }

  goHome() {
    this.router.navigate(['/dashboard']);
  }

  async openDatePicker() {
    await this.dateModal.present();
  }

  async closeDatePicker() {
    await this.dateModal.dismiss();
  }
}

