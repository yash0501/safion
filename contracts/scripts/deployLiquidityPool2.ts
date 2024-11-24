import { toNano } from '@ton/core';
import { LiquidityPool2 } from '../wrappers/LiquidityPool2';
import { NetworkProvider } from '@ton/blueprint';

export async function run(provider: NetworkProvider) {
    const liquidityPool2 = provider.open(await LiquidityPool2.fromInit());

    await liquidityPool2.send(
        provider.sender(),
        {
            value: toNano('0.05'),
        },
        {
            $$type: 'Deploy',
            queryId: 0n,
        }
    );

    await provider.waitForDeploy(liquidityPool2.address);

    // run methods on `liquidityPool2`
}
