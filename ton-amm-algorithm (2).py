# https://chatgpt.com/c/670d4faa-70dc-8013-9891-9691dcd2c548

from typing import Dict, Tuple, List
from collections import deque

# Define the scaling factor for fixed-point arithmetic
SCALING_FACTOR = 1_000_000_000  # 1e9 for TON coins

def scale(value: float) -> int:
    """Scales a float to an integer based on the scaling factor."""
    return int(round(value * SCALING_FACTOR))

def descale(value: int) -> float:
    """Descale an integer back to a float based on the scaling factor."""
    return value / SCALING_FACTOR

class LiquidityPosition:
    def __init__(self, lower_price: int, upper_price: int, liquidity: int):
        if lower_price >= upper_price:
            raise ValueError("Lower price must be less than upper price")
        self.lower_price = lower_price
        self.upper_price = upper_price
        self.liquidity = liquidity
        self.fees_earned_x = 0  # Represented in scaled integers
        self.fees_earned_y = 0  # Represented in scaled integers

class LiquidityBin:
    def __init__(self, lower_price: int, upper_price: int):
        self.lower_price = lower_price
        self.upper_price = upper_price
        self.liquidity = 0  # Represented in scaled integers
        self.positions: Dict[str, LiquidityPosition] = {}

class AMM:
    def __init__(self, initial_price: float, bin_width: float):
        initial_price_scaled = scale(initial_price)
        bin_width_scaled = scale(bin_width)
        if bin_width_scaled <= 0:
            raise ValueError("Bin width must be positive")
        self.current_price = initial_price_scaled
        self.bin_width = bin_width_scaled
        self.bins: Dict[int, LiquidityBin] = {}
        self.token_x_reserve = 0  # Represented in scaled integers
        self.token_y_reserve = 0  # Represented in scaled integers
        self.fee = scale(0.003)  # Start with 0.3% fee, scaled
        self.price_history = deque(maxlen=100)  # For volatility calculation
        self.price_history.append(initial_price_scaled)

    def _get_bin_index(self, price: int) -> int:
        return price // self.bin_width

    def _get_or_create_bin(self, price: int) -> LiquidityBin:
        bin_index = self._get_bin_index(price)
        if bin_index not in self.bins:
            lower_price = bin_index * self.bin_width
            upper_price = lower_price + self.bin_width
            self.bins[bin_index] = LiquidityBin(lower_price, upper_price)
        return self.bins[bin_index]

    def add_liquidity(self, user_id: str, amount_x: int, amount_y: int, lower_price: float, upper_price: float) -> Tuple[int, int]:
        lower_price_scaled = scale(lower_price)
        upper_price_scaled = scale(upper_price)
        if lower_price_scaled >= upper_price_scaled:
            raise ValueError("Lower price must be less than upper price")

        x_used = 0
        y_used = 0

        current_price = lower_price_scaled
        while current_price < upper_price_scaled:
            bin = self._get_or_create_bin(current_price)
            bin_upper_price = min(bin.upper_price, upper_price_scaled)

            # Calculate the proportion of liquidity in this bin
            price_range = upper_price_scaled - lower_price_scaled
            bin_range = bin_upper_price - current_price
            proportion = bin_range // (price_range // SCALING_FACTOR)  # Avoid floating division

            # Determine liquidity based on token amounts and current price
            if self.current_price < bin.lower_price:
                # Only X token is needed
                dx = (amount_x * bin_range) // price_range
                liquidity = dx
                x_used += dx
            elif self.current_price > bin.upper_price:
                # Only Y token is needed
                dy = (amount_y * bin_range) // price_range
                liquidity = dy
                y_used += dy
            else:
                # Both tokens are needed
                dx = (amount_x * bin_range) // price_range
                dy = (amount_y * bin_range) // price_range
                liquidity = min(dx, dy)
                x_used += dx
                y_used += dy

            bin.liquidity += liquidity
            if user_id not in bin.positions:
                bin.positions[user_id] = LiquidityPosition(bin.lower_price, bin.upper_price, 0)
            bin.positions[user_id].liquidity += liquidity

            current_price = bin_upper_price

        self.token_x_reserve += x_used
        self.token_y_reserve += y_used

        return x_used, y_used

    def remove_liquidity(self, user_id: str, lower_price: float, upper_price: float, liquidity_percentage: float) -> Tuple[int, int]:
        lower_price_scaled = scale(lower_price)
        upper_price_scaled = scale(upper_price)
        liquidity_percentage_scaled = int(liquidity_percentage * SCALING_FACTOR)
        if liquidity_percentage <= 0 or liquidity_percentage > 1:
            raise ValueError("Liquidity percentage must be between 0 and 1")

        x_returned = 0
        y_returned = 0
        fees_x = 0
        fees_y = 0

        current_price = lower_price_scaled
        while current_price < upper_price_scaled:
            bin = self._get_or_create_bin(current_price)
            bin_upper_price = min(bin.upper_price, upper_price_scaled)

            if user_id in bin.positions:
                position = bin.positions[user_id]
                liquidity_to_remove = (position.liquidity * liquidity_percentage_scaled) // SCALING_FACTOR

                if self.current_price < bin.lower_price:
                    # Only X token
                    dx = liquidity_to_remove
                    x_returned += dx
                elif self.current_price > bin.upper_price:
                    # Only Y token
                    dy = liquidity_to_remove
                    y_returned += dy
                else:
                    # Both tokens
                    # Calculate based on the proportion of price within the bin
                    # To avoid division by zero, ensure current_price > 0
                    if self.current_price == 0:
                        dx = 0
                        dy = liquidity_to_remove
                    else:
                        dx = (liquidity_to_remove * (self.current_price - bin.lower_price)) // self.current_price
                        dy = (liquidity_to_remove * (bin.upper_price - self.current_price)) // self.current_price
                    x_returned += dx
                    y_returned += dy

                # Calculate and add fees
                fees_x += (position.fees_earned_x * liquidity_percentage_scaled) // SCALING_FACTOR
                fees_y += (position.fees_earned_y * liquidity_percentage_scaled) // SCALING_FACTOR
                position.fees_earned_x -= (position.fees_earned_x * liquidity_percentage_scaled) // SCALING_FACTOR
                position.fees_earned_y -= (position.fees_earned_y * liquidity_percentage_scaled) // SCALING_FACTOR

                bin.liquidity -= liquidity_to_remove
                position.liquidity -= liquidity_to_remove

                if position.liquidity == 0:
                    del bin.positions[user_id]

            current_price = bin_upper_price

        self.token_x_reserve -= x_returned
        self.token_y_reserve -= y_returned

        return x_returned + fees_x, y_returned + fees_y

    def swap(self, token_in: str, amount_in: int) -> int:
        if token_in not in ['X', 'Y']:
            raise ValueError("token_in must be 'X' or 'Y'")

        fee_amount = (amount_in * self.fee) // SCALING_FACTOR
        amount_in_after_fee = amount_in - fee_amount

        if token_in == 'X':
            amount_out = self._swap_x_to_y(amount_in_after_fee)
            self.token_x_reserve += amount_in
            self.token_y_reserve -= amount_out
        else:
            amount_out = self._swap_y_to_x(amount_in_after_fee)
            self.token_y_reserve += amount_in
            self.token_x_reserve -= amount_out

        self._distribute_fees(token_in, fee_amount)
        self.update_price()
        self.adjust_fee()
        return amount_out

    def _swap_x_to_y(self, x_in: int) -> int:
        y_out = 0
        remaining_x = x_in
        current_price = self.current_price

        while remaining_x > 0 and current_price < self._get_max_price():
            bin = self._get_or_create_bin(current_price)
            if bin.liquidity > 0:
                dx = min(remaining_x, bin.liquidity)
                # dy = dx * (bin_upper_price - current_price) / current_price
                dy = (dx * (bin.upper_price - current_price)) // current_price
                y_out += dy
                remaining_x -= dx
                bin.liquidity -= dx
                # Update reserves
                self.token_x_reserve += dx
                self.token_y_reserve -= dy
                # Update current price
                if self.token_x_reserve == 0:
                    break  # Avoid division by zero
                current_price = (self.token_y_reserve * SCALING_FACTOR) // self.token_x_reserve
                self.current_price = current_price
            else:
                # Move to the next bin
                current_bin_index = self._get_bin_index(current_price)
                next_bin_index = current_bin_index + 1
                next_bin = self.bins.get(next_bin_index)
                if not next_bin:
                    break  # No liquidity available
                current_price = next_bin.lower_price
                self.current_price = current_price

        return y_out

    def _swap_y_to_x(self, y_in: int) -> int:
        x_out = 0
        remaining_y = y_in
        current_price = self.current_price

        while remaining_y > 0 and current_price > self._get_min_price():
            bin = self._get_or_create_bin(current_price)
            if bin.liquidity > 0:
                dy = min(remaining_y, bin.liquidity)
                # dx = dy * current_price / (bin_upper_price - current_price)
                if (bin.upper_price - current_price) == 0:
                    dx = 0
                else:
                    dx = (dy * current_price) // (bin.upper_price - current_price)
                x_out += dx
                remaining_y -= dy
                bin.liquidity -= dx
                # Update reserves
                self.token_y_reserve += dy
                self.token_x_reserve -= dx
                # Update current price
                if self.token_x_reserve == 0:
                    break  # Avoid division by zero
                current_price = (self.token_y_reserve * SCALING_FACTOR) // self.token_x_reserve
                self.current_price = current_price
            else:
                # Move to the previous bin
                current_bin_index = self._get_bin_index(current_price)
                prev_bin_index = current_bin_index - 1
                prev_bin = self.bins.get(prev_bin_index)
                if not prev_bin:
                    break  # No liquidity available
                current_price = prev_bin.upper_price
                self.current_price = current_price

        return x_out

    def _distribute_fees(self, token_in: str, fee_amount: int):
        active_bins = self._get_active_bins()
        total_liquidity = sum(bin.liquidity for bin in active_bins)

        if total_liquidity == 0:
            return  # No liquidity to distribute fees

        for bin in active_bins:
            # bin_fee_share = fee_amount * bin.liquidity / total_liquidity
            bin_fee_share = (fee_amount * bin.liquidity) // total_liquidity
            for position in bin.positions.values():
                # position_fee_share = bin_fee_share * position.liquidity / bin.liquidity
                if bin.liquidity == 0:
                    continue  # Avoid division by zero
                position_fee_share = (bin_fee_share * position.liquidity) // bin.liquidity
                if token_in == 'X':
                    position.fees_earned_x += position_fee_share
                else:
                    position.fees_earned_y += position_fee_share

    def _get_active_bins(self) -> List[LiquidityBin]:
        return [bin for bin in self.bins.values() if bin.lower_price <= self.current_price < bin.upper_price]

    def _get_min_price(self) -> int:
        return min(bin.lower_price for bin in self.bins.values()) if self.bins else 0

    def _get_max_price(self) -> int:
        return max(bin.upper_price for bin in self.bins.values()) if self.bins else SCALING_FACTOR * 10**18  # Represent infinity with a large number

    def update_price(self):
        if self.token_x_reserve == 0:
            raise ZeroDivisionError("Token X reserve is zero, cannot update price.")
        self.current_price = (self.token_y_reserve * SCALING_FACTOR) // self.token_x_reserve
        self.price_history.append(self.current_price)

    def adjust_fee(self):
        # Implement dynamic fee adjustment based on volatility and liquidity depth
        active_bins = self._get_active_bins()
        liquidity = sum(bin.liquidity for bin in active_bins)
        volatility = self.calculate_volatility()
        # Example dynamic fee formula
        # fee = base_fee + (volatility_factor * volatility) - (liquidity_factor * liquidity)
        base_fee = scale(0.003)  # 0.3%
        volatility_factor = scale(0.001)  # Adjust as needed
        liquidity_factor = scale(0.0001)  # Adjust as needed
        # Calculate new_fee = base_fee + (volatility * volatility_factor) - (liquidity * liquidity_factor)
        # To maintain precision, multiply first before dividing
        new_fee = base_fee + ((volatility * volatility_factor) // SCALING_FACTOR) - ((liquidity * liquidity_factor) // SCALING_FACTOR)
        # Clamp the fee between 0.1% and 1%
        min_fee = scale(0.001)
        max_fee = scale(0.01)
        if new_fee < min_fee:
            new_fee = min_fee
        elif new_fee > max_fee:
            new_fee = max_fee
        self.fee = new_fee

    def calculate_volatility(self) -> int:
        # Calculate volatility as the standard deviation of price changes
        if len(self.price_history) < 2:
            return 0

        changes = []
        previous_price = None
        for price in self.price_history:
            if previous_price is not None and previous_price > 0:
                # change = (price - previous_price) / previous_price
                change = ((price - previous_price) * SCALING_FACTOR) // previous_price
                changes.append(change)
            previous_price = price

        if not changes:
            return 0

        # Calculate mean
        mean_change = sum(changes) // len(changes)

        # Calculate variance
        variance = sum(((change - mean_change) * (change - mean_change)) for change in changes) // len(changes)

        # Calculate standard deviation (integer approximation)
        std_dev = int(math.isqrt(variance)) if variance >= 0 else 0
        return std_dev

    def get_price_history(self) -> List[float]:
        return [descale(price) for price in self.price_history]

    def get_liquidity_positions(self, user_id: str) -> List[LiquidityPosition]:
        positions = []
        for bin in self.bins.values():
            if user_id in bin.positions:
                positions.append(bin.positions[user_id])
        return positions

    def get_reserves(self) -> Tuple[float, float]:
        return descale(self.token_x_reserve), descale(self.token_y_reserve)

    def get_current_price(self) -> float:
        return descale(self.current_price)

    def get_fee(self) -> float:
        return descale(self.fee)
