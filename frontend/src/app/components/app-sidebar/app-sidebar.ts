import { Component, EventEmitter, Input, Output } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'app-sidebar',
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './app-sidebar.html',
  styleUrl: './app-sidebar.css',
})
export class AppSidebar {
  @Input() isOpen = false;

  @Output() closeSidebar = new EventEmitter<void>();

  onCloseSidebar(): void {
    this.closeSidebar.emit();
  }
}