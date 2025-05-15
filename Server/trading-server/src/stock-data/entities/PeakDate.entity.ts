import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn } from 'typeorm';

import { KoreanStockCode } from './KoreanStockCode.entity';

@Entity('peak_dates')
export class PeakDate {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => KoreanStockCode, (KoreanStockCode) => KoreanStockCode.peakDates, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'stock_id' }) // This is the foreign key
  trCode: KoreanStockCode; // TrCode와의 관계

  @Column({type:"float"})
  price : number

  @Column({ type: 'date' })
  date: Date; // 날짜
}