import { Blockchain, SandboxContract, TreasuryContract } from '@ton/sandbox';
import { Address, Cell, Slice, toNano } from '@ton/core';
import { AMM, loadTransferNotification } from '../wrappers/LiquidityPool2';
import '@ton/test-utils';
import { SmartContract, SendMsgAction } from 'ton-contract-executor';
import * as fs from 'fs';
import { send } from 'process';
import Prando from "prando";

function randomAddress(seed: string, workchain?: number) {
    const random = new Prando(seed);
    const hash = Buffer.alloc(32);
    for (let i = 0; i < hash.length; i++) {
      hash[i] = random.nextInt(0, 255);
    }
    return new Address(workchain ?? 0, hash);
  }

describe('LiquidityPool2', () => {
    let blockchain: Blockchain;
    let deployer: SandboxContract<TreasuryContract>;
    let amm: SandboxContract<AMM>;
    let contract: SmartContract;

    beforeEach(async () => {
        blockchain = await Blockchain.create();
        amm = blockchain.openContract(await AMM.fromInit());
        deployer = await blockchain.treasury('deployer');
        // contract = await SmartContract.fromCell(
        //     Cell.fromBoc(await fs.readFileSync('build/'))
        // );

        const deployResult = await amm.send(
            deployer.getSender(),
            {
                value: toNano('5'),
            },
            {
                $$type: 'Deploy',
                queryId: 0n,
            }
        );

        expect(deployResult.transactions).toHaveTransaction({
            from: deployer.address,
            to: amm.address,
            deploy: true,
            success: true,
        });
    });

    it('should deploy', async () => {
        // const send = await amm.send(
        //     deployer.getSender(),
        //     {
        //         value: toNano('5'),
        //         bounce: false,
        //     },
        //     {
        //         $$type: "TransferNotification",
        //         query_id: 0n,
        //         jetton_amount: 1n,
        //         sender: randomAddress("sender"),
        //         payload: {
        //             op: 0n,             // Operation code (e.g., swap, provide_lp)
        //             token_wallet: randomAddress("Token 1"),         // Address of the other Router token wallet
        //             refund_address: randomAddress("refund address"),       // Address for refund if operation fails
        //             excesses_address: randomAddress("excess address"),     // Address for TON excesses
        //             deadline: blockchain.now,        // Execution deadline for the transaction
        //             additional_data: {

        //             }, // Additional data for the operation
        //         }
        //     }
        // )
    });
});
