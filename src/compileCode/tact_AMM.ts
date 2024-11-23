import { 
    Cell,
    Slice, 
    Address, 
    Builder, 
    beginCell, 
    ComputeError, 
    TupleItem, 
    TupleReader, 
    Dictionary, 
    contractAddress, 
    ContractProvider, 
    Sender, 
    Contract, 
    ContractABI, 
    ABIType,
    ABIGetter,
    ABIReceiver,
    TupleBuilder,
    DictionaryValue
} from '@ton/core';

export type StateInit = {
    $$type: 'StateInit';
    code: Cell;
    data: Cell;
}

export function storeStateInit(src: StateInit) {
    return (builder: Builder) => {
        let b_0 = builder;
        b_0.storeRef(src.code);
        b_0.storeRef(src.data);
    };
}

export function loadStateInit(slice: Slice) {
    let sc_0 = slice;
    let _code = sc_0.loadRef();
    let _data = sc_0.loadRef();
    return { $$type: 'StateInit' as const, code: _code, data: _data };
}

function loadTupleStateInit(source: TupleReader) {
    let _code = source.readCell();
    let _data = source.readCell();
    return { $$type: 'StateInit' as const, code: _code, data: _data };
}

function loadGetterTupleStateInit(source: TupleReader) {
    let _code = source.readCell();
    let _data = source.readCell();
    return { $$type: 'StateInit' as const, code: _code, data: _data };
}

function storeTupleStateInit(source: StateInit) {
    let builder = new TupleBuilder();
    builder.writeCell(source.code);
    builder.writeCell(source.data);
    return builder.build();
}

function dictValueParserStateInit(): DictionaryValue<StateInit> {
    return {
        serialize: (src, builder) => {
            builder.storeRef(beginCell().store(storeStateInit(src)).endCell());
        },
        parse: (src) => {
            return loadStateInit(src.loadRef().beginParse());
        }
    }
}

export type StdAddress = {
    $$type: 'StdAddress';
    workchain: bigint;
    address: bigint;
}

export function storeStdAddress(src: StdAddress) {
    return (builder: Builder) => {
        let b_0 = builder;
        b_0.storeInt(src.workchain, 8);
        b_0.storeUint(src.address, 256);
    };
}

export function loadStdAddress(slice: Slice) {
    let sc_0 = slice;
    let _workchain = sc_0.loadIntBig(8);
    let _address = sc_0.loadUintBig(256);
    return { $$type: 'StdAddress' as const, workchain: _workchain, address: _address };
}

function loadTupleStdAddress(source: TupleReader) {
    let _workchain = source.readBigNumber();
    let _address = source.readBigNumber();
    return { $$type: 'StdAddress' as const, workchain: _workchain, address: _address };
}

function loadGetterTupleStdAddress(source: TupleReader) {
    let _workchain = source.readBigNumber();
    let _address = source.readBigNumber();
    return { $$type: 'StdAddress' as const, workchain: _workchain, address: _address };
}

function storeTupleStdAddress(source: StdAddress) {
    let builder = new TupleBuilder();
    builder.writeNumber(source.workchain);
    builder.writeNumber(source.address);
    return builder.build();
}

function dictValueParserStdAddress(): DictionaryValue<StdAddress> {
    return {
        serialize: (src, builder) => {
            builder.storeRef(beginCell().store(storeStdAddress(src)).endCell());
        },
        parse: (src) => {
            return loadStdAddress(src.loadRef().beginParse());
        }
    }
}

export type VarAddress = {
    $$type: 'VarAddress';
    workchain: bigint;
    address: Slice;
}

export function storeVarAddress(src: VarAddress) {
    return (builder: Builder) => {
        let b_0 = builder;
        b_0.storeInt(src.workchain, 32);
        b_0.storeRef(src.address.asCell());
    };
}

export function loadVarAddress(slice: Slice) {
    let sc_0 = slice;
    let _workchain = sc_0.loadIntBig(32);
    let _address = sc_0.loadRef().asSlice();
    return { $$type: 'VarAddress' as const, workchain: _workchain, address: _address };
}

function loadTupleVarAddress(source: TupleReader) {
    let _workchain = source.readBigNumber();
    let _address = source.readCell().asSlice();
    return { $$type: 'VarAddress' as const, workchain: _workchain, address: _address };
}

function loadGetterTupleVarAddress(source: TupleReader) {
    let _workchain = source.readBigNumber();
    let _address = source.readCell().asSlice();
    return { $$type: 'VarAddress' as const, workchain: _workchain, address: _address };
}

function storeTupleVarAddress(source: VarAddress) {
    let builder = new TupleBuilder();
    builder.writeNumber(source.workchain);
    builder.writeSlice(source.address.asCell());
    return builder.build();
}

function dictValueParserVarAddress(): DictionaryValue<VarAddress> {
    return {
        serialize: (src, builder) => {
            builder.storeRef(beginCell().store(storeVarAddress(src)).endCell());
        },
        parse: (src) => {
            return loadVarAddress(src.loadRef().beginParse());
        }
    }
}

export type Context = {
    $$type: 'Context';
    bounced: boolean;
    sender: Address;
    value: bigint;
    raw: Slice;
}

export function storeContext(src: Context) {
    return (builder: Builder) => {
        let b_0 = builder;
        b_0.storeBit(src.bounced);
        b_0.storeAddress(src.sender);
        b_0.storeInt(src.value, 257);
        b_0.storeRef(src.raw.asCell());
    };
}

export function loadContext(slice: Slice) {
    let sc_0 = slice;
    let _bounced = sc_0.loadBit();
    let _sender = sc_0.loadAddress();
    let _value = sc_0.loadIntBig(257);
    let _raw = sc_0.loadRef().asSlice();
    return { $$type: 'Context' as const, bounced: _bounced, sender: _sender, value: _value, raw: _raw };
}

function loadTupleContext(source: TupleReader) {
    let _bounced = source.readBoolean();
    let _sender = source.readAddress();
    let _value = source.readBigNumber();
    let _raw = source.readCell().asSlice();
    return { $$type: 'Context' as const, bounced: _bounced, sender: _sender, value: _value, raw: _raw };
}

function loadGetterTupleContext(source: TupleReader) {
    let _bounced = source.readBoolean();
    let _sender = source.readAddress();
    let _value = source.readBigNumber();
    let _raw = source.readCell().asSlice();
    return { $$type: 'Context' as const, bounced: _bounced, sender: _sender, value: _value, raw: _raw };
}

function storeTupleContext(source: Context) {
    let builder = new TupleBuilder();
    builder.writeBoolean(source.bounced);
    builder.writeAddress(source.sender);
    builder.writeNumber(source.value);
    builder.writeSlice(source.raw.asCell());
    return builder.build();
}

function dictValueParserContext(): DictionaryValue<Context> {
    return {
        serialize: (src, builder) => {
            builder.storeRef(beginCell().store(storeContext(src)).endCell());
        },
        parse: (src) => {
            return loadContext(src.loadRef().beginParse());
        }
    }
}

export type SendParameters = {
    $$type: 'SendParameters';
    bounce: boolean;
    to: Address;
    value: bigint;
    mode: bigint;
    body: Cell | null;
    code: Cell | null;
    data: Cell | null;
}

export function storeSendParameters(src: SendParameters) {
    return (builder: Builder) => {
        let b_0 = builder;
        b_0.storeBit(src.bounce);
        b_0.storeAddress(src.to);
        b_0.storeInt(src.value, 257);
        b_0.storeInt(src.mode, 257);
        if (src.body !== null && src.body !== undefined) { b_0.storeBit(true).storeRef(src.body); } else { b_0.storeBit(false); }
        if (src.code !== null && src.code !== undefined) { b_0.storeBit(true).storeRef(src.code); } else { b_0.storeBit(false); }
        if (src.data !== null && src.data !== undefined) { b_0.storeBit(true).storeRef(src.data); } else { b_0.storeBit(false); }
    };
}

export function loadSendParameters(slice: Slice) {
    let sc_0 = slice;
    let _bounce = sc_0.loadBit();
    let _to = sc_0.loadAddress();
    let _value = sc_0.loadIntBig(257);
    let _mode = sc_0.loadIntBig(257);
    let _body = sc_0.loadBit() ? sc_0.loadRef() : null;
    let _code = sc_0.loadBit() ? sc_0.loadRef() : null;
    let _data = sc_0.loadBit() ? sc_0.loadRef() : null;
    return { $$type: 'SendParameters' as const, bounce: _bounce, to: _to, value: _value, mode: _mode, body: _body, code: _code, data: _data };
}

