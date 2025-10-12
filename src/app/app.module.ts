import { NgModule } from '@angular/core';
import { BrowserModule, provideClientHydration, withEventReplay } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { UploadFileComponent } from './shared/components/upload-file/upload-file.component';
import { FilePreviewComponent } from './shared/components/file-preview/file-preview.component';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { DashboardComponent } from './shared/components/dashboard/dashboard.component';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { CommonModule } from '@angular/common';
import { NgApexchartsModule } from 'ng-apexcharts';
import { LoginComponent } from './auth/login/login.component';
import { HomeComponent } from './shared/components/home/home.component';
import { FeaturesComponent } from './shared/components/features/features.component';
import { PricingComponent } from './shared/components/pricing/pricing.component';
import { ContactComponent } from './shared/components/contact/contact.component';
import { LinebreakPipe } from './shared/pipes/linebreak.pipe';
import { SidebarComponent } from './shared/components/sidebar/sidebar.component';

@NgModule({
  declarations: [
    AppComponent,
    UploadFileComponent,
    FilePreviewComponent,
    DashboardComponent,
    LoginComponent,
    HomeComponent,
    FeaturesComponent,
    PricingComponent,
    ContactComponent,
    LinebreakPipe,
    SidebarComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    FormsModule,
    NgbModule,
    CommonModule,
    NgApexchartsModule,
    ReactiveFormsModule
  ],
  providers: [
    provideClientHydration(withEventReplay())
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
