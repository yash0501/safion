import "@stdlib/deploy";

message TransferNotification {
    query_id: Int as uint64;
    jetton_amount: Int as uint128;
    sender: Address;
    payload: Slice;
}

struct LiquidityPosition {
    lowerPrice: Int as uint256;
    upperPrice: Int as uint256;
    liquidityX: Int as uint256;
    liquidityY: Int as uint256;
    // feeEarnedX: Int as uint256;
    // feeEarnedY: Int as uint256;
    feeGrowthInsideXLast: Int as uint256;
    feeGrowthInsideYLast: Int as uint256;
    tokensOwedX: Int as uint256;
    tokensOwedY: Int as uint256;
    partial: Bool = false;
}

struct LiquidityBin {
    lowerPrice: Int as uint256;
    upperPrice: Int as uint256;
    liquidityX: Int as uint256;
    liquidityY: Int as uint256;
    positions: map<Address, LiquidityPosition>;
    feeGrowthGlobalX: Int as uint256;
    feeGrowthGlobalY: Int as uint256;
}

message AddLiquidity {
    amountX: Int as uint256;
    amountY: Int as uint256;
    lowerPrice: Int as uint256;
    upperPrice: Int as uint256;
}

message RemoveLiquidity {
    lowerPrice: Int as uint256;
    upperPrice: Int as uint256;
    liquidityPercentage: Int as uint256;
}

message Swap {
    tokenIn: Address;
    amountIn: Int as uint256;
}