function loadTupleSendParameters(source: TupleReader) {
    let _bounce = source.readBoolean();
    let _to = source.readAddress();
    let _value = source.readBigNumber();
    let _mode = source.readBigNumber();
    let _body = source.readCellOpt();
    let _code = source.readCellOpt();
    let _data = source.readCellOpt();
    return { $$type: 'SendParameters' as const, bounce: _bounce, to: _to, value: _value, mode: _mode, body: _body, code: _code, data: _data };
}

function loadGetterTupleSendParameters(source: TupleReader) {
    let _bounce = source.readBoolean();
    let _to = source.readAddress();
    let _value = source.readBigNumber();
    let _mode = source.readBigNumber();
    let _body = source.readCellOpt();
    let _code = source.readCellOpt();
    let _data = source.readCellOpt();
    return { $$type: 'SendParameters' as const, bounce: _bounce, to: _to, value: _value, mode: _mode, body: _body, code: _code, data: _data };
}

function storeTupleSendParameters(source: SendParameters) {
    let builder = new TupleBuilder();
    builder.writeBoolean(source.bounce);
    builder.writeAddress(source.to);
    builder.writeNumber(source.value);
    builder.writeNumber(source.mode);
    builder.writeCell(source.body);
    builder.writeCell(source.code);
    builder.writeCell(source.data);
    return builder.build();
}

function dictValueParserSendParameters(): DictionaryValue<SendParameters> {
    return {
        serialize: (src, builder) => {
            builder.storeRef(beginCell().store(storeSendParameters(src)).endCell());
        },
        parse: (src) => {
            return loadSendParameters(src.loadRef().beginParse());
        }
    }
}

export type Deploy = {
    $$type: 'Deploy';
    queryId: bigint;
}

export function storeDeploy(src: Deploy) {
    return (builder: Builder) => {
        let b_0 = builder;
        b_0.storeUint(2490013878, 32);
        b_0.storeUint(src.queryId, 64);
    };
}

export function loadDeploy(slice: Slice) {
    let sc_0 = slice;
    if (sc_0.loadUint(32) !== 2490013878) { throw Error('Invalid prefix'); }
    let _queryId = sc_0.loadUintBig(64);
    return { $$type: 'Deploy' as const, queryId: _queryId };
}

function loadTupleDeploy(source: TupleReader) {
    let _queryId = source.readBigNumber();
    return { $$type: 'Deploy' as const, queryId: _queryId };
}

function loadGetterTupleDeploy(source: TupleReader) {
    let _queryId = source.readBigNumber();
    return { $$type: 'Deploy' as const, queryId: _queryId };
}

function storeTupleDeploy(source: Deploy) {
    let builder = new TupleBuilder();
    builder.writeNumber(source.queryId);
    return builder.build();
}

function dictValueParserDeploy(): DictionaryValue<Deploy> {
    return {
        serialize: (src, builder) => {
            builder.storeRef(beginCell().store(storeDeploy(src)).endCell());
        },
        parse: (src) => {
            return loadDeploy(src.loadRef().beginParse());
        }
    }
}

export type DeployOk = {
    $$type: 'DeployOk';
    queryId: bigint;
}

export function storeDeployOk(src: DeployOk) {
    return (builder: Builder) => {
        let b_0 = builder;
        b_0.storeUint(2952335191, 32);
        b_0.storeUint(src.queryId, 64);
    };
}

export function loadDeployOk(slice: Slice) {
    let sc_0 = slice;
    if (sc_0.loadUint(32) !== 2952335191) { throw Error('Invalid prefix'); }
    let _queryId = sc_0.loadUintBig(64);
    return { $$type: 'DeployOk' as const, queryId: _queryId };
}

function loadTupleDeployOk(source: TupleReader) {
    let _queryId = source.readBigNumber();
    return { $$type: 'DeployOk' as const, queryId: _queryId };
}

function loadGetterTupleDeployOk(source: TupleReader) {
    let _queryId = source.readBigNumber();
    return { $$type: 'DeployOk' as const, queryId: _queryId };
}

function storeTupleDeployOk(source: DeployOk) {
    let builder = new TupleBuilder();
    builder.writeNumber(source.queryId);
    return builder.build();
}

function dictValueParserDeployOk(): DictionaryValue<DeployOk> {
    return {
        serialize: (src, builder) => {
            builder.storeRef(beginCell().store(storeDeployOk(src)).endCell());
        },
        parse: (src) => {
            return loadDeployOk(src.loadRef().beginParse());
        }
    }
}

export type FactoryDeploy = {
    $$type: 'FactoryDeploy';
    queryId: bigint;
    cashback: Address;
}

export function storeFactoryDeploy(src: FactoryDeploy) {
    return (builder: Builder) => {
        let b_0 = builder;
        b_0.storeUint(1829761339, 32);
        b_0.storeUint(src.queryId, 64);
        b_0.storeAddress(src.cashback);
    };
}

export function loadFactoryDeploy(slice: Slice) {
    let sc_0 = slice;
    if (sc_0.loadUint(32) !== 1829761339) { throw Error('Invalid prefix'); }
    let _queryId = sc_0.loadUintBig(64);
    let _cashback = sc_0.loadAddress();
    return { $$type: 'FactoryDeploy' as const, queryId: _queryId, cashback: _cashback };
}

function loadTupleFactoryDeploy(source: TupleReader) {
    let _queryId = source.readBigNumber();
    let _cashback = source.readAddress();
    return { $$type: 'FactoryDeploy' as const, queryId: _queryId, cashback: _cashback };
}

function loadGetterTupleFactoryDeploy(source: TupleReader) {
    let _queryId = source.readBigNumber();
    let _cashback = source.readAddress();
    return { $$type: 'FactoryDeploy' as const, queryId: _queryId, cashback: _cashback };
}

function storeTupleFactoryDeploy(source: FactoryDeploy) {
    let builder = new TupleBuilder();
    builder.writeNumber(source.queryId);
    builder.writeAddress(source.cashback);
    return builder.build();
}

function dictValueParserFactoryDeploy(): DictionaryValue<FactoryDeploy> {
    return {
        serialize: (src, builder) => {
            builder.storeRef(beginCell().store(storeFactoryDeploy(src)).endCell());
        },
        parse: (src) => {
            return loadFactoryDeploy(src.loadRef().beginParse());
        }
    }
}

export type TransferNotification = {
    $$type: 'TransferNotification';
    query_id: bigint;
    jetton_amount: bigint;
    sender: Address;
    payload: Slice;
}

export function storeTransferNotification(src: TransferNotification) {
    return (builder: Builder) => {
        let b_0 = builder;
        b_0.storeUint(3414571288, 32);
        b_0.storeUint(src.query_id, 64);
        b_0.storeUint(src.jetton_amount, 128);
        b_0.storeAddress(src.sender);
        b_0.storeRef(src.payload.asCell());
    };
}

export function loadTransferNotification(slice: Slice) {
    let sc_0 = slice;
    if (sc_0.loadUint(32) !== 3414571288) { throw Error('Invalid prefix'); }
    let _query_id = sc_0.loadUintBig(64);
    let _jetton_amount = sc_0.loadUintBig(128);
    let _sender = sc_0.loadAddress();
    let _payload = sc_0.loadRef().asSlice();
    return { $$type: 'TransferNotification' as const, query_id: _query_id, jetton_amount: _jetton_amount, sender: _sender, payload: _payload };
}

function loadTupleTransferNotification(source: TupleReader) {
    let _query_id = source.readBigNumber();
    let _jetton_amount = source.readBigNumber();
    let _sender = source.readAddress();
    let _payload = source.readCell().asSlice();
    return { $$type: 'TransferNotification' as const, query_id: _query_id, jetton_amount: _jetton_amount, sender: _sender, payload: _payload };
}

function loadGetterTupleTransferNotification(source: TupleReader) {
    let _query_id = source.readBigNumber();
    let _jetton_amount = source.readBigNumber();
    let _sender = source.readAddress();
    let _payload = source.readCell().asSlice();
    return { $$type: 'TransferNotification' as const, query_id: _query_id, jetton_amount: _jetton_amount, sender: _sender, payload: _payload };
}

function storeTupleTransferNotification(source: TransferNotification) {
    let builder = new TupleBuilder();
    builder.writeNumber(source.query_id);
    builder.writeNumber(source.jetton_amount);
    builder.writeAddress(source.sender);
    builder.writeSlice(source.payload.asCell());
    return builder.build();
}

