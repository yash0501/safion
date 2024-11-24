import { Blockchain, SandboxContract, TreasuryContract } from '@ton/sandbox';
import { Address, Cell, Slice, toNano, beginCell } from '@ton/core';
import { AMM } from '../wrappers/LiquidityPool2';
import '@ton/test-utils';
import { SmartContract, SendMsgAction } from 'ton-contract-executor';
import * as fs from 'fs';
import { send } from 'process';
import Prando from "prando";

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
        // const friendlyAddress = 'UQBkQP48aUEDg5Y5RRc8SxFHm_C5tNcJDlh3e9pYHC-ZmDBJ';
        const friendlyAddress = "0:fcb91a3a3816d0f7b8c2c76108b8a9bc5a6b7a55bd79f8ab101c52db29232260"
        const parsedResult = Address.parseRaw('0:2cf55953e92efbeadab7ba725c3f93a0b23f842cbba72d7b8e6f510a70e422e3');
        const validAddress: Address = parsedResult

        console.log(Address.isAddress(validAddress));
    
        console.log("Parsed Address:", validAddress.toString()); // Debug Address

        // let additionalData: Cell = beginCell()
        //     .storeInt(50n, 256) // percentage as uint256
        //     .endCell();

        // let payload: Cell = beginCell()
        //     .storeInt(0x25938561, 64) // Operation code
        //     .storeAddress(validAddress) // token_wallet
        //     .storeAddress(validAddress) // refund_address
        //     .storeAddress(validAddress) // excesses_address
        //     .storeInt(BigInt(Math.floor(Date.now() / 1000) + 600), 64) // Deadline
        //     .storeRef(additionalData)
        //     .endCell();

        // console.log("Payload Hex:", payload.toString());
        // console.log("AdditionalData Hex:", additionalData.toString());

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
        //         sender: validAddress,
        //         payload: payload.asSlice(),
        //     }
        // );

        // console.log("Transaction Logs:", send.transactions);
    
        let additionalData: Cell = beginCell()
            .storeInt(0, 32)
            .storeAddress(validAddress) // Ensure this is correct
            .storeInt(5000000, 64)
            .storeInt(6000000, 64)
            .endCell();
    
        let payload: Cell = beginCell()
            .storeInt(0xfcf9e58f, 64)
            .storeAddress(validAddress)
            // .storeAddress(validAddress)
            // .storeAddress(validAddress)
            .storeInt(BigInt(Math.floor(Date.now() / 1000) + 600), 64) // Deadline: 10 minutes from now
            .storeRef(additionalData) // Reference additionalData
            .endCell();
    
        console.log("Payload as Cell:", payload.toString()); // Log payload
        console.log("AdditionalData as Cell:", additionalData.toString()); // Log additional data
    
        let payloadSlice = payload.asSlice();
        const send = await amm.send(
            deployer.getSender(),
            {
                value: toNano('5'),
                bounce: false,
            },
            {
                $$type: "TransferNotification",
                query_id: 0n,
                jetton_amount: 1n,
                sender: validAddress,
                payload: payloadSlice,
            }
        );

        console.log(send);

        console.log("Transaction Results:", send.transactions.map(tx => ({
            from: tx.address,
            success: tx.description,
            exitCode: tx.outMessages,
            vmLogs: tx.vmLogs,
        })));
    
        expect(send.transactions).toContainEqual(expect.objectContaining({
            from: expect.any(Address),
            to: expect.any(Address),
            success: expect.objectContaining({
                aborted: false,
            }),
        }));
        
    });
});
