import { NgModule } from '@angular/core';
import { ServerModule } from '@angular/platform-server';
import { provideServerRendering } from '@angular/platform-server';
import { provideServerRouting } from '@angular/ssr';
import { AppComponent } from './app.component';
import { AppModule } from './app.module';
import { serverRoutes } from './app.routes.server';

@NgModule({
  imports: [AppModule,],
  providers: [
    provideServerRouting(serverRoutes),
    provideServerRendering()
  ],
  bootstrap: [AppComponent]
})
export class AppServerModule {}
