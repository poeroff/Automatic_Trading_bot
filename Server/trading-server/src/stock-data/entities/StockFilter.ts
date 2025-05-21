import { Column, Entity, JoinColumn, OneToOne, PrimaryGeneratedColumn } from "typeorm";
import { KoreanStockCode } from "./KoreanStockCode.entity";

@Entity('StockFilter') // 테이블 이름을 'tr_codes'로 설정
export class StockFilter {
    @PrimaryGeneratedColumn()
    id : number

    @Column({default : 0})
    currenthigh_count : number

    @Column({default : 0})
    previoushigh_count : number

    @OneToOne(() => KoreanStockCode, (koreanStockCode) => koreanStockCode.stockFilter)
    @JoinColumn({ name: 'stock_id' }) // This is the foreign key
    trCode: KoreanStockCode;

}