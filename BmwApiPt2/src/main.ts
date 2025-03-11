import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app/app.component';
import { provideHttpClient } from "@angular/common/http";
import { provideRouter } from '@angular/router';
import { routes } from './app/app.routes';
import { importProvidersFrom } from '@angular/core';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { provideAuth0 } from '@auth0/auth0-angular';

bootstrapApplication(AppComponent, {
  providers: [
    provideRouter(routes),
    provideHttpClient(),
    importProvidersFrom(BrowserAnimationsModule),
    provideAuth0({
      domain: 'dev-s8107lovdg2h5bbv.eu.auth0.com',
      clientId: '6vNmoQJZjdKV8qLW5UyCku5lORCZlmje',
      authorizationParams: {
        redirect_uri: window.location.origin, // Must match Allowed Callback URL
        scope: 'openid profile email', // Ensure these scopes are allowed
      },
      cacheLocation: 'localstorage', // Persist tokens across page reloads
      useRefreshTokens: true,
    }),
  ]
}).catch((err) =>
  console.error(err)
);
