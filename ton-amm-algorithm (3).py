from decimal import Decimal
from typing import Dict, Tuple, List
from datetime import datetime

class LiquidityPosition:
    def __init__(self, lower_price: Decimal, upper_price: Decimal, liquidity: Decimal):
        self.lower_price = lower_price
        self.upper_price = upper_price
        self.liquidity = liquidity
        self.fees_earned_x = Decimal('0')
        self.fees_earned_y = Decimal('0')
        self.last_update_timestamp = datetime.now().timestamp()

class LiquidityBin:
    def __init__(self, lower_price: Decimal, upper_price: Decimal):
        self.lower_price = lower_price
        self.upper_price = upper_price
        self.liquidity = Decimal('0')
        self.positions: Dict[str, LiquidityPosition] = {}

class AMM:
    def __init__(self, initial_price: Decimal, bin_width: Decimal):
        self.current_price = initial_price
        self.bin_width = bin_width
        self.bins: Dict[int, LiquidityBin] = {}
        self.token_x_reserve = Decimal('0')
        self.token_y_reserve = Decimal('0')
        self.fee = Decimal('0.003')
        
        # Minimal price tracking
        self.last_price_x = Decimal('1')
        self.last_price_y = Decimal('1')
        self.last_price_timestamp = datetime.now().timestamp()
        
        # Price update threshold (15 seconds)
        self.price_update_threshold = 15

    def _should_update_price(self, current_timestamp: int) -> bool:
        """Check if price update is needed based on time threshold."""
        return current_timestamp - self.last_price_timestamp >= self.price_update_threshold

    def update_price_if_needed(self, new_price_x: Decimal, new_price_y: Decimal, 
                             current_timestamp: int) -> bool:
        """
        Update prices if threshold is met. Returns True if prices were updated.
        All parameters should come from oracle/blockchain to ensure consistency.
        """
        if not self._should_update_price(current_timestamp):
            return False

        # Calculate price impact
        price_impact = abs(
            (new_price_x / new_price_y) / (self.last_price_x / self.last_price_y) - 1
        )

        # Only update if price impact is significant (0.1% threshold)
        if price_impact > Decimal('0.001'):
            self.last_price_x = new_price_x
            self.last_price_y = new_price_y
            self.last_price_timestamp = current_timestamp
            self._update_positions(price_impact)
            return True

        return False

    def _update_positions(self, price_impact: Decimal):
        """Update positions based on price impact."""
        if price_impact == 0:
            return

        # Process only affected bins
        affected_bins = {}
        for bin_index, bin in self.bins.items():
            if bin.liquidity > 0:
                new_lower_price = bin.lower_price * (1 + price_impact)
                new_upper_price = bin.upper_price * (1 + price_impact)
                new_bin_index = int(new_lower_price / self.bin_width)
                
                if new_bin_index != bin_index:
                    affected_bins[bin_index] = (new_bin_index, new_lower_price, new_upper_price)

        # Update affected bins
        for old_index, (new_index, new_lower, new_upper) in affected_bins.items():
            old_bin = self.bins[old_index]
            
            # Create or get new bin
            if new_index not in self.bins:
                self.bins[new_index] = LiquidityBin(new_lower, new_upper)
            new_bin = self.bins[new_index]
            
            # Transfer liquidity and positions
            new_bin.liquidity += old_bin.liquidity
            for user_id, position in old_bin.positions.items():
                if user_id not in new_bin.positions:
                    new_bin.positions[user_id] = LiquidityPosition(
                        new_lower, new_upper, position.liquidity
                    )
                else:
                    new_bin.positions[user_id].liquidity += position.liquidity
                
                # Transfer fees
                new_bin.positions[user_id].fees_earned_x += position.fees_earned_x
                new_bin.positions[user_id].fees_earned_y += position.fees_earned_y
            
            # Clean up old bin
            del self.bins[old_index]

    def swap(self, token_in: str, amount_in: Decimal, 
             price_x: Decimal, price_y: Decimal, timestamp: int) -> Decimal:
        """
        Execute swap with minimal price tracking.
        Prices and timestamp should come from oracle/blockchain.
        """
        # Update prices if needed
        self.update_price_if_needed(price_x, price_y, timestamp)
        
        # Calculate fee
        fee_amount = amount_in * self.fee
        amount_in_after_fee = amount_in - fee_amount

        # Execute swap
        if token_in == 'X':
            amount_out = self._swap_x_to_y(amount_in_after_fee)
            self.token_x_reserve += amount_in
            self.token_y_reserve -= amount_out
        else:
            amount_out = self._swap_y_to_x(amount_in_after_fee)
            self.token_y_reserve += amount_in
            self.token_x_reserve -= amount_out

        self._distribute_fees(token_in, fee_amount)
        self.current_price = self.token_y_reserve / self.token_x_reserve
        
        return amount_out

    def add_liquidity(self, user_id: str, amount_x: Decimal, amount_y: Decimal,
                     lower_price: Decimal, upper_price: Decimal,
                     price_x: Decimal, price_y: Decimal, timestamp: int) -> Tuple[Decimal, Decimal]:
        """Add liquidity with minimal price tracking."""
        # Update prices if needed
        self.update_price_if_needed(price_x, price_y, timestamp)
        
        if lower_price >= upper_price:
            raise ValueError("Lower price must be less than upper price")

        x_used = Decimal('0')
        y_used = Decimal('0')

        current_price = lower_price
        while current_price < upper_price:
            bin = self._get_or_create_bin(current_price)
            bin_upper_price = min(bin.upper_price, upper_price)
            
            # Calculate liquidity contribution
            if self.current_price < bin.lower_price:
                dx = amount_x * (bin_upper_price - current_price) / (upper_price - lower_price)
                liquidity = dx
                x_used += dx
            elif self.current_price > bin.upper_price:
                dy = amount_y * (bin_upper_price - current_price) / (upper_price - lower_price)
                liquidity = dy
                y_used += dy
            else:
                dx = amount_x * (bin_upper_price - current_price) / (upper_price - lower_price)
                dy = amount_y * (bin_upper_price - current_price) / (upper_price - lower_price)
                liquidity = min(dx, dy)
                x_used += dx
                y_used += dy

            # Update bin and position
            bin.liquidity += liquidity
            if user_id not in bin.positions:
                bin.positions[user_id] = LiquidityPosition(
                    bin.lower_price, bin.upper_price, Decimal('0')
                )
            bin.positions[user_id].liquidity += liquidity

            current_price = bin_upper_price

        self.token_x_reserve += x_used
        self.token_y_reserve += y_used

        return x_used, y_used

    def _get_or_create_bin(self, price: Decimal) -> LiquidityBin:
        """Get or create a bin with minimal memory usage."""
        bin_index = int(price / self.bin_width)
        if bin_index not in self.bins:
            lower_price = Decimal(bin_index) * self.bin_width
            upper_price = lower_price + self.bin_width
            self.bins[bin_index] = LiquidityBin(lower_price, upper_price)
        return self.bins[bin_index]

    def _swap_x_to_y(self, x_in: Decimal) -> Decimal:
        """Execute X to Y swap with current prices."""
        y_out = Decimal('0')
        remaining_x = x_in

        for bin in sorted(self.bins.values(), key=lambda b: b.lower_price):
            if bin.liquidity > 0 and remaining_x > 0:
                dx = min(remaining_x, bin.liquidity)
                dy = dx * (bin.upper_price - bin.lower_price) / bin.lower_price
                y_out += dy
                remaining_x -= dx

        return y_out

    def _swap_y_to_x(self, y_in: Decimal) -> Decimal:
        """Execute Y to X swap with current prices."""
        x_out = Decimal('0')
        remaining_y = y_in

        for bin in sorted(self.bins.values(), key=lambda b: b.lower_price, reverse=True):
            if bin.liquidity > 0 and remaining_y > 0:
                dy = min(remaining_y, bin.liquidity)
                dx = dy * bin.lower_price / (bin.upper_price - bin.lower_price)
                x_out += dx
                remaining_y -= dy

        return x_out

    def _distribute_fees(self, token_in: str, fee_amount: Decimal):
        """Distribute fees to liquidity providers."""
        active_bins = [bin for bin in self.bins.values() 
                      if bin.lower_price <= self.current_price < bin.upper_price]
        
        if not active_bins:
            return

        total_liquidity = sum(bin.liquidity for bin in active_bins)
        if total_liquidity == 0:
            return

        for bin in active_bins:
            bin_fee_share = fee_amount * bin.liquidity / total_liquidity
            for position in bin.positions.values():
                position_fee_share = bin_fee_share * position.liquidity / bin.liquidity
                if token_in == 'X':
                    position.fees_earned_x += position_fee_share
                else:
                    position.fees_earned_y += position_fee_share