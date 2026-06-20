import { Routes } from '@angular/router';

import { Dashboard } from './pages/dashboard/dashboard';
import { Home } from './pages/home/home';
import { Login } from './pages/login/login';
import { NotFound } from './pages/not-found/not-found';
import { Register } from './pages/register/register';
import { RequestCreate } from './pages/request-create/request-create';
import { MyRequests } from './pages/my-requests/my-requests';
import { RequestDetails } from './pages/request-details/request-details';
import { RequestTypes } from './pages/request-types/request-types';
import { AllRequests } from './pages/all-requests/all-requests';

import { authGuard } from './guards/auth.guard';
import { guestGuard } from './guards/guest.guard';
import { analystGuard } from './guards/analyst.guard';

export const routes: Routes = [
  {
    path: '',
    component: Home,
    canActivate: [guestGuard]
  },
  {
    path: 'login',
    component: Login,
    canActivate: [guestGuard]
  },
  {
    path: 'register',
    component: Register,
    canActivate: [guestGuard]
  },
  {
    path: 'dashboard',
    component: Dashboard,
    canActivate: [authGuard]
  },
  {
    path: 'requests/new',
    component: RequestCreate,
    canActivate: [authGuard],
  },
  {
    path: 'requests/my',
    component: MyRequests,
    canActivate: [authGuard]
  },
  {
    path: 'requests/:id',
    component: RequestDetails,
    canActivate: [authGuard]
  },
  {
    path: 'request-types',
    component: RequestTypes,
    canActivate: [authGuard]
  },
  {
    path: 'requests',
    component: AllRequests,
    canActivate: [analystGuard]
  },
  {
    path: '**',
    component: NotFound,
  },
];