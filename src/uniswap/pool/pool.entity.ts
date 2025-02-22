import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Tick } from '../tick/tick.entity';

@Entity()
export class Pool {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  address: string;

  @Column()
  liquidity: string;

  @Column()
  sqrtPrice: string;

  @Column()
  tick: string;

  @Column()
  feeGrowthGlobal0X128: string;

  @Column()
  feeGrowthGlobal1X128: string;

  @OneToMany(() => Tick, (tick) => tick.pool)
  ticks: Tick[];
}
