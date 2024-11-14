import { toNano } from '@ton/core';
import { Newcontract } from '../wrappers/Newcontract';
import { NetworkProvider } from '@ton/blueprint';

export async function run(provider: NetworkProvider) {
    const newcontract = provider.open(await Newcontract.fromInit());

    await newcontract.send(
        provider.sender(),
        {
            value: toNano('0.05'),
        },
        {
            $$type: 'Deploy',
            queryId: 876823n,
        }
    );

    await provider.waitForDeploy(newcontract.address);

    // run methods on `newcontract`
}