contract AMM with Deployable {
    currentPrice: Int as uint256;
    binWidth: Int as uint256;
    bins: map<Int, LiquidityBin>;
    fee: Int as uint256;
    tokenXReserve: Int as uint256;
    tokenYReserve: Int as uint256;
    tokenX: Address;
    tokenY: Address;
    owner: Address;
    globalFeeXAccumulator: Int as uint256;
    globalFeeYAccumulator: Int as uint256;

    init() {
        self.currentPrice = 0;
        self.binWidth = 100;
        self.fee = 0;
        self.tokenXReserve = 0;
        self.tokenYReserve = 0;
        self.tokenX = address("EQCD39VS5jcptHL8vMjEXrzGaRcCVYto7HUn4bpAOg8xqB2N");
        self.tokenY = address("EQCD39VS5jcptHL8vMjEXrzGaRcCVYto7HUn4bpAOg8xqB2N");
        self.owner = sender();
        self.globalFeeXAccumulator = 0;
        self.globalFeeYAccumulator = 0;
    }

    fun getOrCreateBin(price: Int): LiquidityBin {
        let binIndex: Int = price / self.binWidth;
        let bin1: LiquidityBin? = self.bins.get(binIndex);

        if bin1 != null {
            let bin: LiquidityBin = bin1!!;
            return bin;
        }
        else{
            let bin: LiquidityBin = LiquidityBin {
                lowerPrice: binIndex * self.binWidth,
                upperPrice: (binIndex + 1) * self.binWidth,
                liquidityX: 0,
                liquidityY: 0,
                positions: emptyMap(),
                feeGrowthGlobalX: 0,
                feeGrowthGlobalY: 0
            };

            self.bins.set(binIndex, bin);
            return bin;
        }
    }

    receive(msg: TransferNotification) {
        require(msg.jetton_amount > 0, "Amount must be greater than 0");

        if (msg.sender == self.tokenX) {
            self.tokenXReserve += msg.jetton_amount;
        }
        else if (msg.sender == self.tokenY) {
            self.tokenYReserve += msg.jetton_amount;
        }
        else {
            require(false, "Invalid token");
        }

        self.updatePrice();
    }

    receive(msg: AddLiquidity) {
        require(msg.lowerPrice < msg.upperPrice, "Lower price must be less than upper price");

        let xUsed: Int = 0;
        let yUsed: Int = 0;
        let liquidityX: Int = 0;
        let liquidityY: Int = 0;

        let currentPrice: Int = msg.lowerPrice;
        while (currentPrice < msg.upperPrice) {
            let bin: LiquidityBin = self.getOrCreateBin(currentPrice);
            let binUpperPrice: Int = min(bin.upperPrice, msg.upperPrice);
            let dX: Int = 0;
            let dY: Int = 0;

            if (self.currentPrice < bin.lowerPrice) {
                // only token X is used
                dX = msg.amountX * (binUpperPrice - currentPrice) / (msg.upperPrice - msg.lowerPrice);
                liquidityX = dX;
                xUsed += dX;
            }
            else if (self.currentPrice > bin.upperPrice) {
                // only token Y is used
                dY = msg.amountY * (binUpperPrice - currentPrice) / (msg.upperPrice - msg.lowerPrice);
                liquidityY = dY;
                yUsed += dY;
            }
            else {
                // both tokens are used
                dX = msg.amountX * (binUpperPrice - currentPrice) / (msg.upperPrice - msg.lowerPrice);
                dY = msg.amountY * (binUpperPrice - currentPrice) / (msg.upperPrice - msg.lowerPrice);
                // liquidity = min(dX, dY);
                liquidityX = dX;
                liquidityY = dY;
                xUsed += liquidityX;
                yUsed += liquidityY;
            }

            bin.liquidityX += liquidityX;
            bin.liquidityY += liquidityY;
            if (bin.positions.get(sender()) == null) {
                bin.positions.set(sender(), LiquidityPosition {
                    lowerPrice: bin.lowerPrice,
                    upperPrice: bin.upperPrice,
                    liquidityX: liquidityX,
                    liquidityY: liquidityY,
                    feeGrowthInsideXLast: bin.feeGrowthGlobalX,
                    feeGrowthInsideYLast: bin.feeGrowthGlobalY,
                    tokensOwedX: dX,
                    tokensOwedY: dY
                });
            }
            else {
                let position: LiquidityPosition = bin.positions.get(sender())!!;
                self._updatePositionFee(position, bin);
                position.liquidityX += liquidityX;
                position.liquidityY += liquidityY;
            }

            currentPrice = binUpperPrice;
        }

        self.tokenXReserve += xUsed;
        self.tokenYReserve += yUsed;
    }

    receive(msg: RemoveLiquidity) {
        require(msg.lowerPrice < msg.upperPrice, "Lower price must be less than upper price");
        require(msg.liquidityPercentage > 0 && msg.liquidityPercentage <= 100, "Liquidity percentage must be between 0 and 100");

        let xReturned: Int = 0;
        let yReturned: Int = 0;

        let feeX: Int = 0;
        let feeY: Int = 0;

        let currentPrice: Int = msg.lowerPrice;

        while (currentPrice < msg.upperPrice) {
            let bin: LiquidityBin = self.getOrCreateBin(currentPrice);
            let binUpperPrice: Int = min(bin.upperPrice, msg.upperPrice);

            if (bin.positions.get(sender()) == null) {
                currentPrice = binUpperPrice;
            }
            else{
                let position: LiquidityPosition = bin.positions.get(sender())!!;
                self._updatePositionFee(position, bin);
                let liquidityX: Int = position.liquidityX;
                let liquidityY: Int = position.liquidityY;
                let dLiquidityX: Int = liquidityX * msg.liquidityPercentage / 100;
                let dLiquidityY: Int = liquidityY * msg.liquidityPercentage / 100;

                if (self.currentPrice < bin.lowerPrice) {
                    // only token X is returned
                    let dX: Int = dLiquidityX;
                    xReturned += dX;
                }
                else if (self.currentPrice > bin.upperPrice) {
                    // only token Y is returned
                    let dY: Int = dLiquidityY;
                    yReturned += dY;
                }
                else {
                    // both tokens are returned
                    let dX: Int = dLiquidityX * (self.currentPrice - bin.lowerPrice) / self.currentPrice;
                    let dY: Int = dLiquidityY * (bin.upperPrice - self.currentPrice) / self.currentPrice;
                    xReturned += dX;
                    yReturned += dY;
                }

                // feeX += position.feeEarnedX * msg.liquidityPercentage / 100;
                // feeY += position.feeEarnedY * msg.liquidityPercentage / 100;
                // position.feeEarnedX -= feeX;
                // position.feeEarnedY -= feeY;

                xReturned += position.tokensOwedX * msg.liquidityPercentage / 100;
                yReturned += position.tokensOwedY * msg.liquidityPercentage / 100;

                position.tokensOwedX -= position.tokensOwedX * msg.liquidityPercentage / 100;
                position.tokensOwedY -= position.tokensOwedY * msg.liquidityPercentage / 100;

                bin.liquidityX -= dLiquidityX;
                bin.liquidityY -= dLiquidityY;
                position.liquidityX -= dLiquidityX;
                position.liquidityY -= dLiquidityY;

                if (position.liquidityX == 0 && position.liquidityY == 0) {
                    bin.positions.del(sender());
                }
            }

            currentPrice = binUpperPrice;
        }

        self.tokenXReserve -= xReturned;
        self.tokenYReserve -= yReturned;
    }

    receive(msg: Swap) {
        let feeAmount: Int = msg.amountIn * self.fee / 100;
        let amountInAfterFee: Int = msg.amountIn - feeAmount;

        if (msg.tokenIn == self.tokenX) {
            let amountOut: Int = self._swapXForY(amountInAfterFee, feeAmount);
            self.tokenXReserve += amountInAfterFee;
            self.tokenYReserve -= amountOut;

            self.globalFeeXAccumulator += feeAmount;
        }
        else if (msg.tokenIn == self.tokenY) {
            let amountOut: Int = self._swapYForX(amountInAfterFee, feeAmount);
            self.tokenXReserve -= amountInAfterFee;
            self.tokenYReserve += amountOut;

            self.globalFeeYAccumulator += feeAmount;
        }
        else {
            require(false, "Invalid token");
        }

        self.updatePrice();
        self.adjustFee();
    }

    fun _swapXForY(xIn: Int, feeAmount: Int): Int {
        let yOut: Int = 0;
        let remainingX: Int = xIn;
        let currentPrice: Int = self.currentPrice;
        let maxPrice: Int = self._getMaxPrice();

        let activeBins: map<Int, LiquidityBin> = emptyMap();
        let i: Int = 0;

        while (remainingX > 0 && currentPrice < maxPrice) {
            let bin: LiquidityBin = self.getOrCreateBin(currentPrice);
            if (bin.liquidityY > 0) {
                let dX: Int = min(remainingX, bin.liquidityX);
                let dY: Int = dX * (bin.upperPrice - currentPrice) / currentPrice;
                let dYAvailable: Int = bin.liquidityY * currentPrice / (bin.upperPrice - bin.lowerPrice);

                if (dYAvailable >= dY) {
                    yOut += dY;
                    remainingX -= dX;
                }
                else {
                    yOut += dYAvailable;
                    remainingX -= dYAvailable;
                }
                activeBins.set(i, bin);
                i += 1;
            }
            currentPrice = bin.upperPrice;
        }

        // let totalLiquidity: Int = 0;
        // if (!activeBins.isEmpty()) {
        //     foreach (key, value in activeBins) {
        //         let bin: LiquidityBin = value;
        //         totalLiquidity += bin.liquidity;
        //     }
        //     let feePerLiquidity = feeAmount / totalLiquidity;
        //     foreach (key, value in activeBins) {
        //         let bin: LiquidityBin = value;
        //         bin.feeGrowthGlobalX += feePerLiquidity;
        //     }
        // }

        return yOut;
    }

    fun _swapYForX(yIn: Int, feeAmount: Int): Int {
        let xOut: Int = 0;
        let remainingY: Int = yIn;
        let currentPrice: Int = self.currentPrice;
        let maxPrice: Int = self._getMinPrice();
        let i: Int = 0;
        let activeBins: map<Int, LiquidityBin> = emptyMap();

        while (remainingY > 0 && currentPrice > maxPrice) {
            let bin: LiquidityBin = self.getOrCreateBin(currentPrice);
            if (bin.liquidityX > 0) {
                let dY: Int = min(remainingY, bin.liquidityY * currentPrice / (bin.upperPrice - bin.lowerPrice));
                let dX: Int = dY * currentPrice / (bin.upperPrice - currentPrice);

                xOut += dX;
                remainingY -= dY;

                activeBins.set(i, bin);
                i += 1;
            }
            currentPrice = bin.upperPrice;
        }

        // let totalLiquidity: Int = 0;
        // if (!activeBins.isEmpty()) {
        //     foreach (key, value in activeBins) {
        //         let bin: LiquidityBin = value;
        //         totalLiquidity += bin.liquidity;
        //     }
        //     let feePerLiquidity = feeAmount / totalLiquidity;
        //     foreach (key, value in activeBins) {
        //         let bin: LiquidityBin = value;
        //         bin.feeGrowthGlobalY += feePerLiquidity;
        //     }
        // }

        return xOut;
    }

    fun _getMaxPrice(): Int {
        let maxPrice: Int = 0;
        let i: Int = 0;
        foreach (key, value in self.bins) {
            let bin: LiquidityBin = value;
            if (bin.upperPrice > maxPrice) {
                maxPrice = bin.upperPrice;
            }
        }
        return maxPrice;
    }

    fun _getMinPrice(): Int {
        let minPrice: Int = 0;
        let i: Int = 0;
        foreach (key, value in self.bins) {
            let bin: LiquidityBin = value;
            if (bin.lowerPrice < minPrice) {
                minPrice = bin.lowerPrice;
            }
        }
        return minPrice;
    }

    fun _updatePositionFee (position: LiquidityPosition, bin: LiquidityBin) {
        let feeGrowthDeltaX: Int = bin.feeGrowthGlobalX - position.feeGrowthInsideXLast;
        let feeGrowthDeltaY: Int = bin.feeGrowthGlobalY - position.feeGrowthInsideYLast;

        if (position.liquidityX > 0 || position.liquidityY > 0) {
            position.tokensOwedX += feeGrowthDeltaX * position.liquidityX;
            position.tokensOwedY += feeGrowthDeltaY * position.liquidityY;
        }

        position.feeGrowthInsideXLast = bin.feeGrowthGlobalX;
        position.feeGrowthInsideYLast = bin.feeGrowthGlobalY;
    }

    fun updatePrice() {
        self.currentPrice = self.tokenYReserve / self.tokenXReserve;
    }

    fun adjustFee() {
        // TODO: implement fee adjustment
    }
}

// contract PositionManager with Deployable {
//     positions: map<Address, LiquidityPosition>;

//     init() {
//         self.positions = emptyMap();
//     }

//     fun _generatePositionId(lowerPrice: Int, upperPrice: Int): String {
//         return lowerPrice.toString() + "-" + upperPrice.toString();
//     }
// }

// https://chatgpt.com/c/6717f1d7-58dc-8013-ba6e-ef33afb01441