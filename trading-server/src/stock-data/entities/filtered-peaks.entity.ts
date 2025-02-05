import { Entity, Column, PrimaryGeneratedColumn, ManyToOne } from 'typeorm';
import { TrCode } from './tr-code.entity'; // TrCode 엔티티를 임포트

@Entity('filtered_peaks')
export class FilteredPeak {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => TrCode, (trCode) => trCode.filteredPeaks, { onDelete: 'CASCADE' })
  trCode: TrCode; // TrCode와의 관계

  @Column({ type: 'date' })
  date: Date; // 날짜
}