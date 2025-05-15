import { Entity, Column, PrimaryGeneratedColumn,  BeforeInsert, ManyToOne, JoinColumn } from 'typeorm';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import { KoreanStockCode } from './KoreanStockCode.entity';

dayjs.extend(utc);
dayjs.extend(timezone);
@Entity('Alert')
export class Alert {
  @PrimaryGeneratedColumn()
  id: number;


  @Column()
  price : number 

  @Column()
  createdAt: Date;


  @ManyToOne(() => KoreanStockCode, (KoreanStockCode) => KoreanStockCode.peakDates, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'stock_id' }) // This is the foreign key
  trCode: KoreanStockCode; // TrCode와의 관계

  // @Column({default:false})
  // is_high_point : boolean
  @BeforeInsert()
  setCreatedAt() {
    this.createdAt = dayjs().tz('Asia/Seoul').toDate(); // 정확하게 한국시간으로 변환
  }


}