function dictValueParserTransferNotification(): DictionaryValue<TransferNotification> {
    return {
        serialize: (src, builder) => {
            builder.storeRef(beginCell().store(storeTransferNotification(src)).endCell());
        },
        parse: (src) => {
            return loadTransferNotification(src.loadRef().beginParse());
        }
    }
}

export type RemoveLiquidity = {
    $$type: 'RemoveLiquidity';
    query_id: bigint;
    sender: Address;
    payload: Slice;
}

export function storeRemoveLiquidity(src: RemoveLiquidity) {
    return (builder: Builder) => {
        let b_0 = builder;
        b_0.storeUint(2576943485, 32);
        b_0.storeUint(src.query_id, 64);
        b_0.storeAddress(src.sender);
        b_0.storeRef(src.payload.asCell());
    };
}

export function loadRemoveLiquidity(slice: Slice) {
    let sc_0 = slice;
    if (sc_0.loadUint(32) !== 2576943485) { throw Error('Invalid prefix'); }
    let _query_id = sc_0.loadUintBig(64);
    let _sender = sc_0.loadAddress();
    let _payload = sc_0.loadRef().asSlice();
    return { $$type: 'RemoveLiquidity' as const, query_id: _query_id, sender: _sender, payload: _payload };
}

function loadTupleRemoveLiquidity(source: TupleReader) {
    let _query_id = source.readBigNumber();
    let _sender = source.readAddress();
    let _payload = source.readCell().asSlice();
    return { $$type: 'RemoveLiquidity' as const, query_id: _query_id, sender: _sender, payload: _payload };
}

function loadGetterTupleRemoveLiquidity(source: TupleReader) {
    let _query_id = source.readBigNumber();
    let _sender = source.readAddress();
    let _payload = source.readCell().asSlice();
    return { $$type: 'RemoveLiquidity' as const, query_id: _query_id, sender: _sender, payload: _payload };
}

function storeTupleRemoveLiquidity(source: RemoveLiquidity) {
    let builder = new TupleBuilder();
    builder.writeNumber(source.query_id);
    builder.writeAddress(source.sender);
    builder.writeSlice(source.payload.asCell());
    return builder.build();
}

function dictValueParserRemoveLiquidity(): DictionaryValue<RemoveLiquidity> {
    return {
        serialize: (src, builder) => {
            builder.storeRef(beginCell().store(storeRemoveLiquidity(src)).endCell());
        },
        parse: (src) => {
            return loadRemoveLiquidity(src.loadRef().beginParse());
        }
    }
}

export type JettonTransfer = {
    $$type: 'JettonTransfer';
    queryId: bigint;
    amount: bigint;
    destination: Address;
    responseDestination: Address | null;
    customPayload: Cell | null;
    forwardTonAmount: bigint;
    forwardPayload: Slice;
}

export function storeJettonTransfer(src: JettonTransfer) {
    return (builder: Builder) => {
        let b_0 = builder;
        b_0.storeUint(260734629, 32);
        b_0.storeUint(src.queryId, 64);
        b_0.storeCoins(src.amount);
        b_0.storeAddress(src.destination);
        b_0.storeAddress(src.responseDestination);
        if (src.customPayload !== null && src.customPayload !== undefined) { b_0.storeBit(true).storeRef(src.customPayload); } else { b_0.storeBit(false); }
        b_0.storeCoins(src.forwardTonAmount);
        b_0.storeBuilder(src.forwardPayload.asBuilder());
    };
}

export function loadJettonTransfer(slice: Slice) {
    let sc_0 = slice;
    if (sc_0.loadUint(32) !== 260734629) { throw Error('Invalid prefix'); }
    let _queryId = sc_0.loadUintBig(64);
    let _amount = sc_0.loadCoins();
    let _destination = sc_0.loadAddress();
    let _responseDestination = sc_0.loadMaybeAddress();
    let _customPayload = sc_0.loadBit() ? sc_0.loadRef() : null;
    let _forwardTonAmount = sc_0.loadCoins();
    let _forwardPayload = sc_0;
    return { $$type: 'JettonTransfer' as const, queryId: _queryId, amount: _amount, destination: _destination, responseDestination: _responseDestination, customPayload: _customPayload, forwardTonAmount: _forwardTonAmount, forwardPayload: _forwardPayload };
}

function loadTupleJettonTransfer(source: TupleReader) {
    let _queryId = source.readBigNumber();
    let _amount = source.readBigNumber();
    let _destination = source.readAddress();
    let _responseDestination = source.readAddressOpt();
    let _customPayload = source.readCellOpt();
    let _forwardTonAmount = source.readBigNumber();
    let _forwardPayload = source.readCell().asSlice();
    return { $$type: 'JettonTransfer' as const, queryId: _queryId, amount: _amount, destination: _destination, responseDestination: _responseDestination, customPayload: _customPayload, forwardTonAmount: _forwardTonAmount, forwardPayload: _forwardPayload };
}

function loadGetterTupleJettonTransfer(source: TupleReader) {
    let _queryId = source.readBigNumber();
    let _amount = source.readBigNumber();
    let _destination = source.readAddress();
    let _responseDestination = source.readAddressOpt();
    let _customPayload = source.readCellOpt();
    let _forwardTonAmount = source.readBigNumber();
    let _forwardPayload = source.readCell().asSlice();
    return { $$type: 'JettonTransfer' as const, queryId: _queryId, amount: _amount, destination: _destination, responseDestination: _responseDestination, customPayload: _customPayload, forwardTonAmount: _forwardTonAmount, forwardPayload: _forwardPayload };
}

function storeTupleJettonTransfer(source: JettonTransfer) {
    let builder = new TupleBuilder();
    builder.writeNumber(source.queryId);
    builder.writeNumber(source.amount);
    builder.writeAddress(source.destination);
    builder.writeAddress(source.responseDestination);
    builder.writeCell(source.customPayload);
    builder.writeNumber(source.forwardTonAmount);
    builder.writeSlice(source.forwardPayload.asCell());
    return builder.build();
}

function dictValueParserJettonTransfer(): DictionaryValue<JettonTransfer> {
    return {
        serialize: (src, builder) => {
            builder.storeRef(beginCell().store(storeJettonTransfer(src)).endCell());
        },
        parse: (src) => {
            return loadJettonTransfer(src.loadRef().beginParse());
        }
    }
}

export type RemoveLiquidityPayload = {
    $$type: 'RemoveLiquidityPayload';
    percentage: bigint;
}

export function storeRemoveLiquidityPayload(src: RemoveLiquidityPayload) {
    return (builder: Builder) => {
        let b_0 = builder;
        b_0.storeUint(src.percentage, 256);
    };
}

export function loadRemoveLiquidityPayload(slice: Slice) {
    let sc_0 = slice;
    let _percentage = sc_0.loadUintBig(256);
    return { $$type: 'RemoveLiquidityPayload' as const, percentage: _percentage };
}

function loadTupleRemoveLiquidityPayload(source: TupleReader) {
    let _percentage = source.readBigNumber();
    return { $$type: 'RemoveLiquidityPayload' as const, percentage: _percentage };
}

function loadGetterTupleRemoveLiquidityPayload(source: TupleReader) {
    let _percentage = source.readBigNumber();
    return { $$type: 'RemoveLiquidityPayload' as const, percentage: _percentage };
}

function storeTupleRemoveLiquidityPayload(source: RemoveLiquidityPayload) {
    let builder = new TupleBuilder();
    builder.writeNumber(source.percentage);
    return builder.build();
}

function dictValueParserRemoveLiquidityPayload(): DictionaryValue<RemoveLiquidityPayload> {
    return {
        serialize: (src, builder) => {
            builder.storeRef(beginCell().store(storeRemoveLiquidityPayload(src)).endCell());
        },
        parse: (src) => {
            return loadRemoveLiquidityPayload(src.loadRef().beginParse());
        }
    }
}

export type TransferNotificationPayload = {
    $$type: 'TransferNotificationPayload';
    op: bigint;
    token_wallet: Address;
    refund_address: Address;
    excesses_address: Address;
    deadline: bigint;
    additional_data: Slice;
}

