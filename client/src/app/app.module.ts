import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NavComponent } from './Components/nav/nav.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HomeComponent } from './Components/home/home.component';
import { RegisterComponent } from './Components/register/register.component';
import { MemberListComponent } from './Components/members/member-list/member-list.component';
import { MemberDetailsComponent } from './Components/members/member-details/member-details.component';
import { ListsComponent } from './Components/lists/lists.component';
import { MessagesComponent } from './Components/messages/messages.component';
import { SharedModule } from './modules/shared.module';
import { TestErrorComponent } from './errors/test-error/test-error.component';
import { ErrorInterceptor } from './interceptors/error.interceptor';
import { NotFoundComponent } from './errors/not-found/not-found.component';
import { ServerErrorComponent } from './errors/server-error/server-error.component';
import { MemberCardComponent } from "./Components/member-card/member-card.component";
import { JwtInterceptor } from './interceptors/jwt.interceptor';
import { RouteReuseStrategy, RouterModule } from '@angular/router';
import { MemberEditComponent } from './Components/members/member-edit/member-edit.component';
import { LoadingInterceptor } from './interceptors/loading.interceptor';
import { PhotoEditorComponent } from './Components/members/photo-editor/photo-editor.component';
import { TextInputComponent } from './Components/forms/text-input/text-input.component';
import { DatePickerComponent } from './Components/forms/date-picker/date-picker.component';
import { AdminPanelComponent } from './Components/admin/admin-panel/admin-panel.component';
import { HasRoleDirective } from './directives/has-role.directive';
import { UserManagementComponent } from './Components/admin/user-management/user-management.component';
import { PhotoManagementComponent } from './Components/admin/photo-management/photo-management.component';
import { RolesModalComponent } from './modals/roles-modal/roles-modal.component';
import { CustomRouteReuseStrategy } from './Services/customRouteReuseStrategy';
import { ConfirmDialogComponent } from './modals/confirm-dialog/confirm-dialog.component';
@NgModule({
    declarations: [
        AppComponent,
        NavComponent,
        HomeComponent,
        RegisterComponent,
        MemberListComponent,
        ListsComponent,
        MessagesComponent,
        TestErrorComponent,
        NotFoundComponent,
        ServerErrorComponent,
        MemberEditComponent,
        PhotoEditorComponent,
        TextInputComponent,
        DatePickerComponent,
        AdminPanelComponent,
        HasRoleDirective,
        UserManagementComponent,
        PhotoManagementComponent,
        RolesModalComponent,
        ConfirmDialogComponent,
    ],
    providers: [
        {
            provide: HTTP_INTERCEPTORS,
            useClass: ErrorInterceptor,
            multi: true,
        },
        {
            provide: HTTP_INTERCEPTORS,
            useClass: JwtInterceptor,
            multi: true,
        },
        {
            provide: HTTP_INTERCEPTORS,
            useClass: LoadingInterceptor,
            multi: true,
        },
        {
            provide: RouteReuseStrategy,
            useClass: CustomRouteReuseStrategy
        }
    ],
    bootstrap: [AppComponent],
    imports: [
        BrowserModule,
        AppRoutingModule,
        HttpClientModule,
        BrowserAnimationsModule,
        FormsModule,
        SharedModule,
        ReactiveFormsModule,
        MemberCardComponent,
    ]
})
export class AppModule {}
