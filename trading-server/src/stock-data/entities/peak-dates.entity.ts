import { Entity, Column, PrimaryGeneratedColumn, ManyToOne } from 'typeorm';
import { TrCode } from './tr-code.entity'; // TrCode 엔티티를 임포트

@Entity('peak_dates')
export class PeakDate {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => TrCode, (trCode) => trCode.peakDates)
  trCode: TrCode; // TrCode와의 관계

  @Column({ type: 'date' })
  date: Date; // 날짜
}