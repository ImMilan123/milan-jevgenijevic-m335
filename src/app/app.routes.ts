import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'dashboard',
    pathMatch: 'full',
  },
  {
    path: 'dashboard',
    loadComponent: () => import('./pages/dashboard/dashboard.page').then(m => m.DashboardPage)
  },
  {
    path: 'expenses',
    loadComponent: () => import('./pages/expenses/expenses.page').then(m => m.ExpensesPage)
  },
  {
    path: 'expense-detail/:id',
    loadComponent: () => import('./pages/expense-detail/expense-detail.page').then(m => m.ExpenseDetailPage)
  },
  {
    path: 'add-expense',
    loadComponent: () => import('./pages/add-expense/add-expense.page').then(m => m.AddExpensePage)
  },
  {
    path: 'edit-expense/:id',
    loadComponent: () => import('./pages/add-expense/add-expense.page').then(m => m.AddExpensePage)
  },
  {
    path: 'settings',
    loadComponent: () => import('./pages/settings/settings.page').then(m => m.SettingsPage)
  },
  {
    path: '**',
    redirectTo: 'dashboard',
    pathMatch: 'full'
  }
];

