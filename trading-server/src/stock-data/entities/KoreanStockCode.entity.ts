import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { DayStockData } from "./DayStockData.entity";
import { WeekStockData } from "./WeekStockData.entity";
import { PeakDate } from "./PeakDate.entity";

@Entity('KoreanStockCode') // 테이블 이름을 'tr_codes'로 설정
export class KoreanStockCode {
    @PrimaryGeneratedColumn()
    id : number

    @Column({nullable : true})
    company : string

    @Column({nullable : true})
    code : number

    @Column({nullable : true})
    category : string

    @Column({nullable : true})
    products : string

    @Column({nullable : true})
    listed_date : string

    @Column({nullable : true})
    settlement_month : string

    @Column({nullable : true})
    representative : string

    @Column({nullable : true})
    homepage : string

    @Column({nullable : true})
    region : string

    @OneToMany(() => DayStockData, (daystockData) => daystockData.trCode)
    daystockData: DayStockData[];

    @OneToMany(() => WeekStockData, (weekstockData) => weekstockData.trCode)
    weekstockData: WeekStockData[];

    @OneToMany(() => PeakDate, (peakDate) => peakDate.trCode)
    peakDates: PeakDate[];



}