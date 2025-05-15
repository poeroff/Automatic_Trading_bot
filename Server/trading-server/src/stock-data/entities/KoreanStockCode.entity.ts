import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { DayStockData } from "./DayStockData.entity";
import { WeekStockData } from "./WeekStockData.entity";
import { PeakDate } from "./PeakDate.entity";
import { FilteredPeak } from "./FilterPeak.entity";
import { UserInflection } from "./UserInflection.entity";
import { PeakPrice } from "./PeakPrice.entity";
import { Alert } from "./Alert.entity";

@Entity('KoreanStockCode') // 테이블 이름을 'tr_codes'로 설정
export class KoreanStockCode {
    @PrimaryGeneratedColumn()
    id : number

    @Column({nullable : true})
    company : string

    @Column({nullable : true})
    code : string

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
    //코스닥 코스피 분류류
    @Column()
    mket_id_cd : string

    // 자본 잠식 상태
    @Column()
    capital_Impairment : string
    //관리종목여부
    @Column()
    admn_item_yn : string
    //거래정지여부
    @Column()
    tr_stop_yn : string
    //시가총액 달성 여부
    @Column()
    mcap : string
    // 매출액
    @Column()
    sale_account : string
    //빗각인지, 추세선인지 여부 확인(빗각을 그을 수 없을 경우에 추세선 사용)
    @Column({default : false})
    trendline_oblique_angle : boolean


    @Column({ type: 'boolean', default: false })
    certified: boolean; // 인증 여부

    @OneToMany(() => DayStockData, (daystockData) => daystockData.trCode)
    daystockData: DayStockData[];

    @OneToMany(() => WeekStockData, (weekstockData) => weekstockData.trCode)
    weekstockData: WeekStockData[];

    @OneToMany(() => PeakDate, (peakDate) => peakDate.trCode)
    peakDates: PeakDate[];

    @OneToMany(() => FilteredPeak, (filteredPeak) => filteredPeak.trCode)
    filteredPeaks: FilteredPeak[];

    @OneToMany(() => UserInflection, (userInflection) => userInflection.trCode)
    userInflections: UserInflection[];

    @OneToMany(() => PeakPrice, (peakPrice) => peakPrice.trCode)
    peakPrices: PeakPrice[];

    @OneToMany(() => Alert, (alert) => alert.trCode)
    alert: Alert[];



}