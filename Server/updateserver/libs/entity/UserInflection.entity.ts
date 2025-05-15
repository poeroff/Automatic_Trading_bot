import { Entity, Column, PrimaryGeneratedColumn, ManyToOne } from 'typeorm';

import { KoreanStockCode } from './KoreanStockCode.entity';

@Entity('user_inflection')
export class UserInflection {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => KoreanStockCode, (KoreanStockCode) => KoreanStockCode.userInflections, { onDelete: 'CASCADE' })
  trCode: KoreanStockCode; // TrCode와의 관계

  @Column({ type: 'bigint' , nullable : true}) // 'bigint'로 변경
  highdate: number | null; 

  @Column({ type: 'bigint' }) // 'bigint'로 변경
  date: number; 

  @Column({ type: 'bigint' }) // 'bigint'로 변경
  price: number; 
}