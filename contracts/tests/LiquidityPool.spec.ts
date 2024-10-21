import { Blockchain, SandboxContract, TreasuryContract } from '@ton/sandbox';
import { toNano } from '@ton/core';
import { LiquidityPool } from '../wrappers/LiquidityPool';
import '@ton/test-utils';

describe('LiquidityPool', () => {
    let blockchain: Blockchain;
    let deployer: SandboxContract<TreasuryContract>;
    let liquidityPool: SandboxContract<LiquidityPool>;

    beforeEach(async () => {
        blockchain = await Blockchain.create();

        liquidityPool = blockchain.openContract(await LiquidityPool.fromInit());

        deployer = await blockchain.treasury('deployer');

        const deployResult = await liquidityPool.send(
            deployer.getSender(),
            {
                value: toNano('0.05'),
            },
            {
                $$type: 'Deploy',
                queryId: 0n,
            }
        );

        expect(deployResult.transactions).toHaveTransaction({
            from: deployer.address,
            to: liquidityPool.address,
            deploy: true,
            success: true,
        });
    });

    it('should deploy', async () => {
        // the check is done inside beforeEach
        // blockchain and liquidityPool are ready to use
    });
});
