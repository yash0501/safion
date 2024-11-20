import "@stdlib/deploy";

message TransferNotification {
    query_id: Int as uint64;
    jetton_amount: Int as uint128;
    sender: Address;
    payload: Slice;
}

message RemoveLiquidity {
    query_id: Int as uint64;
    sender: Address;
    payload: Slice;
}

struct RemoveLiquidityPayload {
    percentage: Int as uint256;
}

struct TransferNotificationPayload {
    op: Int as uint32;             // Operation code (e.g., swap, provide_lp)
    token_wallet: Address;         // Address of the other Router token wallet
    refund_address: Address;       // Address for refund if operation fails
    excesses_address: Address;     // Address for TON excesses
    deadline: Int as uint64;       // Execution deadline for the transaction
    additional_data: Slice;        // Additional operation-specific data
}

struct ProvideLPPayload {
    min_out: Int;                 // Minimum required tokens to receive
    receiver_address: Address;    // Address where tokens will be sent
    fwd_gas: Int;                 // Forward gas
    custom_payload: Cell?;        // Optional custom payload
    refund_fwd_gas: Int;          // Gas for forwarding on refund
    refund_payload: Cell?;        // Optional refund payload
    ref_fee: Int as uint16;       // Referral fee
    referral_address: Address;    // Referral address
    lower_price: Int as uint256;  // Lower price
    upper_price: Int as uint256;  // Upper price
}

struct SwapPayload {
    min_out: Int;                 // Minimum required tokens to receive
    receiver_address: Address;    // Address where tokens will be sent
    fwd_gas: Int;                 // Forward gas
    custom_payload: Cell?;        // Optional custom payload
    refund_fwd_gas: Int;          // Gas for forwarding on refund
    refund_payload: Cell?;        // Optional refund payload
    ref_fee: Int as uint16;       // Referral fee
    referral_address: Address;    // Referral address
}

struct LiquidityInBins {
    binId: Int as uint256;
    liquidity: Int as uint256;
    feeCheckpoint: Int as uint256;
}

struct LiquidityPosition {
    lowerPrice: Int as uint256;
    upperPrice: Int as uint256;
    liquidity: Int as uint256;
    liquidityInfo: map<Int, LiquidityInBins>;
    tokensOwedX: Int as uint256;
    tokensOwedY: Int as uint256;
    partial: Bool = false;
}

struct LiquidityBin {
    lowerPrice: Int as uint256;
    upperPrice: Int as uint256;
    liquidity: Int as uint256;
    feePerLiquidity: Int as uint256;
}

struct BinInfo {
    binIndex: Int as uint256;
    bin: LiquidityBin;
}

