import { Entity, Column, PrimaryGeneratedColumn, ManyToOne } from 'typeorm';
import { TrCode } from './tr-code.entity'; // TrCode 엔티티를 임포트

@Entity('peak_prices')
export class PeakPrice {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => TrCode, (trCode) => trCode.peakPrices)
  trCode: TrCode; // TrCode와의 관계

  @Column({ type: 'float' })
  price: number; // 가격
}