import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScheduleModule } from '@nestjs/schedule';
import { UniswapService } from './uniswap.service';
import { Pool } from './pool/pool.entity';
import { Tick } from './tick/tick.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Pool, Tick]), ScheduleModule.forRoot()],
  providers: [UniswapService],
})
export class UniswapModule {}
