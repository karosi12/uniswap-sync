import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ApolloClient, InMemoryCache, gql } from '@apollo/client/core';
import { Pool } from './pool/pool.entity';
import { Tick } from './tick/tick.entity';

@Injectable()
export class UniswapService {
  private readonly logger = new Logger(UniswapService.name);
  private client: ApolloClient<any>;

  constructor(
    @InjectRepository(Pool)
    private readonly poolRepository: Repository<Pool>,
    @InjectRepository(Tick)
    private readonly tickRepository: Repository<Tick>,
  ) {
    this.client = new ApolloClient({
      uri: String(process.env.UNISWAP_URL),
      cache: new InMemoryCache(),
    });
  }

  @Cron('* */30 * * * *')
  async handleCron() {
    this.logger.debug('Called every 30 minutes');
    await this.fetchAndStoreData();
  }

  async fetchAndStoreData() {
    const query = gql`
      query {
        pools {
          id
          liquidity
          sqrtPrice
          tick
          feeGrowthGlobal0X128
          feeGrowthGlobal1X128
          ticks {
            tickIdx
            liquidityGross
            liquidityNet
          }
        }
      }
    `;
    try {
      const response = await this.client.query({ query });
      if (response && response.data) {
        await this.storeData(response.data.pools);
        this.logger.log('Data fetched and stored successfully');
        return response.data;
      } else {
        this.logger.error('No data returned from the query');
        return null;
      }
    } catch (error) {
      this.logger.error('Error fetching data:', error);
      throw error;
    }
  }

  async storeData(pools: any[]): Promise<void> {
    for (const poolData of pools) {
      let pool = await this.poolRepository.findOne({
        where: { address: poolData.id },
      });
      if (!pool) {
        pool = new Pool();
        pool.address = poolData.id;
      }
      pool.liquidity = poolData.liquidity ?? '';
      pool.sqrtPrice = poolData.sqrtPrice ?? '';
      pool.tick = poolData.tick ?? '';
      pool.feeGrowthGlobal0X128 = poolData.feeGrowthGlobal0X128 ?? '';
      pool.feeGrowthGlobal1X128 = poolData.feeGrowthGlobal1X128 ?? '';
      await this.poolRepository.save(pool);

      for (const tickData of poolData.ticks) {
        let tick = await this.tickRepository.findOne({
          where: { tickIndex: tickData.tickIdx, pool: pool },
        });
        if (!tick) {
          tick = new Tick();
          tick.tickIndex = tickData.tickIdx;
          tick.pool = pool;
        }
        tick.liquidityGross = tickData.liquidityGross;
        tick.liquidityNet = tickData.liquidityNet;
        await this.tickRepository.save(tick);
      }
    }
    this.logger.log('Data synchronized successfully');
  }
}