export function storeTransferNotificationPayload(src: TransferNotificationPayload) {
    return (builder: Builder) => {
        let b_0 = builder;
        b_0.storeUint(src.op, 32);
        b_0.storeAddress(src.token_wallet);
        b_0.storeAddress(src.refund_address);
        b_0.storeAddress(src.excesses_address);
        b_0.storeUint(src.deadline, 64);
        b_0.storeRef(src.additional_data.asCell());
    };
}

export function loadTransferNotificationPayload(slice: Slice) {
    let sc_0 = slice;
    let _op = sc_0.loadUintBig(32);
    let _token_wallet = sc_0.loadAddress();
    let _refund_address = sc_0.loadAddress();
    let _excesses_address = sc_0.loadAddress();
    let _deadline = sc_0.loadUintBig(64);
    let _additional_data = sc_0.loadRef().asSlice();
    return { $$type: 'TransferNotificationPayload' as const, op: _op, token_wallet: _token_wallet, refund_address: _refund_address, excesses_address: _excesses_address, deadline: _deadline, additional_data: _additional_data };
}

function loadTupleTransferNotificationPayload(source: TupleReader) {
    let _op = source.readBigNumber();
    let _token_wallet = source.readAddress();
    let _refund_address = source.readAddress();
    let _excesses_address = source.readAddress();
    let _deadline = source.readBigNumber();
    let _additional_data = source.readCell().asSlice();
    return { $$type: 'TransferNotificationPayload' as const, op: _op, token_wallet: _token_wallet, refund_address: _refund_address, excesses_address: _excesses_address, deadline: _deadline, additional_data: _additional_data };
}

function loadGetterTupleTransferNotificationPayload(source: TupleReader) {
    let _op = source.readBigNumber();
    let _token_wallet = source.readAddress();
    let _refund_address = source.readAddress();
    let _excesses_address = source.readAddress();
    let _deadline = source.readBigNumber();
    let _additional_data = source.readCell().asSlice();
    return { $$type: 'TransferNotificationPayload' as const, op: _op, token_wallet: _token_wallet, refund_address: _refund_address, excesses_address: _excesses_address, deadline: _deadline, additional_data: _additional_data };
}

function storeTupleTransferNotificationPayload(source: TransferNotificationPayload) {
    let builder = new TupleBuilder();
    builder.writeNumber(source.op);
    builder.writeAddress(source.token_wallet);
    builder.writeAddress(source.refund_address);
    builder.writeAddress(source.excesses_address);
    builder.writeNumber(source.deadline);
    builder.writeSlice(source.additional_data.asCell());
    return builder.build();
}

function dictValueParserTransferNotificationPayload(): DictionaryValue<TransferNotificationPayload> {
    return {
        serialize: (src, builder) => {
            builder.storeRef(beginCell().store(storeTransferNotificationPayload(src)).endCell());
        },
        parse: (src) => {
            return loadTransferNotificationPayload(src.loadRef().beginParse());
        }
    }
}

export type ProvideLPPayload = {
    $$type: 'ProvideLPPayload';
    min_out: bigint;
    receiver_address: Address;
    lower_price: bigint;
    upper_price: bigint;
}

export function storeProvideLPPayload(src: ProvideLPPayload) {
    return (builder: Builder) => {
        let b_0 = builder;
        b_0.storeInt(src.min_out, 257);
        b_0.storeAddress(src.receiver_address);
        b_0.storeUint(src.lower_price, 256);
        let b_1 = new Builder();
        b_1.storeUint(src.upper_price, 256);
        b_0.storeRef(b_1.endCell());
    };
}

export function loadProvideLPPayload(slice: Slice) {
    let sc_0 = slice;
    let _min_out = sc_0.loadIntBig(257);
    let _receiver_address = sc_0.loadAddress();
    let _lower_price = sc_0.loadUintBig(256);
    let sc_1 = sc_0.loadRef().beginParse();
    let _upper_price = sc_1.loadUintBig(256);
    return { $$type: 'ProvideLPPayload' as const, min_out: _min_out, receiver_address: _receiver_address, lower_price: _lower_price, upper_price: _upper_price };
}

function loadTupleProvideLPPayload(source: TupleReader) {
    let _min_out = source.readBigNumber();
    let _receiver_address = source.readAddress();
    let _lower_price = source.readBigNumber();
    let _upper_price = source.readBigNumber();
    return { $$type: 'ProvideLPPayload' as const, min_out: _min_out, receiver_address: _receiver_address, lower_price: _lower_price, upper_price: _upper_price };
}

function loadGetterTupleProvideLPPayload(source: TupleReader) {
    let _min_out = source.readBigNumber();
    let _receiver_address = source.readAddress();
    let _lower_price = source.readBigNumber();
    let _upper_price = source.readBigNumber();
    return { $$type: 'ProvideLPPayload' as const, min_out: _min_out, receiver_address: _receiver_address, lower_price: _lower_price, upper_price: _upper_price };
}

function storeTupleProvideLPPayload(source: ProvideLPPayload) {
    let builder = new TupleBuilder();
    builder.writeNumber(source.min_out);
    builder.writeAddress(source.receiver_address);
    builder.writeNumber(source.lower_price);
    builder.writeNumber(source.upper_price);
    return builder.build();
}

function dictValueParserProvideLPPayload(): DictionaryValue<ProvideLPPayload> {
    return {
        serialize: (src, builder) => {
            builder.storeRef(beginCell().store(storeProvideLPPayload(src)).endCell());
        },
        parse: (src) => {
            return loadProvideLPPayload(src.loadRef().beginParse());
        }
    }
}

export type SwapPayload = {
    $$type: 'SwapPayload';
    min_out: bigint;
    receiver_address: Address;
}

export function storeSwapPayload(src: SwapPayload) {
    return (builder: Builder) => {
        let b_0 = builder;
        b_0.storeInt(src.min_out, 257);
        b_0.storeAddress(src.receiver_address);
    };
}

export function loadSwapPayload(slice: Slice) {
    let sc_0 = slice;
    let _min_out = sc_0.loadIntBig(257);
    let _receiver_address = sc_0.loadAddress();
    return { $$type: 'SwapPayload' as const, min_out: _min_out, receiver_address: _receiver_address };
}

function loadTupleSwapPayload(source: TupleReader) {
    let _min_out = source.readBigNumber();
    let _receiver_address = source.readAddress();
    return { $$type: 'SwapPayload' as const, min_out: _min_out, receiver_address: _receiver_address };
}

function loadGetterTupleSwapPayload(source: TupleReader) {
    let _min_out = source.readBigNumber();
    let _receiver_address = source.readAddress();
    return { $$type: 'SwapPayload' as const, min_out: _min_out, receiver_address: _receiver_address };
}

function storeTupleSwapPayload(source: SwapPayload) {
    let builder = new TupleBuilder();
    builder.writeNumber(source.min_out);
    builder.writeAddress(source.receiver_address);
    return builder.build();
}

function dictValueParserSwapPayload(): DictionaryValue<SwapPayload> {
    return {
        serialize: (src, builder) => {
            builder.storeRef(beginCell().store(storeSwapPayload(src)).endCell());
        },
        parse: (src) => {
            return loadSwapPayload(src.loadRef().beginParse());
        }
    }
}

export type LiquidityInBins = {
    $$type: 'LiquidityInBins';
    binId: bigint;
    liquidity: bigint;
    feeCheckpoint: bigint;
}

export function storeLiquidityInBins(src: LiquidityInBins) {
    return (builder: Builder) => {
        let b_0 = builder;
        b_0.storeUint(src.binId, 256);
        b_0.storeUint(src.liquidity, 256);
        b_0.storeUint(src.feeCheckpoint, 256);
    };
}

export function loadLiquidityInBins(slice: Slice) {
    let sc_0 = slice;
    let _binId = sc_0.loadUintBig(256);
    let _liquidity = sc_0.loadUintBig(256);
    let _feeCheckpoint = sc_0.loadUintBig(256);
    return { $$type: 'LiquidityInBins' as const, binId: _binId, liquidity: _liquidity, feeCheckpoint: _feeCheckpoint };
}

function loadTupleLiquidityInBins(source: TupleReader) {
    let _binId = source.readBigNumber();
    let _liquidity = source.readBigNumber();
    let _feeCheckpoint = source.readBigNumber();
    return { $$type: 'LiquidityInBins' as const, binId: _binId, liquidity: _liquidity, feeCheckpoint: _feeCheckpoint };
}

function loadGetterTupleLiquidityInBins(source: TupleReader) {
    let _binId = source.readBigNumber();
    let _liquidity = source.readBigNumber();
    let _feeCheckpoint = source.readBigNumber();
    return { $$type: 'LiquidityInBins' as const, binId: _binId, liquidity: _liquidity, feeCheckpoint: _feeCheckpoint };
}

