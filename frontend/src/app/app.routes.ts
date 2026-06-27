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
import { AdminUsers } from './pages/admin-users/admin-users';
import { AdminRoleHistory } from './pages/admin-role-history/admin-role-history';

import { workspaceGuard } from './guards/workspace.guard';
import { guestGuard } from './guards/guest.guard';
import { adminGuard } from './guards/admin.guard';
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
    canActivate: [workspaceGuard]
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
    canActivate: [workspaceGuard]
  },
  {
    path: 'request-types',
    component: RequestTypes,
    canActivate: [workspaceGuard]
  },
  {
    path: 'requests',
    component: AllRequests,
    canActivate: [analystGuard]
  },
  {
    path: 'history',
    component: RequestHistory,
    canActivate: [workspaceGuard]
  },
  {
    path: 'admin/users',
    component: AdminUsers,
    canActivate: [adminGuard]
  },
  {
    path: 'admin/role-history',
    component: AdminRoleHistory,
    canActivate: [adminGuard]
  },
  {
    path: '**',
    component: NotFound,
  },
];