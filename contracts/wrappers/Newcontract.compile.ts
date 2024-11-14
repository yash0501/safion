import { CompilerConfig } from '@ton/blueprint';

export const compile: CompilerConfig = {
    lang: 'tact',
    target: 'contracts/newcontract.tact',
    options: {
        debug: true,
    },
};