function storeTupleLiquidityInBins(source: LiquidityInBins) {
    let builder = new TupleBuilder();
    builder.writeNumber(source.binId);
    builder.writeNumber(source.liquidity);
    builder.writeNumber(source.feeCheckpoint);
    return builder.build();
}

function dictValueParserLiquidityInBins(): DictionaryValue<LiquidityInBins> {
    return {
        serialize: (src, builder) => {
            builder.storeRef(beginCell().store(storeLiquidityInBins(src)).endCell());
        },
        parse: (src) => {
            return loadLiquidityInBins(src.loadRef().beginParse());
        }
    }
}

export type LiquidityPosition = {
    $$type: 'LiquidityPosition';
    lowerPrice: bigint;
    upperPrice: bigint;
    liquidity: bigint;
    liquidityInfo: Dictionary<bigint, LiquidityInBins>;
    tokensOwedX: bigint;
    tokensOwedY: bigint;
    partial: boolean;
}

export function storeLiquidityPosition(src: LiquidityPosition) {
    return (builder: Builder) => {
        let b_0 = builder;
        b_0.storeUint(src.lowerPrice, 256);
        b_0.storeUint(src.upperPrice, 256);
        b_0.storeUint(src.liquidity, 256);
        b_0.storeDict(src.liquidityInfo, Dictionary.Keys.BigInt(257), dictValueParserLiquidityInBins());
        let b_1 = new Builder();
        b_1.storeUint(src.tokensOwedX, 256);
        b_1.storeUint(src.tokensOwedY, 256);
        b_1.storeBit(src.partial);
        b_0.storeRef(b_1.endCell());
    };
}

export function loadLiquidityPosition(slice: Slice) {
    let sc_0 = slice;
    let _lowerPrice = sc_0.loadUintBig(256);
    let _upperPrice = sc_0.loadUintBig(256);
    let _liquidity = sc_0.loadUintBig(256);
    let _liquidityInfo = Dictionary.load(Dictionary.Keys.BigInt(257), dictValueParserLiquidityInBins(), sc_0);
    let sc_1 = sc_0.loadRef().beginParse();
    let _tokensOwedX = sc_1.loadUintBig(256);
    let _tokensOwedY = sc_1.loadUintBig(256);
    let _partial = sc_1.loadBit();
    return { $$type: 'LiquidityPosition' as const, lowerPrice: _lowerPrice, upperPrice: _upperPrice, liquidity: _liquidity, liquidityInfo: _liquidityInfo, tokensOwedX: _tokensOwedX, tokensOwedY: _tokensOwedY, partial: _partial };
}

function loadTupleLiquidityPosition(source: TupleReader) {
    let _lowerPrice = source.readBigNumber();
    let _upperPrice = source.readBigNumber();
    let _liquidity = source.readBigNumber();
    let _liquidityInfo = Dictionary.loadDirect(Dictionary.Keys.BigInt(257), dictValueParserLiquidityInBins(), source.readCellOpt());
    let _tokensOwedX = source.readBigNumber();
    let _tokensOwedY = source.readBigNumber();
    let _partial = source.readBoolean();
    return { $$type: 'LiquidityPosition' as const, lowerPrice: _lowerPrice, upperPrice: _upperPrice, liquidity: _liquidity, liquidityInfo: _liquidityInfo, tokensOwedX: _tokensOwedX, tokensOwedY: _tokensOwedY, partial: _partial };
}

function loadGetterTupleLiquidityPosition(source: TupleReader) {
    let _lowerPrice = source.readBigNumber();
    let _upperPrice = source.readBigNumber();
    let _liquidity = source.readBigNumber();
    let _liquidityInfo = Dictionary.loadDirect(Dictionary.Keys.BigInt(257), dictValueParserLiquidityInBins(), source.readCellOpt());
    let _tokensOwedX = source.readBigNumber();
    let _tokensOwedY = source.readBigNumber();
    let _partial = source.readBoolean();
    return { $$type: 'LiquidityPosition' as const, lowerPrice: _lowerPrice, upperPrice: _upperPrice, liquidity: _liquidity, liquidityInfo: _liquidityInfo, tokensOwedX: _tokensOwedX, tokensOwedY: _tokensOwedY, partial: _partial };
}

function storeTupleLiquidityPosition(source: LiquidityPosition) {
    let builder = new TupleBuilder();
    builder.writeNumber(source.lowerPrice);
    builder.writeNumber(source.upperPrice);
    builder.writeNumber(source.liquidity);
    builder.writeCell(source.liquidityInfo.size > 0 ? beginCell().storeDictDirect(source.liquidityInfo, Dictionary.Keys.BigInt(257), dictValueParserLiquidityInBins()).endCell() : null);
    builder.writeNumber(source.tokensOwedX);
    builder.writeNumber(source.tokensOwedY);
    builder.writeBoolean(source.partial);
    return builder.build();
}

function dictValueParserLiquidityPosition(): DictionaryValue<LiquidityPosition> {
    return {
        serialize: (src, builder) => {
            builder.storeRef(beginCell().store(storeLiquidityPosition(src)).endCell());
        },
        parse: (src) => {
            return loadLiquidityPosition(src.loadRef().beginParse());
        }
    }
}

export type LiquidityBin = {
    $$type: 'LiquidityBin';
    lowerPrice: bigint;
    upperPrice: bigint;
    liquidity: bigint;
    feePerLiquidity: bigint;
}

export function storeLiquidityBin(src: LiquidityBin) {
    return (builder: Builder) => {
        let b_0 = builder;
        b_0.storeUint(src.lowerPrice, 256);
        b_0.storeUint(src.upperPrice, 256);
        b_0.storeUint(src.liquidity, 256);
        let b_1 = new Builder();
        b_1.storeUint(src.feePerLiquidity, 256);
        b_0.storeRef(b_1.endCell());
    };
}

export function loadLiquidityBin(slice: Slice) {
    let sc_0 = slice;
    let _lowerPrice = sc_0.loadUintBig(256);
    let _upperPrice = sc_0.loadUintBig(256);
    let _liquidity = sc_0.loadUintBig(256);
    let sc_1 = sc_0.loadRef().beginParse();
    let _feePerLiquidity = sc_1.loadUintBig(256);
    return { $$type: 'LiquidityBin' as const, lowerPrice: _lowerPrice, upperPrice: _upperPrice, liquidity: _liquidity, feePerLiquidity: _feePerLiquidity };
}

function loadTupleLiquidityBin(source: TupleReader) {
    let _lowerPrice = source.readBigNumber();
    let _upperPrice = source.readBigNumber();
    let _liquidity = source.readBigNumber();
    let _feePerLiquidity = source.readBigNumber();
    return { $$type: 'LiquidityBin' as const, lowerPrice: _lowerPrice, upperPrice: _upperPrice, liquidity: _liquidity, feePerLiquidity: _feePerLiquidity };
}

function loadGetterTupleLiquidityBin(source: TupleReader) {
    let _lowerPrice = source.readBigNumber();
    let _upperPrice = source.readBigNumber();
    let _liquidity = source.readBigNumber();
    let _feePerLiquidity = source.readBigNumber();
    return { $$type: 'LiquidityBin' as const, lowerPrice: _lowerPrice, upperPrice: _upperPrice, liquidity: _liquidity, feePerLiquidity: _feePerLiquidity };
}

function storeTupleLiquidityBin(source: LiquidityBin) {
    let builder = new TupleBuilder();
    builder.writeNumber(source.lowerPrice);
    builder.writeNumber(source.upperPrice);
    builder.writeNumber(source.liquidity);
    builder.writeNumber(source.feePerLiquidity);
    return builder.build();
}

function dictValueParserLiquidityBin(): DictionaryValue<LiquidityBin> {
    return {
        serialize: (src, builder) => {
            builder.storeRef(beginCell().store(storeLiquidityBin(src)).endCell());
        },
        parse: (src) => {
            return loadLiquidityBin(src.loadRef().beginParse());
        }
    }
}

export type BinInfo = {
    $$type: 'BinInfo';
    binIndex: bigint;
    bin: LiquidityBin;
}

export function storeBinInfo(src: BinInfo) {
    return (builder: Builder) => {
        let b_0 = builder;
        b_0.storeUint(src.binIndex, 256);
        let b_1 = new Builder();
        b_1.store(storeLiquidityBin(src.bin));
        b_0.storeRef(b_1.endCell());
    };
}

