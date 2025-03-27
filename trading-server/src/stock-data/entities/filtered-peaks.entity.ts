import { Entity, Column, PrimaryGeneratedColumn, ManyToOne } from 'typeorm';

import { KoreanStockCode } from './KoreanStockCode.entity';

@Entity('filtered_peaks')
export class FilteredPeak {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => KoreanStockCode, (KoreanStockCode) => KoreanStockCode.filteredPeaks, { onDelete: 'CASCADE' })
  trCode: KoreanStockCode; // TrCode와의 관계

  @Column({type:"float"})
  price : number

  @Column({ type: 'date' })
  date: Date; // 날짜
}