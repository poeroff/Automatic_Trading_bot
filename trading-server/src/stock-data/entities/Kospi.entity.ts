import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { StockData } from "./stock-data.entity";

@Entity('Kospi') // 테이블 이름을 'tr_codes'로 설정
export class Kospi {
    @PrimaryGeneratedColumn()
    id : bigint

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

    @OneToMany(() => StockData, (stockData) => stockData.trCode)
    stockData: StockData[];


}