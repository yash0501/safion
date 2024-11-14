import { Blockchain, SandboxContract, TreasuryContract } from '@ton/sandbox';
import { toNano } from '@ton/core';
import { Newcontract } from '../wrappers/Newcontract';
import '@ton/test-utils';

describe('Newcontract', () => {
    let blockchain: Blockchain;
    let deployer: SandboxContract<TreasuryContract>;
    let newcontract: SandboxContract<Newcontract>;

    beforeEach(async () => {
        blockchain = await Blockchain.create();

        newcontract = blockchain.openContract(await Newcontract.fromInit());

        deployer = await blockchain.treasury('deployer');

        const deployResult = await newcontract.send(
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
            to: newcontract.address,
            deploy: true,
            success: true,
        });
    });

    it('should deploy', async () => {
        // the check is done inside beforeEach
        // blockchain and newcontract are ready to use
    });
});
