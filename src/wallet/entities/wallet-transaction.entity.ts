import { Expose } from 'class-transformer';
import { BaseEntity } from '../../core';
import { Column, Entity } from 'typeorm';
import { TransactionTypeEnum, WalletImpact } from '../../shared';
import { CurrencyCodeEnum } from '../../shared';

@Entity()
export class WalletTransactionEntity extends BaseEntity {
  @Expose()
  @Column({
    nullable: false,
    name: 'retailer_id',
  })
  retailerId: string;

  @Expose()
  @Column({
    nullable: false,
    type: 'bigint',
  })
  amount: number;

  @Expose()
  @Column({
    nullable: false,
    name: 'currency',
    default: CurrencyCodeEnum.PKR,
  })
  currency: CurrencyCodeEnum;

  @Expose()
  @Column({
    nullable: false,
    unique: true,
    name: 'idempotency_key',
  })
  idempotencyKey: string;

  @Expose()
  @Column({
    nullable: false,
    name: 'transaction_type',
    default: TransactionTypeEnum.ORDER_PAYMENT,
  })
  transactionType: TransactionTypeEnum;

  @Expose()
  @Column({
    type: 'text',
    default: null,
  })
  comments: string;

  @Expose()
  @Column({
    nullable: false,
    type: 'enum',
    enum: WalletImpact,
  })
  impact: WalletImpact;

  // @Expose()
  // @Column({
  //   nullable: true,
  //   type: 'datetime',
  //   name: 'expiry_date',
  // })
  // expiry_date: string;

  // @Expose()
  // @Column({
  //   nullable: false,
  //   unique: true,
  // })
  // subTransactionId: string;

  // @Expose()
  // @Column({
  //   nullable: false,
  //   type: 'enum',
  //   enum: WalletBucketEnum,
  // })
  // bucket: WalletBucketEnum;
}
