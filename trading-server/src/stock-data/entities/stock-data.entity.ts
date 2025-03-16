import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn } from 'typeorm';
import { TrCode } from './tr-code.entity';
import { Kospi } from './Kospi.entity';

@Entity('stock_data')
export class StockData {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Kospi, (trCode) => trCode.stockData, { eager: true , onDelete: 'CASCADE'})
  @JoinColumn({ name: 'code_id' }) // This is the foreign key
  trCode: TrCode;

  @Column({ type: 'date' })
  date: string;

  @Column({ type: 'float' })
  open: number;

  @Column({ type: 'float' })
  high: number;

  @Column({ type: 'float' })
  low: number;

  @Column({ type: 'float' })
  close: number;

  @Column({ type: 'bigint' })
  volume: number;


}