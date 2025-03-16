import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity('Kosdaq') // 테이블 이름을 'tr_codes'로 설정
export class Kosdaq {
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
}