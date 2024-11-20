import { Blockchain, SandboxContract, TreasuryContract } from '@ton/sandbox';
import { toNano } from '@ton/core';
import { LiquidityPool2 } from '../wrappers/LiquidityPool2';
import '@ton/test-utils';

describe('LiquidityPool2', () => {
    let blockchain: Blockchain;
    let deployer: SandboxContract<TreasuryContract>;
    let liquidityPool2: SandboxContract<LiquidityPool2>;

    beforeEach(async () => {
        blockchain = await Blockchain.create();

        liquidityPool2 = blockchain.openContract(await LiquidityPool2.fromInit());

        deployer = await blockchain.treasury('deployer');

        const deployResult = await liquidityPool2.send(
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
            to: liquidityPool2.address,
            deploy: true,
            success: true,
        });
    });

    it('should deploy', async () => {
        // the check is done inside beforeEach
        // blockchain and liquidityPool2 are ready to use
    });
});
