import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn } from 'typeorm';
import { KoreanStockCode } from './KoreanStockCode.entity';

@Entity('MonthStockData')
export class MonthStockData {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => KoreanStockCode, (code) => code.daystockData, { eager: true , onDelete: 'CASCADE'})
  @JoinColumn({ name: 'stock_id' }) // This is the foreign key
  trCode: KoreanStockCode;

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

//   @Column({default:false})
//   is_high_point : boolean


}