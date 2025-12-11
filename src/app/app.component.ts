import { Component, OnInit } from '@angular/core';
import { IonApp, IonRouterOutlet } from '@ionic/angular/standalone';
import { NetworkService } from './services/network.service';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  standalone: true,
  imports: [IonApp, IonRouterOutlet],
})
export class AppComponent implements OnInit {
  constructor(private networkService: NetworkService) {}

  ngOnInit() {
    // Initialize network monitoring
    this.networkService.listenToNetworkChanges();
    
    // Load saved theme preference
    this.loadThemePreference();
  }

  private async loadThemePreference() {
    // Theme loading will be implemented in settings service
    // Placeholder for theme initialization
  }
}