export function loadBinInfo(slice: Slice) {
    let sc_0 = slice;
    let _binIndex = sc_0.loadUintBig(256);
    let sc_1 = sc_0.loadRef().beginParse();
    let _bin = loadLiquidityBin(sc_1);
    return { $$type: 'BinInfo' as const, binIndex: _binIndex, bin: _bin };
}

function loadTupleBinInfo(source: TupleReader) {
    let _binIndex = source.readBigNumber();
    const _bin = loadTupleLiquidityBin(source);
    return { $$type: 'BinInfo' as const, binIndex: _binIndex, bin: _bin };
}

function loadGetterTupleBinInfo(source: TupleReader) {
    let _binIndex = source.readBigNumber();
    const _bin = loadGetterTupleLiquidityBin(source);
    return { $$type: 'BinInfo' as const, binIndex: _binIndex, bin: _bin };
}

function storeTupleBinInfo(source: BinInfo) {
    let builder = new TupleBuilder();
    builder.writeNumber(source.binIndex);
    builder.writeTuple(storeTupleLiquidityBin(source.bin));
    return builder.build();
}

function dictValueParserBinInfo(): DictionaryValue<BinInfo> {
    return {
        serialize: (src, builder) => {
            builder.storeRef(beginCell().store(storeBinInfo(src)).endCell());
        },
        parse: (src) => {
            return loadBinInfo(src.loadRef().beginParse());
        }
    }
}

export type JettonWalletData = {
    $$type: 'JettonWalletData';
    balance: bigint;
    ownerAddress: Address;
    jettonMasterAddress: Address;
    jettonWalletCode: Cell;
}

export function storeJettonWalletData(src: JettonWalletData) {
    return (builder: Builder) => {
        let b_0 = builder;
        b_0.storeCoins(src.balance);
        b_0.storeAddress(src.ownerAddress);
        b_0.storeAddress(src.jettonMasterAddress);
        b_0.storeRef(src.jettonWalletCode);
    };
}

export function loadJettonWalletData(slice: Slice) {
    let sc_0 = slice;
    let _balance = sc_0.loadCoins();
    let _ownerAddress = sc_0.loadAddress();
    let _jettonMasterAddress = sc_0.loadAddress();
    let _jettonWalletCode = sc_0.loadRef();
    return { $$type: 'JettonWalletData' as const, balance: _balance, ownerAddress: _ownerAddress, jettonMasterAddress: _jettonMasterAddress, jettonWalletCode: _jettonWalletCode };
}

function loadTupleJettonWalletData(source: TupleReader) {
    let _balance = source.readBigNumber();
    let _ownerAddress = source.readAddress();
    let _jettonMasterAddress = source.readAddress();
    let _jettonWalletCode = source.readCell();
    return { $$type: 'JettonWalletData' as const, balance: _balance, ownerAddress: _ownerAddress, jettonMasterAddress: _jettonMasterAddress, jettonWalletCode: _jettonWalletCode };
}

function loadGetterTupleJettonWalletData(source: TupleReader) {
    let _balance = source.readBigNumber();
    let _ownerAddress = source.readAddress();
    let _jettonMasterAddress = source.readAddress();
    let _jettonWalletCode = source.readCell();
    return { $$type: 'JettonWalletData' as const, balance: _balance, ownerAddress: _ownerAddress, jettonMasterAddress: _jettonMasterAddress, jettonWalletCode: _jettonWalletCode };
}

function storeTupleJettonWalletData(source: JettonWalletData) {
    let builder = new TupleBuilder();
    builder.writeNumber(source.balance);
    builder.writeAddress(source.ownerAddress);
    builder.writeAddress(source.jettonMasterAddress);
    builder.writeCell(source.jettonWalletCode);
    return builder.build();
}

function dictValueParserJettonWalletData(): DictionaryValue<JettonWalletData> {
    return {
        serialize: (src, builder) => {
            builder.storeRef(beginCell().store(storeJettonWalletData(src)).endCell());
        },
        parse: (src) => {
            return loadJettonWalletData(src.loadRef().beginParse());
        }
    }
}

export type AMM$Data = {
    $$type: 'AMM$Data';
    currentPrice: bigint;
    binWidth: bigint;
    bins: Dictionary<bigint, LiquidityBin>;
    positions: Dictionary<Address, LiquidityPosition>;
    fee: bigint;
    tokenXReserve: bigint;
    tokenYReserve: bigint;
    tokenX: Address;
    tokenY: Address;
    owner: Address;
    tokenXDecimals: bigint;
    tokenYDecimals: bigint;
    tokenXWalletCode: Cell;
    tokenYWalletCode: Cell;
}

export function storeAMM$Data(src: AMM$Data) {
    return (builder: Builder) => {
        let b_0 = builder;
        b_0.storeUint(src.currentPrice, 256);
        b_0.storeUint(src.binWidth, 256);
        b_0.storeDict(src.bins, Dictionary.Keys.BigInt(257), dictValueParserLiquidityBin());
        b_0.storeDict(src.positions, Dictionary.Keys.Address(), dictValueParserLiquidityPosition());
        b_0.storeUint(src.fee, 256);
        let b_1 = new Builder();
        b_1.storeUint(src.tokenXReserve, 256);
        b_1.storeUint(src.tokenYReserve, 256);
        b_1.storeAddress(src.tokenX);
        let b_2 = new Builder();
        b_2.storeAddress(src.tokenY);
        b_2.storeAddress(src.owner);
        b_2.storeUint(src.tokenXDecimals, 256);
        let b_3 = new Builder();
        b_3.storeUint(src.tokenYDecimals, 256);
        b_3.storeRef(src.tokenXWalletCode);
        b_3.storeRef(src.tokenYWalletCode);
        b_2.storeRef(b_3.endCell());
        b_1.storeRef(b_2.endCell());
        b_0.storeRef(b_1.endCell());
    };
}

export function loadAMM$Data(slice: Slice) {
    let sc_0 = slice;
    let _currentPrice = sc_0.loadUintBig(256);
    let _binWidth = sc_0.loadUintBig(256);
    let _bins = Dictionary.load(Dictionary.Keys.BigInt(257), dictValueParserLiquidityBin(), sc_0);
    let _positions = Dictionary.load(Dictionary.Keys.Address(), dictValueParserLiquidityPosition(), sc_0);
    let _fee = sc_0.loadUintBig(256);
    let sc_1 = sc_0.loadRef().beginParse();
    let _tokenXReserve = sc_1.loadUintBig(256);
    let _tokenYReserve = sc_1.loadUintBig(256);
    let _tokenX = sc_1.loadAddress();
    let sc_2 = sc_1.loadRef().beginParse();
    let _tokenY = sc_2.loadAddress();
    let _owner = sc_2.loadAddress();
    let _tokenXDecimals = sc_2.loadUintBig(256);
    let sc_3 = sc_2.loadRef().beginParse();
    let _tokenYDecimals = sc_3.loadUintBig(256);
    let _tokenXWalletCode = sc_3.loadRef();
    let _tokenYWalletCode = sc_3.loadRef();
    return { $$type: 'AMM$Data' as const, currentPrice: _currentPrice, binWidth: _binWidth, bins: _bins, positions: _positions, fee: _fee, tokenXReserve: _tokenXReserve, tokenYReserve: _tokenYReserve, tokenX: _tokenX, tokenY: _tokenY, owner: _owner, tokenXDecimals: _tokenXDecimals, tokenYDecimals: _tokenYDecimals, tokenXWalletCode: _tokenXWalletCode, tokenYWalletCode: _tokenYWalletCode };
}

function loadTupleAMM$Data(source: TupleReader) {
    let _currentPrice = source.readBigNumber();
    let _binWidth = source.readBigNumber();
    let _bins = Dictionary.loadDirect(Dictionary.Keys.BigInt(257), dictValueParserLiquidityBin(), source.readCellOpt());
    let _positions = Dictionary.loadDirect(Dictionary.Keys.Address(), dictValueParserLiquidityPosition(), source.readCellOpt());
    let _fee = source.readBigNumber();
    let _tokenXReserve = source.readBigNumber();
    let _tokenYReserve = source.readBigNumber();
    let _tokenX = source.readAddress();
    let _tokenY = source.readAddress();
    let _owner = source.readAddress();
    let _tokenXDecimals = source.readBigNumber();
    let _tokenYDecimals = source.readBigNumber();
    let _tokenXWalletCode = source.readCell();
    let _tokenYWalletCode = source.readCell();
    return { $$type: 'AMM$Data' as const, currentPrice: _currentPrice, binWidth: _binWidth, bins: _bins, positions: _positions, fee: _fee, tokenXReserve: _tokenXReserve, tokenYReserve: _tokenYReserve, tokenX: _tokenX, tokenY: _tokenY, owner: _owner, tokenXDecimals: _tokenXDecimals, tokenYDecimals: _tokenYDecimals, tokenXWalletCode: _tokenXWalletCode, tokenYWalletCode: _tokenYWalletCode };
}

