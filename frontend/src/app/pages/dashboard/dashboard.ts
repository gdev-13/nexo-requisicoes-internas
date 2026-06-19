import { Component } from '@angular/core';

import { AppSidebar } from '../../components/app-sidebar/app-sidebar';

@Component({
  selector: 'app-dashboard',
  imports: [AppSidebar],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
})
export class Dashboard {
  isSidebarOpen = false;

  openSidebar(): void {
    this.isSidebarOpen = true;
  }

  closeSidebar(): void {
    this.isSidebarOpen = false;
  }
}