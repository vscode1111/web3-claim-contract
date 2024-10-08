import '@nomicfoundation/hardhat-toolbox';
import '@openzeppelin/hardhat-upgrades';
import { config as dotenvConfig } from 'dotenv';
import 'hardhat-deploy';
import type { HardhatUserConfig } from 'hardhat/config';
import type { HardhatNetworkAccountUserConfig, NetworkUserConfig } from 'hardhat/types';
import { resolve } from 'path';
import 'tsconfig-paths/register';
import { DeployNetworks } from '~types';
import { getEnv } from './common/config';

const dotenvConfigPath: string = process.env.DOTENV_CONFIG_PATH || './.env';
dotenvConfig({
  path: resolve(__dirname, dotenvConfigPath),
});

function getAccounts() {
  return [
    `0x${getEnv('OWNER_PRIVATE_KEY')}`,
    `0x${getEnv('USER1_PRIVATE_KEY')}`,
    `0x${getEnv('USER2_PRIVATE_KEY')}`,
    `0x${getEnv('USER3_PRIVATE_KEY')}`,
    `0x${getEnv('OWNER2_PRIVATE_KEY')}`,
  ];
}

function getNetworkAccounts(): HardhatNetworkAccountUserConfig[] {
  return getAccounts().map((account) => ({
    privateKey: account,
    balance: '1000000000000000000',
  }));
}

function getChainConfig(
  chain: keyof DeployNetworks,
  chainId?: number,
): NetworkUserConfig & { url?: string } {
  return {
    chainId,
    url: getEnv(`${chain.toUpperCase()}_PROVIDER_URL`),
    accounts: getAccounts(),
  };
}

export const defaultNetwork: keyof DeployNetworks = 'bsc';
// export const defaultNetwork: keyof DeployNetworks = 'bscTestnet';

const config: HardhatUserConfig = {
  defaultNetwork,
  etherscan: {
    apiKey: {
      bsc: getEnv('BSC_SCAN_API_KEY'),
      bscTestnet: getEnv('BSCTESTNET_SCAN_API_KEY'),
    },
  },
  gasReporter: {
    currency: 'USD',
    enabled: false,
    excludeContracts: [],
    src: './contracts',
  },
  networks: {
    hardhat: {
      forking: {
        enabled: false,
        url: getChainConfig(defaultNetwork).url ?? '',
        blockNumber: 39656567, // <-- edit here
      },
      initialBaseFeePerGas: 0,
      mining: {
        auto: true,
      },
      gasPrice: 0,
      accounts: getNetworkAccounts(),
    },
    bsc: getChainConfig('bsc'),
    bscTestnet: getChainConfig('bscTestnet'),
  },
  paths: {
    artifacts: './artifacts',
    cache: './cache',
    sources: './contracts',
    tests: './test',
  },
  solidity: {
    version: '0.8.19',
    settings: {
      metadata: {
        bytecodeHash: 'none',
      },
      // Disable the optimizer when debugging
      // https://hardhat.org/hardhat-network/#solidity-optimizer-support
      optimizer: {
        enabled: true,
        runs: 800,
      },
    },
  },
  typechain: {
    // outDir: "types",
    target: 'ethers-v6',
  },
};

export default config;
