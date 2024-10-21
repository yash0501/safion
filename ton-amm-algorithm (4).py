from decimal import Decimal, getcontext, ROUND_DOWN
from typing import Dict, Tuple, List
from datetime import datetime

# Set decimal precision
getcontext().prec = 28
getcontext().rounding = ROUND_DOWN

class LiquidityPosition:
    def __init__(self, lower_price: Decimal, upper_price: Decimal, liquidity: Decimal):
        self.lower_price = lower_price  # Absolute lower price
        self.upper_price = upper_price  # Absolute upper price
        self.liquidity = liquidity
        self.fees_earned_x = Decimal('0')
        self.fees_earned_y = Decimal('0')
        self.last_update_timestamp = datetime.now().timestamp()

class LiquidityBin:
    def __init__(self, lower_price: Decimal, upper_price: Decimal):
        self.lower_price = lower_price  # Absolute lower price
        self.upper_price = upper_price  # Absolute upper price
        self.liquidity = Decimal('0')
        self.positions: Dict[str, LiquidityPosition] = {}

class AMM:
    def __init__(self, initial_price: Decimal, bin_width: Decimal):
        self.current_price = initial_price  # Absolute current price
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

    def update_price_if_needed(self, new_price_x: Decimal, new_price_y: Decimal, 
                               current_timestamp: int) -> bool:
        """
        Update prices if threshold is met and price impact is significant.
        Returns True if prices were updated.
        """
        # Check if it's time to update the price
        time_diff = current_timestamp - self.last_price_timestamp
        if time_diff < self.price_update_threshold:
            return False

        # Calculate price impact based on absolute prices
        old_price_ratio = self.last_price_x / self.last_price_y
        new_price_ratio = new_price_x / new_price_y
        price_impact = abs(new_price_ratio / old_price_ratio - 1)

        # Only update if price impact is significant (0.1% threshold)
        if price_impact > Decimal('0.001'):
            self.last_price_x = new_price_x
            self.last_price_y = new_price_y
            self.last_price_timestamp = current_timestamp
            self.current_price = new_price_ratio  # Update the current absolute price
            # No need to update positions as bins are fixed
            return True

        return False

    def swap(self, token_in: str, amount_in: Decimal, 
             price_x: Decimal, price_y: Decimal, timestamp: int) -> Decimal:
        """
        Execute swap with absolute price tracking.
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
            self.token_x_reserve += amount_in_after_fee
            self.token_y_reserve -= amount_out
        else:
            amount_out = self._swap_y_to_x(amount_in_after_fee)
            self.token_y_reserve += amount_in_after_fee
            self.token_x_reserve -= amount_out

        self._distribute_fees(token_in, fee_amount)
        self.current_price = self.token_y_reserve / self.token_x_reserve if self.token_x_reserve != 0 else Decimal('0')
        
        return amount_out

    def add_liquidity(self, user_id: str, amount_x: Decimal, amount_y: Decimal, lower_price: Decimal, upper_price: Decimal, price_x: Decimal, price_y: Decimal, timestamp: int) -> Tuple[Decimal, Decimal]:
        """Add liquidity with absolute price tracking."""
        # Update prices if needed
        self.update_price_if_needed(price_x, price_y, timestamp)
        
        if lower_price >= upper_price:
            raise ValueError("Lower price must be less than upper price")

        x_used = Decimal('0')
        y_used = Decimal('0')

        # Iterate through all bins that fall within the specified price range
        current_price = lower_price
        while current_price < upper_price:
            bin = self._get_or_create_bin(current_price)
            bin_upper_price = min(bin.upper_price, upper_price)
            
            # Calculate liquidity contribution based on current price
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

    def remove_liquidity(self, user_id: str, lower_price: Decimal, upper_price: Decimal, 
                         liquidity: Decimal, price_x: Decimal, price_y: Decimal, timestamp: int
                        ) -> Tuple[Decimal, Decimal, Decimal, Decimal]:
        """
        Remove liquidity from a specific bin.
        Returns a tuple of (x_returned, y_returned, fees_x, fees_y).
        """
        # Update prices if needed
        self.update_price_if_needed(price_x, price_y, timestamp)

        bin = self._get_bin_by_prices(lower_price, upper_price)
        if not bin:
            raise ValueError("Specified bin does not exist.")
        
        if user_id not in bin.positions:
            raise ValueError("User does not have liquidity in the specified bin.")
        
        user_position = bin.positions[user_id]
        
        if liquidity > user_position.liquidity:
            raise ValueError("Cannot remove more liquidity than provided.")

        # Calculate the proportion of liquidity being removed
        liquidity_proportion = liquidity / bin.liquidity

        # Calculate tokens to return
        x_returned = self.token_x_reserve * liquidity_proportion
        y_returned = self.token_y_reserve * liquidity_proportion

        # Calculate fees to return
        fees_x = user_position.fees_earned_x * (liquidity / user_position.liquidity)
        fees_y = user_position.fees_earned_y * (liquidity / user_position.liquidity)

        # Update reserves
        self.token_x_reserve -= x_returned
        self.token_y_reserve -= y_returned

        # Update bin liquidity
        bin.liquidity -= liquidity
        if bin.liquidity == 0:
            del self.bins[int(bin.lower_price / self.bin_width)]

        # Update user position
        user_position.liquidity -= liquidity
        user_position.fees_earned_x -= fees_x
        user_position.fees_earned_y -= fees_y

        if user_position.liquidity == 0:
            del bin.positions[user_id]

        return x_returned, y_returned, fees_x, fees_y

    def claim_fees(self, user_id: str) -> Tuple[Decimal, Decimal]:
        """
        Allows a user to claim all accumulated fees.
        Returns a tuple of (fees_x, fees_y).
        """
        total_fees_x = Decimal('0')
        total_fees_y = Decimal('0')

        for bin in self.bins.values():
            if user_id in bin.positions:
                position = bin.positions[user_id]
                total_fees_x += position.fees_earned_x
                total_fees_y += position.fees_earned_y
                # Reset fees after claiming
                position.fees_earned_x = Decimal('0')
                position.fees_earned_y = Decimal('0')

        return total_fees_x, total_fees_y

    def _get_or_create_bin(self, price: Decimal) -> LiquidityBin:
        """Get or create a bin based on absolute price."""
        bin_index = int(price / self.bin_width)
        if bin_index not in self.bins:
            lower_price = Decimal(bin_index) * self.bin_width
            upper_price = lower_price + self.bin_width
            self.bins[bin_index] = LiquidityBin(lower_price, upper_price)
        return self.bins[bin_index]

    def _get_bin_by_prices(self, lower_price: Decimal, upper_price: Decimal) -> LiquidityBin:
        """Retrieve a bin based on its absolute lower and upper prices."""
        bin_index = int(lower_price / self.bin_width)
        bin = self.bins.get(bin_index, None)
        if bin and bin.lower_price == lower_price and bin.upper_price == upper_price:
            return bin
        return None

    def _swap_x_to_y(self, x_in: Decimal) -> Decimal:
        """Execute X to Y swap with absolute prices."""
        y_out = Decimal('0')
        remaining_x = x_in

        # Sort bins in ascending order of lower_price
        for bin in sorted(self.bins.values(), key=lambda b: b.lower_price):
            if bin.liquidity > 0 and remaining_x > 0:
                dx = min(remaining_x, bin.liquidity)
                dy = dx * (bin.upper_price - bin.lower_price) / bin.lower_price
                y_out += dy
                remaining_x -= dx

        return y_out

    def _swap_y_to_x(self, y_in: Decimal) -> Decimal:
        """Execute Y to X swap with absolute prices."""
        x_out = Decimal('0')
        remaining_y = y_in

        # Sort bins in descending order of lower_price
        for bin in sorted(self.bins.values(), key=lambda b: b.lower_price, reverse=True):
            if bin.liquidity > 0 and remaining_y > 0:
                dy = min(remaining_y, bin.liquidity)
                dx = dy * bin.lower_price / (bin.upper_price - bin.lower_price)
                x_out += dx
                remaining_y -= dy

        return x_out

    def _distribute_fees(self, token_in: str, fee_amount: Decimal):
        """Distribute fees to liquidity providers based on absolute bins."""
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

    def get_user_positions(self, user_id: str) -> List[LiquidityPosition]:
        """
        Retrieve all liquidity positions for a user.
        """
        positions = []
        for bin in self.bins.values():
            if user_id in bin.positions:
                positions.append(bin.positions[user_id])
        return positions

    def get_bin_info(self, lower_price: Decimal, upper_price: Decimal) -> LiquidityBin:
        """
        Retrieve information about a specific bin.
        """
        bin = self._get_bin_by_prices(lower_price, upper_price)
        if not bin:
            raise ValueError("Bin does not exist.")
        return bin
