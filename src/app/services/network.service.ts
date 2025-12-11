import { Injectable } from '@angular/core';
import { Network } from '@capacitor/network';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class NetworkService {
  private isOnline$ = new BehaviorSubject<boolean>(true);

  constructor() { }

  async getNetworkStatus(): Promise<boolean> {
    try {
      const status = await Network.getStatus();
      console.log('Network status:', status.connected ? 'Online' : 'Offline');
      this.isOnline$.next(status.connected);
      return status.connected;
    } catch (error) {
      console.error('Error checking network status:', error);
      return true;
    }
  }

  listenToNetworkChanges(): void {
    Network.addListener('networkStatusChange', status => {
      console.log('Network status changed:', status.connected ? 'Online' : 'Offline');
      this.isOnline$.next(status.connected);
    });
    
    this.getNetworkStatus();
    console.log('Network listener initialized');
  }

  getNetworkStatusObservable(): Observable<boolean> {
    return this.isOnline$.asObservable();
  }

  isOnline(): boolean {
    return this.isOnline$.value;
  }
}

