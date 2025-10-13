import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DashboardComponent } from './shared/components/dashboard/dashboard.component';
import { FilePreviewComponent } from './shared/components/file-preview/file-preview.component';
import { UploadFileComponent } from './shared/components/upload-file/upload-file.component';
import { DashboardGuard } from './shared/guards/dashboard.guard';
import { LoginComponent } from './auth/login/login.component';
import { HomeComponent } from './shared/components/home/home.component';
import { FeaturesComponent } from './shared/components/features/features.component';
import { PricingComponent } from './shared/components/pricing/pricing.component';
import { ContactComponent } from './shared/components/contact/contact.component';

const routes: Routes = [
  { path: '', redirectTo: 'home', pathMatch: 'full'},
  { path: 'upload-file', component: UploadFileComponent},
  { path: 'file-preview', component: FilePreviewComponent},
  { 
    path: 'dashboard-:uuid', 
    component: DashboardComponent,
    canActivate: [DashboardGuard]
  },
  { 
    path: 'dashboard', 
    component: DashboardComponent,
    canActivate: [DashboardGuard]
  },
  { path: 'login', component: LoginComponent},
  { path: 'home', component: HomeComponent},
  { path: 'features', component: FeaturesComponent},
  { path: 'pricing', component: PricingComponent},
  { path: 'contact', component: ContactComponent},
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