contract AMM with Deployable {
    currentPrice: Int as uint256;
    binWidth: Int as uint256;
    bins: map<Int, LiquidityBin>;
    positions: map<Address, LiquidityPosition>;
    fee: Int as uint256;
    tokenXReserve: Int as uint256;
    tokenYReserve: Int as uint256;
    tokenX: Address;
    tokenY: Address;
    owner: Address;
    // globalFeeXAccumulator: Int as uint256;
    // globalFeeYAccumulator: Int as uint256;

    init() {
        self.currentPrice = 0;
        self.binWidth = 100;
        self.fee = 0;
        self.tokenXReserve = 0;
        self.tokenYReserve = 0;
        self.tokenX = address("EQCD39VS5jcptHL8vMjEXrzGaRcCVYto7HUn4bpAOg8xqB2N");
        self.tokenY = address("EQCD39VS5jcptHL8vMjEXrzGaRcCVYto7HUn4bpAOg8xqB2N");
        self.owner = sender();
    }

    // Receiver for TransferNotification messages
    receive(msg: TransferNotification) {
        require(msg.jetton_amount > 0, "Transferred amount must be greater than zero");

        // Extract and handle the operation (op) from the payload
        let payload: TransferNotificationPayload = TransferNotificationPayload.fromSlice(msg.payload);
        if (payload.op == 0) {
            // Swap operation
            let swapData: SwapPayload = SwapPayload.fromSlice(payload.additional_data);
            self.swap(msg, payload, swapData);
        } else if (payload.op == 1) {
            let provideLpData: ProvideLPPayload = ProvideLPPayload.fromSlice(payload.additional_data);
            // Provide LP operation
            self.provideLiquidity(msg, payload, provideLpData);
        } else {
            // Invalid operation
            require(false, "Invalid token wallet address");
        }
    }

    receive(msg: RemoveLiquidity) {
        // Remove liquidity
        // check if the sender has deposited liquidity previously or not
        let position: LiquidityPosition? = self.positions.get(sender());
        require(position != null, "No liquidity deposited previously");

        let payload: RemoveLiquidityPayload = RemoveLiquidityPayload.fromSlice(msg.payload);

        let pos: LiquidityPosition = position!!;
        self.removeLiquidity(msg, pos, payload);
    }

    fun removeLiquidity(msg: RemoveLiquidity, position: LiquidityPosition, payload: RemoveLiquidityPayload) {
        let priceGlobal: Int = self.getCurrentPrice();
        let totalXRemoved: Int = 0;
        let totalYRemoved: Int = 0;
        let totalFeeWithdrawn: Int = 0;

        foreach (key, value in position.liquidityInfo) {
            let bin: LiquidityBin = self.bins.get(key)!!;
            let liquidityInBin: LiquidityInBins = value;

            let liquidity: Int = liquidityInBin.liquidity;
            let feePerLiquidity: Int = bin.feePerLiquidity;
            let binLowerPrice: Int = bin.lowerPrice;
            let binUpperPrice: Int = bin.upperPrice;

            let sqrtBinLowerPrice = self.getSqrt(binLowerPrice);
            let sqrtBinUpperPrice = self.getSqrt(binUpperPrice);
            let sqrtGlobalPrice = self.getSqrt(priceGlobal);

            let liquidityToRemove: Int = liquidity * payload.percentage / 100;
            let feeCheckpoint: Int = liquidityInBin.feeCheckpoint;

            let xRemoved = 0;
            let yRemoved = 0;

            if (liquidityToRemove > 0) {
                if (priceGlobal < binLowerPrice) {
                    // only token X is used
                    xRemoved = liquidityToRemove * (sqrtBinUpperPrice - sqrtBinLowerPrice);
                    yRemoved = 0;
                } else if (priceGlobal > binUpperPrice) {
                    // only token Y is used
                    xRemoved = 0;
                    yRemoved = liquidityToRemove * (sqrtBinUpperPrice - sqrtBinLowerPrice);
                } else {
                    // both tokens are used
                    xRemoved = liquidityToRemove * (sqrtBinUpperPrice - sqrtGlobalPrice);
                    yRemoved = liquidityToRemove * (sqrtGlobalPrice - sqrtBinLowerPrice);
                }

                let feeWithdrawn: Int = liquidityToRemove * (feePerLiquidity - feeCheckpoint);
                totalXRemoved += xRemoved;
                totalYRemoved += yRemoved;
                totalFeeWithdrawn += feeWithdrawn;
            }
        }

        self.tokenXReserve -= totalXRemoved;
        self.tokenYReserve -= totalYRemoved;

        // send the removed tokens to the receiver
        // sendTokens(msg.sender, totalXRemoved);
        // sendTokens(msg.sender, totalYRemoved);
    }

    fun swap(msg: TransferNotification, payload: TransferNotificationPayload, swapData: SwapPayload) {
        // check which token is being swapped
        let tokenWallet: Address = payload.token_wallet;
        let isX: Bool = false;

        if tokenWallet == self.tokenX {
            isX = true;
        } else if tokenWallet == self.tokenY {
            isX = false;
        } else {
            require(false, "Invalid token wallet address");
        }

        if (isX) {
            // swap x for y
            self.swapXForY(msg.jetton_amount, swapData);
        }
        else {
            // swap y for x
            self.swapYForX(msg.jetton_amount, swapData);
        }
    }

    fun swapXForY(swapAmount: Int, swapData: SwapPayload) {
        let remainingAmount: Int = swapAmount;
        let priceGlobal: Int = self.getCurrentPrice();
        let totaldX: Int = 0;
        let totaldY: Int = 0;

        let done: Bool = false;

        while (remainingAmount > 0 && !done) {
            let binInfo: BinInfo = self.getOrCreateBin(priceGlobal);
            let bin: LiquidityBin = binInfo.bin;
            
            let effectiveSwap: Int = remainingAmount * (1000000 - self.fee) / 1000000;

            let deltaPrice: Int = effectiveSwap / bin.liquidity;
            let pNew = min(priceGlobal + deltaPrice, bin.upperPrice);

            let sqrtPNew = self.getSqrt(pNew);
            let sqrtPriceGlobal = self.getSqrt(priceGlobal);

            let dY = bin.liquidity * ((1/sqrtPNew) - (1/sqrtPriceGlobal));
            // let dX = bin.liquidity * (sqrtPNew - sqrtPriceGlobal);
            let dX = effectiveSwap;

            totaldX += dX;
            totaldY += dY;

            remainingAmount -= (dX * 1000000) / (1000000 - self.fee);
            priceGlobal = pNew;

            if (remainingAmount <= 0) {
                done = true;
            }
            else{
                done = false;
            }
        }

        self.tokenXReserve += totaldX;
        self.tokenYReserve -= totaldY;

        // update the global fee accumulator
        // self.globalFeeXAccumulator += totaldX * self.fee;
        // self.globalFeeYAccumulator += totaldY * self.fee;

        // send the swapped tokens to the receiver
        // sendTokens(swapData.receiver_address, totaldY);
    }

    fun swapYForX (swapAmount: Int, swapData: SwapPayload) {
        let remainingAmount: Int = swapAmount;
        let priceGlobal: Int = self.getCurrentPrice();
        let totaldX: Int = 0;
        let totaldY: Int = 0;

        let done: Bool = false;

        while (remainingAmount > 0 && !done) {
            let binInfo: BinInfo = self.getOrCreateBin(priceGlobal);
            let bin: LiquidityBin = binInfo.bin;
            
            let effectiveSwap: Int = remainingAmount * (1000000 - self.fee) / 1000000;

            let deltaPrice: Int = effectiveSwap / bin.liquidity;
            let pNew = max(priceGlobal - deltaPrice, bin.lowerPrice);

            let sqrtPNew = self.getSqrt(pNew);
            let sqrtPriceGlobal = self.getSqrt(priceGlobal);

            let dX = bin.liquidity * (sqrtPriceGlobal - sqrtPNew);
            // let dY = bin.liquidity * (priceGlobal - pNew);
            let dY = effectiveSwap;

            totaldX += dX;
            totaldY += dY;

            remainingAmount -= (dY * 1000000) / (1000000 - self.fee);
            priceGlobal = pNew;

            if (remainingAmount <= 0) {
                done = true;
            }
            else{
                done = false;
            }
        }

        self.tokenXReserve -= totaldX;
        self.tokenYReserve += totaldY;

        // update the global fee accumulator
        // self.globalFeeXAccumulator += totaldX * self.fee;
        // self.globalFeeYAccumulator += totaldY * self.fee;

        // send the swapped tokens to the receiver
        // sendTokens(swapData.receiver_address, totaldX);
    }

    fun provideLiquidity(msg: TransferNotification, payload: TransferNotificationPayload, provideLpData: ProvideLPPayload) {
        // first check if the user has deposited any token earlier or not
        require(msg.jetton_amount > 0, "Transferred amount must be greater than zero");
        require(provideLpData.lower_price < provideLpData.upper_price, "Lower price must be less than upper price");

        let position: LiquidityPosition? = self.positions.get(sender());
        if position == null {
            // if not, create a new position
            // token_wallet: Address;   // Address of the token wallet
            // check if token_wallet is tokenX or tokenY
            let tokenWallet: Address = payload.token_wallet;
            let isX: Bool = false;

            if tokenWallet == self.tokenX {
                isX = true;
            } else if tokenWallet == self.tokenY {
                isX = false;
            } else {
                require(false, "Invalid token wallet address");
            }            

            position = LiquidityPosition {
                lowerPrice: provideLpData.lower_price,
                upperPrice: provideLpData.upper_price,
                liquidity: 0,
                // liquidityX: isX ? msg.jetton_amount : 0,
                // liquidityY: isX ? 0 : msg.jetton_amount,
                liquidityInfo: emptyMap(),
                // feeGrowthInsideXLast: 0,
                // feeGrowthInsideYLast: 0,
                tokensOwedX: isX ? msg.jetton_amount : 0,
                tokensOwedY: isX ? 0 : msg.jetton_amount,
                partial: true
            }
        } else {
            let tokenWallet: Address = payload.token_wallet;
            let isX: Bool = false;

            if tokenWallet == self.tokenX {
                isX = true;
            } else if tokenWallet == self.tokenY {
                isX = false;
            } else {
                require(false, "Invalid token wallet address");
            }    

            let pos: LiquidityPosition = position!!;
            if (isX && pos.tokensOwedX > 0) {
                // user sent tokenX again
                pos.tokensOwedX += msg.jetton_amount;
            } else if (!isX && pos.tokensOwedY > 0) {
                // user sent tokenY again
                pos.tokensOwedY += msg.jetton_amount;
            } else if (isX && pos.tokensOwedY > 0) {
                // user sent tokenX after sending tokenY
                // calculate the amount of tokenY to be converted to tokenX

                pos.lowerPrice = provideLpData.lower_price;
                pos.upperPrice = provideLpData.upper_price;
                pos.tokensOwedX = msg.jetton_amount;
                pos.partial = false;
            } else if (!isX && pos.tokensOwedX > 0) {
                // user sent tokenY after sending tokenX
                // calculate the amount of tokenX to be converted to tokenY
                
                pos.lowerPrice = provideLpData.lower_price;
                pos.upperPrice = provideLpData.upper_price;
                pos.tokensOwedY = msg.jetton_amount;
                pos.partial = false;
            }

            if pos.partial == false {
                // add liquidity to bins
                self.addLiquidityToBins(pos);
            }
        }
    }

    fun addLiquidityToBins(position: LiquidityPosition) {
        let xUsed: Int = 0;
        let yUsed: Int = 0;
        let liquidityX: Int = 0;
        let liquidityY: Int = 0;
        let xRemaining = position.tokensOwedX;
        let yRemaining = position.tokensOwedY;

        let globalPrice = self.getCurrentPrice();

        let currentPrice: Int = position.lowerPrice;
        while (currentPrice < position.upperPrice) {
            let binInfo: BinInfo = self.getOrCreateBin(currentPrice);
            let bin: LiquidityBin = binInfo.bin;
            let binUpperPrice: Int = bin.upperPrice;
            let binLowerPrice: Int = bin.lowerPrice;
            let dX: Int = 0;
            let dY: Int = 0;
            let sqrtPriceUpper = self.getSqrt(binUpperPrice);
            let sqrtPriceLower = self.getSqrt(binLowerPrice);
            let sqrtGlobalPrice = self.getSqrt(globalPrice);


            if (globalPrice < bin.lowerPrice) {
                // only token X is used
                dX = sqrtPriceUpper - sqrtPriceLower;
            } else if (self.currentPrice > bin.upperPrice) {
                // only token Y is used
                dY = sqrtPriceUpper - sqrtPriceLower;
            } else {
                // both tokens are used
                dX = sqrtPriceUpper - sqrtGlobalPrice;
                dY = sqrtGlobalPrice - sqrtPriceLower;
            }

            let maxLiquidtyX: Int = 0;
            let maxLiquidtyY: Int = 0;

            if (dX > 0){
                maxLiquidtyX = xRemaining / yRemaining;
            }
            else{
                maxLiquidtyX = pow2(256) - 1;
            }

            if (dY > 0){
                maxLiquidtyY = yRemaining / xRemaining;
            }
            else{
                maxLiquidtyY = pow2(256) - 1;
            }

            let liquidityInBin = min(maxLiquidtyX, maxLiquidtyY);
            xUsed = dX * liquidityInBin;
            yUsed = dY * liquidityInBin;

            position.liquidityInfo.set(binInfo.binIndex, LiquidityInBins {
                binId: binInfo.binIndex,
                liquidity: liquidityInBin,
                feeCheckpoint: bin.feePerLiquidity
            });
        }

        self.tokenXReserve += xUsed;
        self.tokenYReserve += yUsed;
    }

    fun getOrCreateBin(price: Int): BinInfo {
        let binIndex: Int = price / self.binWidth;
        let bin1: LiquidityBin? = self.bins.get(binIndex);

        if bin1 != null {
            let bin: LiquidityBin = bin1!!;
            let binInfo: BinInfo = BinInfo {
                binIndex: binIndex,
                bin: bin
            };
            return binInfo;
        }
        else{
            let bin: LiquidityBin = LiquidityBin {
                lowerPrice: binIndex * self.binWidth,
                upperPrice: (binIndex + 1) * self.binWidth,
                liquidity: 0,
                feePerLiquidity: 0
            };

            self.bins.set(binIndex, bin);
            let binInfo: BinInfo = BinInfo {
                binIndex: binIndex,
                bin: bin
            };
            return binInfo;
        }
    }

    fun getCurrentPrice(): Int {
        let x = self.tokenXReserve;
        let y = self.tokenYReserve;
        let p = 0;
        if (x > 0 && y > 0) {
            p = y / x;
        }
        return p;
    }

    fun getSqrt(x: Int): Int {
        if (x < 0) {
            require(false, "Negative input");
        }
        else if (x ==0 || x == 1) {
            return x;
        }

        let start: Int = 1;
        let end: Int = x;
        let ans: Int = 0;

        while (start <= end) {
            let mid: Int = (start + end) / 2;
            let midSqr: Int = mid * mid;

            if (midSqr == x) {
                ans = mid;
                start = mid + 1;
            } else {
                end = mid - 1;
            }
        }
        return 0
    }
}

// https://chatgpt.com/c/6717f1d7-58dc-8013-ba6e-ef33afb01441