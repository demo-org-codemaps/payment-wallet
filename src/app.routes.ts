import { Routes } from '@nestjs/core';
import { HealthModule } from './health/health.module';
import { WalletModule } from './wallet';

export const appRoutes: Routes = [
  {
    path: 'wallet',
    module: WalletModule,
  },
  {
    path: 'health',
    module: HealthModule,
  },
];
