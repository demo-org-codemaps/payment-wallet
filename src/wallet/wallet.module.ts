import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '../auth';
import { WalletService } from '.';
import { WalletController } from './controllers/wallet.controller';
import { WalletTransactionRepository } from './repositories';
import { DbWrapperService } from './services';
import { ApiWrapperService } from './services/api-wrapper.service';

@Module({
  imports: [TypeOrmModule.forFeature([WalletTransactionRepository]), HttpModule, AuthModule],
  controllers: [WalletController],
  providers: [WalletService, DbWrapperService, ApiWrapperService],
  exports: [WalletService],
})
export class WalletModule {}
