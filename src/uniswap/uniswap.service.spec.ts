import * as dotenv from 'dotenv';
import { Test, TestingModule } from '@nestjs/testing';
import { UniswapService } from './uniswap.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Pool } from './pool/pool.entity';
import { Tick } from './tick/tick.entity';
import { ApolloClient, InMemoryCache } from '@apollo/client/core';

// Load environment variables from .env file
dotenv.config();

jest.mock('@apollo/client/core', () => {
  const mApolloClient = {
    query: jest.fn(),
  };
  return {
    ApolloClient: jest.fn(() => mApolloClient),
    InMemoryCache: jest.fn(),
    gql: jest.fn((...args) => args),
  };
});

const mockPoolRepository = {
  findOne: jest.fn(),
  save: jest.fn(),
};

const mockTickRepository = {
  findOne: jest.fn(),
  save: jest.fn(),
};

const mockData = {
  pools: [
    {
      id: '0x1',
      liquidity: '1000',
      sqrtPrice: '12345',
      tick: '54321',
      feeGrowthGlobal0X128: '67890',
      feeGrowthGlobal1X128: '98765',
      ticks: [
        {
          tickIdx: '100',
          liquidityGross: '2000',
          liquidityNet: '1500',
        },
      ],
    },
  ],
};

describe('UniswapService', () => {
  let service: UniswapService;
  let poolRepository: Repository<Pool>;
  let tickRepository: Repository<Tick>;
  let apolloClient: jest.Mocked<ApolloClient<any>>;
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UniswapService,
        {
          provide: getRepositoryToken(Pool),
          useValue: mockPoolRepository,
        },
        {
          provide: getRepositoryToken(Tick),
          useValue: mockTickRepository,
        },
      ],
    }).compile();

    service = module.get<UniswapService>(UniswapService);
    poolRepository = module.get<Repository<Pool>>(getRepositoryToken(Pool));
    tickRepository = module.get<Repository<Tick>>(getRepositoryToken(Tick));
    apolloClient = new ApolloClient({
      cache: new InMemoryCache(),
    }) as jest.Mocked<ApolloClient<any>>;
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should handle undefined data response gracefully', async () => {
    apolloClient.query = jest.fn().mockResolvedValueOnce(undefined);

    const loggerErrorSpy = jest
      .spyOn(service['logger'], 'error')
      .mockImplementation();

    const result = await service.fetchAndStoreData();

    expect(loggerErrorSpy).toHaveBeenCalledWith(
      'No data returned from the query',
    );
    expect(result).toBeNull();

    loggerErrorSpy.mockRestore();
  });

  it('should fetch and store data', async () => {
    apolloClient.query = jest.fn().mockResolvedValueOnce({ data: mockData });
    const result = await service.fetchAndStoreData();

    expect(apolloClient.query).toHaveBeenCalled();
    expect(mockPoolRepository.save).toHaveBeenCalled();
    expect(mockPoolRepository.findOne).toHaveBeenCalled();
    expect(mockTickRepository.findOne).toHaveBeenCalled();
    expect(mockTickRepository.save).toHaveBeenCalled();
    expect(result).toEqual(mockData);
  });
});
