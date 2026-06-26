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
import { RequestHistory } from './pages/request-history/request-history';

import { authGuard } from './guards/auth.guard';
import { guestGuard } from './guards/guest.guard';
import { analystGuard } from './guards/analyst.guard';
import { requesterGuard } from './guards/requester.guard';

export const routes: Routes = [
  {
    path: '',
    component: Home
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
    canActivate: [requesterGuard],
  },
  {
    path: 'requests/my',
    component: MyRequests,
    canActivate: [requesterGuard]
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
    path: 'history',
    component: RequestHistory,
    canActivate: [authGuard]
  },
  {
    path: '**',
    component: NotFound,
  },
];