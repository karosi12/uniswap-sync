import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { Pool } from '../pool/pool.entity';

@Entity()
export class Tick {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  tickIndex: string;

  @Column()
  liquidityGross: string;

  @Column()
  liquidityNet: string;

  @ManyToOne(() => Pool, (pool) => pool.tick)
  pool: Pool;
}
