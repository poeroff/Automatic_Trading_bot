import { Entity, Column, PrimaryGeneratedColumn, OneToMany } from 'typeorm';

import { PeakDate } from './peak-dates.entity';
import { PeakPrice } from './PeakPrice.entity';
import { FilteredPeak } from './filtered-peaks.entity';
import { UserInflection } from './user-inflection.entity';

@Entity('tr_codes') // 테이블 이름을 'tr_codes'로 설정
export class TrCode {
  @PrimaryGeneratedColumn()
  id: number; // 기본 키

  @Column({ type: 'varchar', length: 10 })
  code: string; // 종목 코드

  @Column({ type: 'varchar', length: 100 })
  name: string; // 종목 이름

  @Column({ type: 'boolean', default: false })
  certified: boolean; // 인증 여부

  @Column({ type: 'int', default: 0 })
  current_inflection_count: number; // 현재 변곡점 수

  @Column({ type: 'int', default: 0 })
  previous_inflection_count: number; // 이전 변곡점 수

  @Column({ type: 'int', default: 0 })
  previous_peak_count: number; // 이전 고점 수

  @Column({ type: 'int', default: 0 })
  current_peak_count: number; // 현재 고점 수

  // @OneToMany(() => StockData, (stockData) => stockData.trCode)
  // stockData: StockData[];
  
  @OneToMany(() => PeakDate, (peakDate) => peakDate.trCode)
  peakDates: PeakDate[];

  @OneToMany(() => PeakPrice, (peakPrice) => peakPrice.trCode)
  peakPrices: PeakPrice[];

  @OneToMany(() => FilteredPeak, (filteredPeak) => filteredPeak.trCode)
  filteredPeaks: FilteredPeak[];

  @OneToMany(() => UserInflection, (userInflection) => userInflection.trCode)
  userInflections: UserInflection[];


}