function loadGetterTupleAMM$Data(source: TupleReader) {
    let _currentPrice = source.readBigNumber();
    let _binWidth = source.readBigNumber();
    let _bins = Dictionary.loadDirect(Dictionary.Keys.BigInt(257), dictValueParserLiquidityBin(), source.readCellOpt());
    let _positions = Dictionary.loadDirect(Dictionary.Keys.Address(), dictValueParserLiquidityPosition(), source.readCellOpt());
    let _fee = source.readBigNumber();
    let _tokenXReserve = source.readBigNumber();
    let _tokenYReserve = source.readBigNumber();
    let _tokenX = source.readAddress();
    let _tokenY = source.readAddress();
    let _owner = source.readAddress();
    let _tokenXDecimals = source.readBigNumber();
    let _tokenYDecimals = source.readBigNumber();
    let _tokenXWalletCode = source.readCell();
    let _tokenYWalletCode = source.readCell();
    return { $$type: 'AMM$Data' as const, currentPrice: _currentPrice, binWidth: _binWidth, bins: _bins, positions: _positions, fee: _fee, tokenXReserve: _tokenXReserve, tokenYReserve: _tokenYReserve, tokenX: _tokenX, tokenY: _tokenY, owner: _owner, tokenXDecimals: _tokenXDecimals, tokenYDecimals: _tokenYDecimals, tokenXWalletCode: _tokenXWalletCode, tokenYWalletCode: _tokenYWalletCode };
}

function storeTupleAMM$Data(source: AMM$Data) {
    let builder = new TupleBuilder();
    builder.writeNumber(source.currentPrice);
    builder.writeNumber(source.binWidth);
    builder.writeCell(source.bins.size > 0 ? beginCell().storeDictDirect(source.bins, Dictionary.Keys.BigInt(257), dictValueParserLiquidityBin()).endCell() : null);
    builder.writeCell(source.positions.size > 0 ? beginCell().storeDictDirect(source.positions, Dictionary.Keys.Address(), dictValueParserLiquidityPosition()).endCell() : null);
    builder.writeNumber(source.fee);
    builder.writeNumber(source.tokenXReserve);
    builder.writeNumber(source.tokenYReserve);
    builder.writeAddress(source.tokenX);
    builder.writeAddress(source.tokenY);
    builder.writeAddress(source.owner);
    builder.writeNumber(source.tokenXDecimals);
    builder.writeNumber(source.tokenYDecimals);
    builder.writeCell(source.tokenXWalletCode);
    builder.writeCell(source.tokenYWalletCode);
    return builder.build();
}

function dictValueParserAMM$Data(): DictionaryValue<AMM$Data> {
    return {
        serialize: (src, builder) => {
            builder.storeRef(beginCell().store(storeAMM$Data(src)).endCell());
        },
        parse: (src) => {
            return loadAMM$Data(src.loadRef().beginParse());
        }
    }
}

 type AMM_init_args = {
    $$type: 'AMM_init_args';
}

function initAMM_init_args(src: AMM_init_args) {
    return (builder: Builder) => {
        let b_0 = builder;
    };
}

async function AMM_init() {
    const __code = Cell.fromBase64('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');
    const __system = Cell.fromBase64('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');
    let builder = beginCell();
    builder.storeRef(__system);
    builder.storeUint(0, 1);
    initAMM_init_args({ $$type: 'AMM_init_args' })(builder);
    const __data = builder.endCell();
    return { code: __code, data: __data };
}

const AMM_errors: { [key: number]: { message: string } } = {
    2: { message: `Stack underflow` },
    3: { message: `Stack overflow` },
    4: { message: `Integer overflow` },
    5: { message: `Integer out of expected range` },
    6: { message: `Invalid opcode` },
    7: { message: `Type check error` },
    8: { message: `Cell overflow` },
    9: { message: `Cell underflow` },
    10: { message: `Dictionary error` },
    11: { message: `'Unknown' error` },
    12: { message: `Fatal error` },
    13: { message: `Out of gas error` },
    14: { message: `Virtualization error` },
    32: { message: `Action list is invalid` },
    33: { message: `Action list is too long` },
    34: { message: `Action is invalid or not supported` },
    35: { message: `Invalid source address in outbound message` },
    36: { message: `Invalid destination address in outbound message` },
    37: { message: `Not enough TON` },
    38: { message: `Not enough extra-currencies` },
    39: { message: `Outbound message does not fit into a cell after rewriting` },
    40: { message: `Cannot process a message` },
    41: { message: `Library reference is null` },
    42: { message: `Library change action error` },
    43: { message: `Exceeded maximum number of cells in the library or the maximum depth of the Merkle tree` },
    50: { message: `Account state size exceeded limits` },
    128: { message: `Null reference exception` },
    129: { message: `Invalid serialization prefix` },
    130: { message: `Invalid incoming message` },
    131: { message: `Constraints error` },
    132: { message: `Access denied` },
    133: { message: `Contract stopped` },
    134: { message: `Invalid argument` },
    135: { message: `Code of a contract was not found` },
    136: { message: `Invalid address` },
    137: { message: `Masterchain support is not enabled for this contract` },
    8965: { message: `Transferred amount must be greater than zero` },
    10783: { message: `Deadline has passed` },
    18156: { message: `Negative number` },
    21157: { message: `Overflow` },
    30573: { message: `No liquidity deposited previously` },
    40557: { message: `Lower price must be less than upper price` },
    41917: { message: `Invalid token wallet address` },
    53350: { message: `Amount must be greater than zero` },
}

