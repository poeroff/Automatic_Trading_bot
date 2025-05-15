import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn } from 'typeorm';

import { KoreanStockCode } from './KoreanStockCode.entity';

@Entity('peak_prices')
export class PeakPrice {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => KoreanStockCode, (KoreanStockCode) => KoreanStockCode.peakPrices, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'stock_id' }) // This is the foreign key
  trCode: KoreanStockCode; // TrCode와의 관계

  @Column({ type: 'float' })
  price: number; // 가격
}