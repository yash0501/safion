import { CompilerConfig } from '@ton/blueprint';

export const compile: CompilerConfig = {
    lang: 'tact',
    target: 'contracts/liquidity_pool2.tact',
    options: {
        debug: true,
    },
};
