import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn } from 'typeorm';
import { TrCode } from './tr-code.entity';

@Entity('stock_data')
export class StockData {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => TrCode, (trCode) => trCode.stockData, { eager: true })
  @JoinColumn({ name: 'tr_code_id' }) // This is the foreign key
  trCode: TrCode;

  @Column({ type: 'date' })
  date: Date;

  @Column({ type: 'float' })
  open: number;

  @Column({ type: 'float' })
  high: number;

  @Column({ type: 'float' })
  low: number;

  @Column({ type: 'float' })
  close: number;

  @Column({ type: 'int' })
  volume: number;
}