from decimal import Decimal
from typing import Dict, Tuple, List
import math

class LiquidityPosition:
    def __init__(self, lower_price: Decimal, upper_price: Decimal, liquidity: Decimal):
        self.lower_price = lower_price
        self.upper_price = upper_price
        self.liquidity = liquidity
        self.fees_earned_x = Decimal('0')
        self.fees_earned_y = Decimal('0')

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
        self.fee = Decimal('0.003')  # Start with 0.3% fee

    def _get_or_create_bin(self, price: Decimal) -> LiquidityBin:
        bin_index = int(price / self.bin_width)
        if bin_index not in self.bins:
            lower_price = Decimal(bin_index) * self.bin_width
            upper_price = Decimal(bin_index + 1) * self.bin_width
            self.bins[bin_index] = LiquidityBin(lower_price, upper_price)
        return self.bins[bin_index]

    def add_liquidity(self, user_id: str, amount_x: Decimal, amount_y: Decimal, lower_price: Decimal, upper_price: Decimal) -> Tuple[Decimal, Decimal]:
        if lower_price >= upper_price:
            raise ValueError("Lower price must be less than upper price")

        sqrt_lower = Decimal(math.sqrt(float(lower_price)))
        sqrt_upper = Decimal(math.sqrt(float(upper_price)))
        liquidity = min(
            amount_x * (sqrt_upper * sqrt_lower) / (sqrt_upper - sqrt_lower),
            amount_y / (sqrt_upper - sqrt_lower)
        )

        x_used = liquidity * (sqrt_upper - sqrt_lower) / (sqrt_upper * sqrt_lower)
        y_used = liquidity * (sqrt_upper - sqrt_lower)

        current_price = lower_price
        while current_price < upper_price:
            bin = self._get_or_create_bin(current_price)
            bin_upper_price = min(bin.upper_price, upper_price)
            
            bin_liquidity = liquidity * (bin_upper_price - current_price) / (upper_price - lower_price)
            bin.liquidity += bin_liquidity
            
            if user_id not in bin.positions:
                bin.positions[user_id] = LiquidityPosition(bin.lower_price, bin.upper_price, Decimal('0'))
            bin.positions[user_id].liquidity += bin_liquidity

            current_price = bin_upper_price

        return x_used, y_used

    def remove_liquidity(self, user_id: str, lower_price: Decimal, upper_price: Decimal, liquidity_percentage: Decimal) -> Tuple[Decimal, Decimal]:
        if liquidity_percentage <= 0 or liquidity_percentage > 1:
            raise ValueError("Liquidity percentage must be between 0 and 1")

        sqrt_lower = Decimal(math.sqrt(float(lower_price)))
        sqrt_upper = Decimal(math.sqrt(float(upper_price)))
        
        x_returned = Decimal('0')
        y_returned = Decimal('0')
        fees_x = Decimal('0')
        fees_y = Decimal('0')

        current_price = lower_price
        while current_price < upper_price:
            bin = self._get_or_create_bin(current_price)
            bin_upper_price = min(bin.upper_price, upper_price)

            if user_id in bin.positions:
                position = bin.positions[user_id]
                liquidity_to_remove = position.liquidity * liquidity_percentage

                sqrt_current = Decimal(math.sqrt(float(self.current_price)))
                if sqrt_current <= sqrt_lower:
                    x_returned += liquidity_to_remove * (sqrt_upper - sqrt_lower) / (sqrt_upper * sqrt_lower)
                elif sqrt_current >= sqrt_upper:
                    y_returned += liquidity_to_remove * (sqrt_upper - sqrt_lower)
                else:
                    x_returned += liquidity_to_remove * (sqrt_upper - sqrt_current) / (sqrt_upper * sqrt_current)
                    y_returned += liquidity_to_remove * (sqrt_current - sqrt_lower)

                # Calculate and add fees
                fees_x += position.fees_earned_x * liquidity_percentage
                fees_y += position.fees_earned_y * liquidity_percentage
                position.fees_earned_x -= position.fees_earned_x * liquidity_percentage
                position.fees_earned_y -= position.fees_earned_y * liquidity_percentage

                bin.liquidity -= liquidity_to_remove
                position.liquidity -= liquidity_to_remove

                if position.liquidity == 0:
                    del bin.positions[user_id]

            current_price = bin_upper_price

        return x_returned + fees_x, y_returned + fees_y

    def swap(self, token_in: str, amount_in: Decimal) -> Decimal:
        fee_amount = amount_in * self.fee
        amount_in_after_fee = amount_in - fee_amount

        if token_in == 'X':
            amount_out = self._swap_x_to_y(amount_in_after_fee)
        else:
            amount_out = self._swap_y_to_x(amount_in_after_fee)
        
        self._distribute_fees(token_in, fee_amount)
        self.update_price()
        self.adjust_fee()
        return amount_out

    def _swap_x_to_y(self, x_in: Decimal) -> Decimal:
        y_out = Decimal('0')
        remaining_x = x_in
        sqrt_price = Decimal(math.sqrt(float(self.current_price)))

        while remaining_x > 0 and sqrt_price < self._get_max_sqrt_price():
            bin = self._get_or_create_bin(sqrt_price ** 2)
            sqrt_upper = Decimal(math.sqrt(float(bin.upper_price)))
            
            if bin.liquidity > 0:
                dx = min(remaining_x, bin.liquidity * (sqrt_upper - sqrt_price) / (sqrt_price * sqrt_upper))
                dy = bin.liquidity * (sqrt_upper - sqrt_price)
                
                if dx > remaining_x:
                    dy = dy * remaining_x / dx
                    dx = remaining_x
                
                y_out += dy
                remaining_x -= dx
                sqrt_price = sqrt_upper
            else:
                sqrt_price = sqrt_upper

        self.current_price = sqrt_price ** 2
        return y_out

    def _swap_y_to_x(self, y_in: Decimal) -> Decimal:
        x_out = Decimal('0')
        remaining_y = y_in
        sqrt_price = Decimal(math.sqrt(float(self.current_price)))

        while remaining_y > 0 and sqrt_price > self._get_min_sqrt_price():
            bin = self._get_or_create_bin(sqrt_price ** 2)
            sqrt_lower = Decimal(math.sqrt(float(bin.lower_price)))
            
            if bin.liquidity > 0:
                dy = min(remaining_y, bin.liquidity * (sqrt_price - sqrt_lower))
                dx = bin.liquidity * (sqrt_price - sqrt_lower) / (sqrt_price * sqrt_lower)
                
                if dy > remaining_y:
                    dx = dx * remaining_y / dy
                    dy = remaining_y
                
                x_out += dx
                remaining_y -= dy
                sqrt_price = sqrt_lower
            else:
                sqrt_price = sqrt_lower

        self.current_price = sqrt_price ** 2
        return x_out

    def _distribute_fees(self, token_in: str, fee_amount: Decimal):
        active_bins = self._get_active_bins()
        total_liquidity = sum(bin.liquidity for bin in active_bins)

        for bin in active_bins:
            bin_fee_share = fee_amount * bin.liquidity / total_liquidity
            for position in bin.positions.values():
                position_fee_share = bin_fee_share * position.liquidity / bin.liquidity
                if token_in == 'X':
                    position.fees_earned_x += position_fee_share
                else:
                    position.fees_earned_y += position_fee_share

    def _get_active_bins(self) -> List[LiquidityBin]:
        return [bin for bin in self.bins.values() if bin.lower_price <= self.current_price < bin.upper_price]

    def _get_min_sqrt_price(self) -> Decimal:
        return Decimal(math.sqrt(float(min(bin.lower_price for bin in self.bins.values())))) if self.bins else Decimal('0')

    def _get_max_sqrt_price(self) -> Decimal:
        return Decimal(math.sqrt(float(max(bin.upper_price for bin in self.bins.values())))) if self.bins else Decimal('inf')

    def update_price(self):
        # Price is now updated during swaps

    def adjust_fee(self):
        # Implement dynamic fee adjustment based on volatility and liquidity depth
        # This is a simplified example; you'd want a more sophisticated model in practice
        active_bins = self._get_active_bins()
        liquidity = sum(bin.liquidity for bin in active_bins)
        volatility = self.calculate_volatility()  # Implement this based on recent price changes
        self.fee = min(Decimal('0.01'), max(Decimal('0.001'), Decimal('0.003') + (volatility * Decimal('0.1')) - (liquidity * Decimal('0.0001'))))

    def calculate_volatility(self) -> Decimal:
        # Implement volatility calculation here
        # This could be based on recent price movements stored in a rolling window
        return Decimal('0.01')  # Placeholder return value
