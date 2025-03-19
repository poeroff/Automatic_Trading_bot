import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { DayStockData } from "./DayStockData.entity";
import { WeekStockData } from "./WeekStockData.entity";

@Entity('KoreanStockCode') // 테이블 이름을 'tr_codes'로 설정
export class KoreanStockCode {
    @PrimaryGeneratedColumn()
    id : number

    @Column()
    company : string

    @Column()
    code : number

    @Column()
    category : string

    @Column()
    products : string

    @Column()
    listed_date : string

    @Column()
    settlement_month : string

    @Column()
    representative : string

    @Column()
    homepage : string

    @OneToMany(() => DayStockData, (daystockData) => daystockData.trCode)
    daystockData: DayStockData[];

    @OneToMany(() => WeekStockData, (weekstockData) => weekstockData.trCode)
    weekstockData: WeekStockData[];


}