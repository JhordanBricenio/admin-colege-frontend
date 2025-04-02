import { ApplicationConfig } from '@angular/core';
import { provideRouter, withNavigationErrorHandler } from '@angular/router';

import { routes } from './app.routes';
import { provideClientHydration } from '@angular/platform-browser';
import { provideHttpClient } from '@angular/common/http';

export const appConfig: ApplicationConfig = {
  providers: [
    provideHttpClient(),
    provideRouter(routes, withNavigationErrorHandler((error) => {
      console.error('Error de navegación:', error);
    })),
    provideClientHydration()
  ]
};
