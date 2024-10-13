import "@stdlib/deploy";

struct LiquidityPosition {
    lowerPrice: Int as uint256;
    upperPrice: Int as uint256;
    liquidity: Int as uint256;
    feeEarnedX: Int as uint256;
    feeEarnedY: Int as uint256;
}

struct LiquidityBin {
    lowerPrice: Int as uint256;
    upperPrice: Int as uint256;
    liquidity: Int as uint256;
    positions: map<Address, LiquidityPosition>;
}

message AddLiquidity {
    amountX: Int as uint256;
    amountY: Int as uint256;
    lowerPrice: Int as uint256;
    upperPrice: Int as uint256;
}

contract AMM with Deployable {
    currentPrice: Int as uint256;
    binWidth: Int as uint256;
    bins: map<Int, LiquidityBin>;
    fee: Int as uint256;
    tokenXReserve: Int as uint256;
    tokenYReserve: Int as uint256;

    init() {
        self.currentPrice = 0;
        self.binWidth = 100;
        self.fee = 0;
        self.tokenXReserve = 0;
        self.tokenYReserve = 0;
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
                liquidity: 0,
                positions: emptyMap()
            };

            self.bins.set(binIndex, bin);
            return bin;
        }
    }

    receive(msg: AddLiquidity) {
        require(msg.lowerPrice > msg.upperPrice, "Lower price must be less than upper price");

        let xUsed: Int = 0;
        let yUsed: Int = 0;
        let liquidity: Int = 0;

        let currentPrice: Int = msg.lowerPrice;
        while (currentPrice < msg.upperPrice) {
            let bin: LiquidityBin = self.getOrCreateBin(currentPrice);
            let binUpperPrice: Int = min(bin.upperPrice, msg.upperPrice);

            if (self.currentPrice < bin.lowerPrice) {
                // only token X is used
                let dX: Int = msg.amountX * (binUpperPrice - currentPrice) / (msg.upperPrice - msg.lowerPrice);
                liquidity = dX;
                xUsed += dX;
            }
            else if (self.currentPrice > bin.upperPrice) {
                // only token Y is used
                let dY: Int = msg.amountY * (binUpperPrice - currentPrice) / (msg.upperPrice - msg.lowerPrice);
                liquidity = dY;
                yUsed += dY;
            }
            else {
                // both tokens are used
                let dX: Int = msg.amountX * (binUpperPrice - currentPrice) / (msg.upperPrice - msg.lowerPrice);
                let dY: Int = msg.amountY * (binUpperPrice - currentPrice) / (msg.upperPrice - msg.lowerPrice);
                liquidity = min(dX, dY);
                xUsed += liquidity;
                yUsed += liquidity;
            }

            bin.liquidity += liquidity;
            if (bin.positions.get(sender()) == null) {
                bin.positions.set(sender(), LiquidityPosition {
                    lowerPrice: bin.lowerPrice,
                    upperPrice: bin.upperPrice,
                    liquidity: liquidity,
                    feeEarnedX: 0,
                    feeEarnedY: 0
                });
            }
            else {
                let position: LiquidityPosition = bin.positions.get(sender())!!;
                position.liquidity += liquidity;
            }

            currentPrice = binUpperPrice;
        }

        self.tokenXReserve += xUsed;
        self.tokenYReserve += yUsed;
    }
}