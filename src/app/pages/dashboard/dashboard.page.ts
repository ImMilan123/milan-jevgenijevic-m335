import { Component, OnInit, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
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
  IonIcon,
  IonGrid,
  IonRow,
  IonCol,
  IonFab,
  IonFabButton
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { add, wallet, list, settings, trendingUp } from 'ionicons/icons';
import { Chart, registerables } from 'chart.js';
import { SupabaseService } from '../../services/supabase.service';
import { NetworkService } from '../../services/network.service';
import { StorageService } from '../../services/storage.service';
import { Expense, ExpenseCategory } from '../../models/expense.model';

// Register Chart.js components
Chart.register(...registerables);

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.page.html',
  styleUrls: ['./dashboard.page.scss'],
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
    IonIcon,
    IonGrid,
    IonRow,
    IonCol,
    IonFab,
    IonFabButton
  ],
})
export class DashboardPage implements OnInit, AfterViewInit {
  @ViewChild('pieChart', { static: false }) pieChartCanvas!: ElementRef<HTMLCanvasElement>;
  
  totalExpenses = 0;
  expenseCount = 0;
  isOnline = true;
  chart: Chart | null = null;
  hasData = false;

  // Category colors
  categoryColors: { [key: string]: string } = {
    'Food': '#10b981',        // Green
    'Transport': '#3b82f6',   // Blue
    'Shopping': '#f59e0b',    // Amber
    'Entertainment': '#8b5cf6', // Purple
    'Health': '#ef4444',      // Red
    'Bills': '#6366f1',       // Indigo
    'Other': '#6b7280'        // Gray
  };

  constructor(
    private router: Router,
    private supabaseService: SupabaseService,
    private networkService: NetworkService,
    private storageService: StorageService
  ) {
    addIcons({ add, wallet, list, settings, trendingUp });
  }

  ngOnInit() {
    this.checkNetworkStatus();
  }

  ngAfterViewInit() {
    // Load data after view is initialized
    setTimeout(() => {
      this.loadDashboardData();
    }, 100);
  }

  ionViewWillEnter() {
    // Refresh data when returning to dashboard
    this.loadDashboardData();
  }

  async loadDashboardData() {
    let expenses: Expense[] = [];
    const isOnline = await this.networkService.getNetworkStatus();
    
    if (isOnline) {
      // Try to load from Supabase
      try {
        const supabaseExpenses = await this.supabaseService.getExpenses();
        expenses = supabaseExpenses;
        // Cache for offline use
        await this.storageService.saveOfflineExpenses(expenses);
        console.log('Dashboard: Loaded from Supabase');
      } catch (error) {
        console.warn('Supabase load failed, using local storage:', error);
        expenses = await this.storageService.loadOfflineExpenses();
      }
    } else {
      // Load from local storage when offline
      expenses = await this.storageService.loadOfflineExpenses();
      console.log('Dashboard: Loaded from local storage (offline)');
    }
    
    this.expenseCount = expenses.length;
    this.totalExpenses = expenses.reduce((sum, exp) => sum + Number(exp.amount), 0);
    this.hasData = expenses.length > 0;
    
    console.log('Dashboard:', this.expenseCount, 'expenses, CHF', this.totalExpenses.toFixed(2));

    // Create or update pie chart
    if (this.hasData) {
      this.createPieChart(expenses);
    } else {
      // Destroy chart if no data
      if (this.chart) {
        this.chart.destroy();
        this.chart = null;
      }
    }
  }

  createPieChart(expenses: Expense[]) {
    // Calculate category totals
    const categoryTotals: { [key: string]: number } = {};
    expenses.forEach(expense => {
      const category = expense.category;
      categoryTotals[category] = (categoryTotals[category] || 0) + Number(expense.amount);
    });

    // Prepare data for chart
    const labels = Object.keys(categoryTotals);
    const data = Object.values(categoryTotals);
    const colors = labels.map(label => this.categoryColors[label] || '#6b7280');

    // Destroy existing chart if any
    if (this.chart) {
      this.chart.destroy();
    }

    // Create new chart
    if (this.pieChartCanvas && this.pieChartCanvas.nativeElement) {
      const ctx = this.pieChartCanvas.nativeElement.getContext('2d');
      if (ctx) {
        this.chart = new Chart(ctx, {
          type: 'pie',
          data: {
            labels: labels,
            datasets: [{
              data: data,
              backgroundColor: colors,
              borderWidth: 2,
              borderColor: '#ffffff'
            }]
          },
          options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
              legend: {
                position: 'bottom',
                labels: {
                  padding: 15,
                  font: {
                    size: 12
                  },
                  color: this.getLegendTextColor(),
                  generateLabels: (chart) => {
                    const data = chart.data;
                    if (data.labels && data.datasets.length) {
                      return data.labels.map((label, i) => {
                        const value = data.datasets[0].data[i] as number;
                        return {
                          text: `${label}: CHF ${value.toFixed(2)}`,
                          fillStyle: colors[i],
                          hidden: false,
                          index: i
                        };
                      });
                    }
                    return [];
                  }
                }
              },
              tooltip: {
                callbacks: {
                  label: (context) => {
                    const label = context.label || '';
                    const value = context.parsed || 0;
                    const total = context.dataset.data.reduce((a: number, b: any) => a + Number(b), 0);
                    const percentage = ((value / total) * 100).toFixed(1);
                    return `${label}: CHF ${value.toFixed(2)} (${percentage}%)`;
                  }
                }
              }
            }
          }
        });
      }
    }
  }

  async checkNetworkStatus() {
    // Get initial status
    this.isOnline = await this.networkService.getNetworkStatus();
    
    // Subscribe to changes
    this.networkService.getNetworkStatusObservable().subscribe(status => {
      this.isOnline = status;
      console.log('Dashboard: Network is now', this.isOnline ? 'online' : 'offline');
    });
  }

  navigateToExpenses() {
    this.router.navigate(['/expenses']);
  }

  navigateToAddExpense() {
    this.router.navigate(['/add-expense']);
  }

  navigateToSettings() {
    this.router.navigate(['/settings']);
  }

  getLegendTextColor(): string {
    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    return isDark ? '#ffffff' : '#000000';
  }
}
