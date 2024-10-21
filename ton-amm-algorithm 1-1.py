from decimal import Decimal
from typing import Dict, Tuple, List

class LiquidityPosition:
    def __init__(self, lower_price: Decimal, upper_price: Decimal, liquidity: Decimal):
        self.lower_price = lower_price
        self.upper_price = upper_price
        self.liquidity = liquidity
        # self.fees_earned_x = Decimal('0')
        # self.fees_earned_y = Decimal('0')
        # Track the fee growth per unit of liquidity when position was created/last updated
        self.fee_growth_inside_x_last = Decimal('0')
        self.fee_growth_inside_y_last = Decimal('0')
        # Accumulated fees that are owed to the position
        self.tokens_owed_x = Decimal('0')
        self.tokens_owed_y = Decimal('0')

class LiquidityBin:
    def __init__(self, lower_price: Decimal, upper_price: Decimal):
        self.lower_price = lower_price
        self.upper_price = upper_price
        self.liquidity = Decimal('0')
        self.positions: Dict[str, LiquidityPosition] = {}
        # Track fees per unit of liquidity
        self.fee_growth_global_x = Decimal('0')
        self.fee_growth_global_y = Decimal('0')


class AMM:
    def __init__(self, initial_price: Decimal, bin_width: Decimal):
        self.current_price = initial_price
        self.bin_width = bin_width
        self.bins: Dict[int, LiquidityBin] = {}
        self.token_x_reserve = Decimal('0')
        self.token_y_reserve = Decimal('0')
        self.fee = Decimal('0.003')  # Start with 0.3% fee

        # Global fee accumulators
        self.global_fee_x_accumulator = Decimal('0')
        self.global_fee_y_accumulator = Decimal('0')

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

        x_used = Decimal('0')
        y_used = Decimal('0')

        current_price = lower_price
        while current_price < upper_price:
            bin = self._get_or_create_bin(current_price)
            bin_upper_price = min(bin.upper_price, upper_price)
            
            if self.current_price < bin.lower_price:
                # Only X token
                dx = amount_x * (bin_upper_price - current_price) / (upper_price - lower_price)
                liquidity = dx
                x_used += dx
            elif self.current_price > bin.upper_price:
                # Only Y token
                dy = amount_y * (bin_upper_price - current_price) / (upper_price - lower_price)
                liquidity = dy
                y_used += dy
            else:
                # Both tokens
                dx = amount_x * (bin_upper_price - current_price) / (upper_price - lower_price)
                dy = amount_y * (bin_upper_price - current_price) / (upper_price - lower_price)
                liquidity = min(dx, dy)
                x_used += dx
                y_used += dy

            # Update or create position with proper fee tracking
            if user_id in bin.positions:
                # If position exists, update fees before adding liquidity
                position = bin.positions[user_id]
                self._update_position_fees(position, bin)
                position.liquidity += liquidity
            else:
                # Create new position with current fee growth checkpoints
                position = LiquidityPosition(
                    lower_price=bin.lower_price,
                    upper_price=bin.upper_price,
                    liquidity=liquidity
                )
                # Initialize fee growth checkpoints to current global values
                position.fee_growth_inside_x_last = bin.fee_growth_global_x
                position.fee_growth_inside_y_last = bin.fee_growth_global_y
                bin.positions[user_id] = position

            bin.liquidity += liquidity
            if user_id not in bin.positions:
                bin.positions[user_id] = LiquidityPosition(bin.lower_price, bin.upper_price, Decimal('0'))
            bin.positions[user_id].liquidity += liquidity

            current_price = bin_upper_price

        self.token_x_reserve += x_used
        self.token_y_reserve += y_used

        return x_used, y_used

    def remove_liquidity(self, user_id: str, lower_price: Decimal, upper_price: Decimal, liquidity_percentage: Decimal) -> Tuple[Decimal, Decimal]:
        if liquidity_percentage <= 0 or liquidity_percentage > 1:
            raise ValueError("Liquidity percentage must be between 0 and 1")

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

                # Update fees before removing liquidity
                self._update_position_fees(position, bin)

                liquidity_to_remove = position.liquidity * liquidity_percentage

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
                    dx = liquidity_to_remove * (self.current_price - bin.lower_price) / self.current_price
                    dy = liquidity_to_remove * (bin.upper_price - self.current_price) / self.current_price
                    x_returned += dx
                    y_returned += dy

                # # Calculate and add fees
                # fees_x += position.fees_earned_x * liquidity_percentage
                # fees_y += position.fees_earned_y * liquidity_percentage
                # position.fees_earned_x -= position.fees_earned_x * liquidity_percentage
                # position.fees_earned_y -= position.fees_earned_y * liquidity_percentage

                # Add accumulated fees
                x_returned += position.tokens_owed_x * liquidity_percentage
                y_returned += position.tokens_owed_y * liquidity_percentage
                
                # Update position state
                position.tokens_owed_x -= position.tokens_owed_x * liquidity_percentage
                position.tokens_owed_y -= position.tokens_owed_y * liquidity_percentage

                bin.liquidity -= liquidity_to_remove
                position.liquidity -= liquidity_to_remove

                if position.liquidity == 0:
                    del bin.positions[user_id]

            current_price = bin_upper_price

        self.token_x_reserve -= x_returned
        self.token_y_reserve -= y_returned

        return x_returned + fees_x, y_returned + fees_y

    def swap(self, token_in: str, amount_in: Decimal) -> Decimal:
        fee_amount = amount_in * self.fee
        amount_in_after_fee = amount_in - fee_amount

        if token_in == 'X':
            amount_out = self._swap_x_to_y(amount_in_after_fee)
            self.token_x_reserve += amount_in
            self.token_y_reserve -= amount_out

            # Update the global fee accumulator for X
            self.global_fee_x_accumulator += fee_amount
        else:
            amount_out = self._swap_y_to_x(amount_in_after_fee)
            self.token_y_reserve += amount_in
            self.token_x_reserve -= amount_out

            # Update the global fee accumulator for Y
            self.global_fee_y_accumulator += fee_amount
        
        self.update_price()
        self.adjust_fee()
        return amount_out

    def _swap_x_to_y(self, x_in: Decimal, fee_amount: Decimal) -> Decimal:
        y_out = Decimal('0')
        remaining_x = x_in
        current_price = self.current_price
        active_bins = []

        while remaining_x > 0 and current_price < self._get_max_price():
            bin = self._get_or_create_bin(current_price)
            if bin.liquidity > 0:
                dx = min(remaining_x, bin.liquidity)
                dy = dx * (bin.upper_price - current_price) / current_price
                y_out += dy
                remaining_x -= dx
                active_bins.append(bin)
            current_price = bin.upper_price

        # Distribute fees across active bins
        if active_bins:
            total_liquidity = sum(bin.liquidity for bin in active_bins)
            fee_per_liquidity = fee_amount / total_liquidity
            for bin in active_bins:
                bin.fee_growth_global_x += fee_per_liquidity

        return y_out

    def _swap_y_to_x(self, y_in: Decimal, fee_amount: Decimal) -> Decimal:
        x_out = Decimal('0')
        remaining_y = y_in
        current_price = self.current_price
        active_bins = []

        while remaining_y > 0 and current_price > self._get_min_price():
            bin = self._get_or_create_bin(current_price)
            if bin.liquidity > 0:
                dy = min(remaining_y, bin.liquidity)
                dx = dy * current_price / (bin.upper_price - current_price)
                x_out += dx
                remaining_y -= dy
                active_bins.append(bin)
            current_price = bin.lower_price

        # Distribute fees across active bins
        if active_bins:
            total_liquidity = sum(bin.liquidity for bin in active_bins)
            fee_per_liquidity = fee_amount / total_liquidity
            for bin in active_bins:
                bin.fee_growth_global_y += fee_per_liquidity

        return x_out
    
    def _update_position_fees(self, position: LiquidityPosition, bin: LiquidityBin) -> None:
        # Calculate fees earned since last update
        fee_growth_delta_x = bin.fee_growth_global_x - position.fee_growth_inside_x_last
        fee_growth_delta_y = bin.fee_growth_global_y - position.fee_growth_inside_y_last
        
        # Update owed tokens based on existing liquidity
        if position.liquidity > 0:
            position.tokens_owed_x += position.liquidity * fee_growth_delta_x
            position.tokens_owed_y += position.liquidity * fee_growth_delta_y
        
        # Update last fee growth checkpoints
        position.fee_growth_inside_x_last = bin.fee_growth_global_x
        position.fee_growth_inside_y_last = bin.fee_growth_global_y

    def collect_fees(self, user_id: str, lower_price: Decimal, upper_price: Decimal) -> Tuple[Decimal, Decimal]:
        """Collect accumulated fees without removing liquidity"""
        x_collected = Decimal('0')
        y_collected = Decimal('0')

        current_price = lower_price
        while current_price < upper_price:
            bin = self._get_or_create_bin(current_price)
            bin_upper_price = min(bin.upper_price, upper_price)

            if user_id in bin.positions:
                position = bin.positions[user_id]
                
                # Update and collect fees
                self._update_position_fees(position, bin)
                
                # Collect all accumulated fees
                x_collected += position.tokens_owed_x
                y_collected += position.tokens_owed_y
                
                # Reset owed tokens
                position.tokens_owed_x = Decimal('0')
                position.tokens_owed_y = Decimal('0')

            current_price = bin_upper_price

        return x_collected, y_collected

    # def _distribute_fees(self, token_in: str, fee_amount: Decimal):
    #     active_bins = self._get_active_bins()
    #     total_liquidity = sum(bin.liquidity for bin in active_bins)

    #     for bin in active_bins:
    #         bin_fee_share = fee_amount * bin.liquidity / total_liquidity
    #         for position in bin.positions.values():
    #             position_fee_share = bin_fee_share * position.liquidity / bin.liquidity
    #             if token_in == 'X':
    #                 position.fees_earned_x += position_fee_share
    #             else:
    #                 position.fees_earned_y += position_fee_share

    def _get_active_bins(self) -> List[LiquidityBin]:
        return [bin for bin in self.bins.values() if bin.lower_price <= self.current_price < bin.upper_price]

    def _get_min_price(self) -> Decimal:
        return min(bin.lower_price for bin in self.bins.values()) if self.bins else Decimal('0')

    def _get_max_price(self) -> Decimal:
        return max(bin.upper_price for bin in self.bins.values()) if self.bins else Decimal('inf')

    def update_price(self):
        self.current_price = self.token_y_reserve / self.token_x_reserve

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
