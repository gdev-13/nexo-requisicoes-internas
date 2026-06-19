import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

import { AppLayout } from '../../components/app-layout/app-layout';

@Component({
  selector: 'app-dashboard',
  imports: [AppLayout, RouterLink],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
})
export class Dashboard {}