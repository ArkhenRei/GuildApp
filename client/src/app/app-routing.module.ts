import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from './Components/home/home.component';
import { MemberListComponent } from './Components/members/member-list/member-list.component';
import { MemberDetailsComponent } from './Components/members/member-details/member-details.component';
import { ListsComponent } from './Components/lists/lists.component';
import { MessagesComponent } from './Components/messages/messages.component';
import { authGuard } from './guards/auth.guard';
import { TestErrorComponent } from './errors/test-error/test-error.component';
import { NotFoundComponent } from './errors/not-found/not-found.component';
import { ServerErrorComponent } from './errors/server-error/server-error.component';
import { MemberEditComponent } from './Components/members/member-edit/member-edit.component';
import { preventUnsavedChangesGuard } from './guards/prevent-unsaved-changes.guard';
import { memberDetailedResolver } from './resolvers/member-detailed.resolver';
import { AdminPanelComponent } from './Components/admin/admin-panel/admin-panel.component';
import { adminGuard } from './guards/admin.guard';

const routes: Routes = [
  { path: '', component: HomeComponent },
  {
    path: '',
    runGuardsAndResolvers: 'always',
    canActivate: [authGuard],
    children: [
      { path: 'members', component: MemberListComponent },
      { path: 'members/:username', component: MemberDetailsComponent, resolve: {member: memberDetailedResolver} },
      { path: 'member/edit', component: MemberEditComponent, canDeactivate: [preventUnsavedChangesGuard] },
      { path: 'lists', component: ListsComponent },
      { path: 'messages', component: MessagesComponent },
      { path: 'admin', component: AdminPanelComponent, canActivate: [adminGuard] },
    ],
  },
  {
    path: 'errors',
    component: TestErrorComponent,
  },
  {
    path: 'not-found',
    component: NotFoundComponent,
  },
  {
    path: 'server-error',
    component: ServerErrorComponent,
  },
  { path: '**', component: NotFoundComponent, pathMatch: 'full' },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