const AMM_types: ABIType[] = [
    {"name":"StateInit","header":null,"fields":[{"name":"code","type":{"kind":"simple","type":"cell","optional":false}},{"name":"data","type":{"kind":"simple","type":"cell","optional":false}}]},
    {"name":"StdAddress","header":null,"fields":[{"name":"workchain","type":{"kind":"simple","type":"int","optional":false,"format":8}},{"name":"address","type":{"kind":"simple","type":"uint","optional":false,"format":256}}]},
    {"name":"VarAddress","header":null,"fields":[{"name":"workchain","type":{"kind":"simple","type":"int","optional":false,"format":32}},{"name":"address","type":{"kind":"simple","type":"slice","optional":false}}]},
    {"name":"Context","header":null,"fields":[{"name":"bounced","type":{"kind":"simple","type":"bool","optional":false}},{"name":"sender","type":{"kind":"simple","type":"address","optional":false}},{"name":"value","type":{"kind":"simple","type":"int","optional":false,"format":257}},{"name":"raw","type":{"kind":"simple","type":"slice","optional":false}}]},
    {"name":"SendParameters","header":null,"fields":[{"name":"bounce","type":{"kind":"simple","type":"bool","optional":false}},{"name":"to","type":{"kind":"simple","type":"address","optional":false}},{"name":"value","type":{"kind":"simple","type":"int","optional":false,"format":257}},{"name":"mode","type":{"kind":"simple","type":"int","optional":false,"format":257}},{"name":"body","type":{"kind":"simple","type":"cell","optional":true}},{"name":"code","type":{"kind":"simple","type":"cell","optional":true}},{"name":"data","type":{"kind":"simple","type":"cell","optional":true}}]},
    {"name":"Deploy","header":2490013878,"fields":[{"name":"queryId","type":{"kind":"simple","type":"uint","optional":false,"format":64}}]},
    {"name":"DeployOk","header":2952335191,"fields":[{"name":"queryId","type":{"kind":"simple","type":"uint","optional":false,"format":64}}]},
    {"name":"FactoryDeploy","header":1829761339,"fields":[{"name":"queryId","type":{"kind":"simple","type":"uint","optional":false,"format":64}},{"name":"cashback","type":{"kind":"simple","type":"address","optional":false}}]},
    {"name":"TransferNotification","header":3414571288,"fields":[{"name":"query_id","type":{"kind":"simple","type":"uint","optional":false,"format":64}},{"name":"jetton_amount","type":{"kind":"simple","type":"uint","optional":false,"format":128}},{"name":"sender","type":{"kind":"simple","type":"address","optional":false}},{"name":"payload","type":{"kind":"simple","type":"slice","optional":false}}]},
    {"name":"RemoveLiquidity","header":2576943485,"fields":[{"name":"query_id","type":{"kind":"simple","type":"uint","optional":false,"format":64}},{"name":"sender","type":{"kind":"simple","type":"address","optional":false}},{"name":"payload","type":{"kind":"simple","type":"slice","optional":false}}]},
    {"name":"JettonTransfer","header":260734629,"fields":[{"name":"queryId","type":{"kind":"simple","type":"uint","optional":false,"format":64}},{"name":"amount","type":{"kind":"simple","type":"uint","optional":false,"format":"coins"}},{"name":"destination","type":{"kind":"simple","type":"address","optional":false}},{"name":"responseDestination","type":{"kind":"simple","type":"address","optional":true}},{"name":"customPayload","type":{"kind":"simple","type":"cell","optional":true}},{"name":"forwardTonAmount","type":{"kind":"simple","type":"uint","optional":false,"format":"coins"}},{"name":"forwardPayload","type":{"kind":"simple","type":"slice","optional":false,"format":"remainder"}}]},
    {"name":"RemoveLiquidityPayload","header":null,"fields":[{"name":"percentage","type":{"kind":"simple","type":"uint","optional":false,"format":256}}]},
    {"name":"TransferNotificationPayload","header":null,"fields":[{"name":"op","type":{"kind":"simple","type":"uint","optional":false,"format":32}},{"name":"token_wallet","type":{"kind":"simple","type":"address","optional":false}},{"name":"refund_address","type":{"kind":"simple","type":"address","optional":false}},{"name":"excesses_address","type":{"kind":"simple","type":"address","optional":false}},{"name":"deadline","type":{"kind":"simple","type":"uint","optional":false,"format":64}},{"name":"additional_data","type":{"kind":"simple","type":"slice","optional":false}}]},
    {"name":"ProvideLPPayload","header":null,"fields":[{"name":"min_out","type":{"kind":"simple","type":"int","optional":false,"format":257}},{"name":"receiver_address","type":{"kind":"simple","type":"address","optional":false}},{"name":"lower_price","type":{"kind":"simple","type":"uint","optional":false,"format":256}},{"name":"upper_price","type":{"kind":"simple","type":"uint","optional":false,"format":256}}]},
    {"name":"SwapPayload","header":null,"fields":[{"name":"min_out","type":{"kind":"simple","type":"int","optional":false,"format":257}},{"name":"receiver_address","type":{"kind":"simple","type":"address","optional":false}}]},
    {"name":"LiquidityInBins","header":null,"fields":[{"name":"binId","type":{"kind":"simple","type":"uint","optional":false,"format":256}},{"name":"liquidity","type":{"kind":"simple","type":"uint","optional":false,"format":256}},{"name":"feeCheckpoint","type":{"kind":"simple","type":"uint","optional":false,"format":256}}]},
    {"name":"LiquidityPosition","header":null,"fields":[{"name":"lowerPrice","type":{"kind":"simple","type":"uint","optional":false,"format":256}},{"name":"upperPrice","type":{"kind":"simple","type":"uint","optional":false,"format":256}},{"name":"liquidity","type":{"kind":"simple","type":"uint","optional":false,"format":256}},{"name":"liquidityInfo","type":{"kind":"dict","key":"int","value":"LiquidityInBins","valueFormat":"ref"}},{"name":"tokensOwedX","type":{"kind":"simple","type":"uint","optional":false,"format":256}},{"name":"tokensOwedY","type":{"kind":"simple","type":"uint","optional":false,"format":256}},{"name":"partial","type":{"kind":"simple","type":"bool","optional":false}}]},
    {"name":"LiquidityBin","header":null,"fields":[{"name":"lowerPrice","type":{"kind":"simple","type":"uint","optional":false,"format":256}},{"name":"upperPrice","type":{"kind":"simple","type":"uint","optional":false,"format":256}},{"name":"liquidity","type":{"kind":"simple","type":"uint","optional":false,"format":256}},{"name":"feePerLiquidity","type":{"kind":"simple","type":"uint","optional":false,"format":256}}]},
    {"name":"BinInfo","header":null,"fields":[{"name":"binIndex","type":{"kind":"simple","type":"uint","optional":false,"format":256}},{"name":"bin","type":{"kind":"simple","type":"LiquidityBin","optional":false}}]},
    {"name":"JettonWalletData","header":null,"fields":[{"name":"balance","type":{"kind":"simple","type":"uint","optional":false,"format":"coins"}},{"name":"ownerAddress","type":{"kind":"simple","type":"address","optional":false}},{"name":"jettonMasterAddress","type":{"kind":"simple","type":"address","optional":false}},{"name":"jettonWalletCode","type":{"kind":"simple","type":"cell","optional":false}}]},
    {"name":"AMM$Data","header":null,"fields":[{"name":"currentPrice","type":{"kind":"simple","type":"uint","optional":false,"format":256}},{"name":"binWidth","type":{"kind":"simple","type":"uint","optional":false,"format":256}},{"name":"bins","type":{"kind":"dict","key":"int","value":"LiquidityBin","valueFormat":"ref"}},{"name":"positions","type":{"kind":"dict","key":"address","value":"LiquidityPosition","valueFormat":"ref"}},{"name":"fee","type":{"kind":"simple","type":"uint","optional":false,"format":256}},{"name":"tokenXReserve","type":{"kind":"simple","type":"uint","optional":false,"format":256}},{"name":"tokenYReserve","type":{"kind":"simple","type":"uint","optional":false,"format":256}},{"name":"tokenX","type":{"kind":"simple","type":"address","optional":false}},{"name":"tokenY","type":{"kind":"simple","type":"address","optional":false}},{"name":"owner","type":{"kind":"simple","type":"address","optional":false}},{"name":"tokenXDecimals","type":{"kind":"simple","type":"uint","optional":false,"format":256}},{"name":"tokenYDecimals","type":{"kind":"simple","type":"uint","optional":false,"format":256}},{"name":"tokenXWalletCode","type":{"kind":"simple","type":"cell","optional":false}},{"name":"tokenYWalletCode","type":{"kind":"simple","type":"cell","optional":false}}]},
]

const AMM_getters: ABIGetter[] = [
]

export const AMM_getterMapping: { [key: string]: string } = {
}

const AMM_receivers: ABIReceiver[] = [
    {"receiver":"internal","message":{"kind":"typed","type":"TransferNotification"}},
    {"receiver":"internal","message":{"kind":"typed","type":"RemoveLiquidity"}},
    {"receiver":"internal","message":{"kind":"typed","type":"Deploy"}},
]

export class AMM implements Contract {
    
    static async init() {
        return await AMM_init();
    }
    
    static async fromInit() {
        const init = await AMM_init();
        const address = contractAddress(0, init);
        return new AMM(address, init);
    }
    
    static fromAddress(address: Address) {
        return new AMM(address);
    }
    
    readonly address: Address; 
    readonly init?: { code: Cell, data: Cell };
    readonly abi: ContractABI = {
        types:  AMM_types,
        getters: AMM_getters,
        receivers: AMM_receivers,
        errors: AMM_errors,
    };
    
    private constructor(address: Address, init?: { code: Cell, data: Cell }) {
        this.address = address;
        this.init = init;
    }
    
    async send(provider: ContractProvider, via: Sender, args: { value: bigint, bounce?: boolean| null | undefined }, message: TransferNotification | RemoveLiquidity | Deploy) {
        
        let body: Cell | null = null;
        if (message && typeof message === 'object' && !(message instanceof Slice) && message.$$type === 'TransferNotification') {
            body = beginCell().store(storeTransferNotification(message)).endCell();
        }
        if (message && typeof message === 'object' && !(message instanceof Slice) && message.$$type === 'RemoveLiquidity') {
            body = beginCell().store(storeRemoveLiquidity(message)).endCell();
        }
        if (message && typeof message === 'object' && !(message instanceof Slice) && message.$$type === 'Deploy') {
            body = beginCell().store(storeDeploy(message)).endCell();
        }
        if (body === null) { throw new Error('Invalid message type'); }
        
        await provider.internal(via, { ...args, body: body });
        
    }
    
}