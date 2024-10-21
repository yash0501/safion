import { toNano } from '@ton/core';
import { LiquidityPool } from '../wrappers/LiquidityPool';
import { NetworkProvider } from '@ton/blueprint';

export async function run(provider: NetworkProvider) {
    const liquidityPool = provider.open(await LiquidityPool.fromInit());

    await liquidityPool.send(
        provider.sender(),
        {
            value: toNano('0.05'),
        },
        {
            $$type: 'Deploy',
            queryId: 0n,
        }
    );

    await provider.waitForDeploy(liquidityPool.address);

    // run methods on `liquidityPool`
}
