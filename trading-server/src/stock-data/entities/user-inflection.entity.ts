import { Entity, Column, PrimaryGeneratedColumn, ManyToOne } from 'typeorm';
import { TrCode } from './tr-code.entity'; // TrCode 엔티티를 임포트

@Entity('user_inflection')
export class UserInflection {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => TrCode, (trCode) => trCode.userInflections, { onDelete: 'CASCADE' })

  trCode: TrCode; // TrCode와의 관계

  @Column({ type: 'bigint' }) // 'bigint'로 변경
  date: number; 
}