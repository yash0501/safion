from decimal import Decimal, getcontext
from typing import Dict, Tuple, List, Optional
from dataclasses import dataclass
from datetime import datetime
import requests  # Assuming the oracle provides a REST API endpoint

# Set decimal precision
getcontext().prec = 28

@dataclass
class SwapResult:
    amount_in: Decimal
    amount_out: Decimal
    fee_amount: Decimal
    next_price: Decimal
    bins_touched: List[int]

class LiquidityPosition:
    def __init__(self, user_id: str, lower_price: Decimal, upper_price: Decimal, liquidity: Decimal):
        self.user_id = user_id
        self.lower_price = lower_price
        self.upper_price = upper_price
        self.liquidity = liquidity
        self.fee_growth_inside_x_last = Decimal('0')
        self.fee_growth_inside_y_last = Decimal('0')
        self.tokens_owed_x = Decimal('0')
        self.tokens_owed_y = Decimal('0')

class LiquidityBin:
    def __init__(self, bin_id: int, lower_price: Decimal, upper_price: Decimal):
        self.bin_id = bin_id
        self.lower_price = lower_price
        self.upper_price = upper_price
        self.liquidity = Decimal('0')
        self.fee_growth_global_x = Decimal('0')
        self.fee_growth_global_y = Decimal('0')

class PositionManager:
    def __init__(self, bin_step: Decimal):
        self.positions: Dict[str, LiquidityPosition] = {}  # position_id -> Position
        self.bin_step = bin_step

    def _generate_position_id(self, user_id: str, lower_price: Decimal, upper_price: Decimal) -> str:
        """Generate a unique position ID based on user and price range"""
        return f"{user_id}_{lower_price}_{upper_price}"

    def create_position(self, user_id: str, lower_price: Decimal, upper_price: Decimal, 
                       liquidity: Decimal) -> LiquidityPosition:
        # Ensure prices align with bin boundaries
        adjusted_lower = self._align_to_bin(lower_price)
        adjusted_upper = self._align_to_bin(upper_price)
        
        position_id = self._generate_position_id(user_id, adjusted_lower, adjusted_upper)
        position = LiquidityPosition(user_id, adjusted_lower, adjusted_upper, liquidity)
        self.positions[position_id] = position
        return position

    def get_position(self, user_id: str, lower_price: Decimal, upper_price: Decimal) -> Optional[LiquidityPosition]:
        position_id = self._generate_position_id(user_id, lower_price, upper_price)
        return self.positions.get(position_id)

    def remove_position(self, user_id: str, lower_price: Decimal, upper_price: Decimal) -> None:
        position_id = self._generate_position_id(user_id, lower_price, upper_price)
        if position_id in self.positions:
            del self.positions[position_id]

    def _align_to_bin(self, price: Decimal) -> Decimal:
        """Align a price to the nearest bin boundary based on absolute price"""
        bin_id = int(price / self.bin_step)
        return Decimal(bin_id) * self.bin_step

    def get_affected_bins(self, lower_price: Decimal, upper_price: Decimal) -> List[int]:
        """Get list of bin IDs that a position spans"""
        start_bin = int(lower_price / self.bin_step)
        end_bin = int((upper_price / self.bin_step) + 1)
        return list(range(start_bin, end_bin))

class AMM:
    def __init__(self, initial_price: Decimal, bin_step: Decimal, oracle_url: str):
        self.current_price = initial_price
        self.bin_step = bin_step
        self.bins: Dict[int, LiquidityBin] = {}
        self.token_x_reserve = Decimal('0')
        self.token_y_reserve = Decimal('0')
        self.fee = Decimal('0.003')
        self.position_manager = PositionManager(bin_step)

        # Fee acceleration parameters
        self.base_fee = Decimal('0.003')  # 0.3% base fee
        self.max_fee = Decimal('0.01')    # 1% max fee
        self.volatility_accumulator = Decimal('0')
        self.last_price = initial_price

        # Minimal price tracking using oracles
        self.last_price_x = Decimal('1')
        self.last_price_y = Decimal('1')
        self.last_price_timestamp = datetime.now().timestamp()
        self.price_update_threshold = 15  # seconds
        self.oracle_url = oracle_url  # URL to fetch oracle prices

    def _get_bin_id(self, price: Decimal) -> int:
        """Convert a price to its corresponding bin ID based on absolute price"""
        return int(price / self.bin_step)

    def _get_bin_price_range(self, bin_id: int) -> Tuple[Decimal, Decimal]:
        """Get the price range for a given bin ID based on absolute price"""
        lower_price = Decimal(bin_id) * self.bin_step
        upper_price = lower_price + self.bin_step
        return lower_price, upper_price

    def _get_or_create_bin(self, price: Decimal) -> LiquidityBin:
        bin_id = self._get_bin_id(price)
        if bin_id not in self.bins:
            lower_price, upper_price = self._get_bin_price_range(bin_id)
            self.bins[bin_id] = LiquidityBin(bin_id, lower_price, upper_price)
        return self.bins[bin_id]

    def fetch_oracle_prices(self) -> Tuple[Decimal, Decimal]:
        """
        Fetch the latest prices from the oracle.
        This example assumes the oracle provides a JSON response with 'price_x' and 'price_y'.
        """
        try:
            response = requests.get(self.oracle_url, timeout=5)
            data = response.json()
            price_x = Decimal(str(data['price_x']))
            price_y = Decimal(str(data['price_y']))
            return price_x, price_y
        except Exception as e:
            # Handle exceptions, possibly using fallback mechanisms
            print(f"Oracle fetch failed: {e}")
            return self.last_price_x, self.last_price_y  # Return last known prices

    def update_price_if_needed(self, current_timestamp: int) -> bool:
        """
        Update prices if the threshold is met and price impact is significant.
        Returns True if prices were updated.
        """
        # Check if it's time to update the price
        time_diff = current_timestamp - self.last_price_timestamp
        if time_diff < self.price_update_threshold:
            return False

        # Fetch new prices from the oracle
        new_price_x, new_price_y = self.fetch_oracle_prices()

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

    def add_liquidity(self, user_id: str, amount_x: Decimal, amount_y: Decimal, 
                     lower_price: Decimal, upper_price: Decimal) -> Tuple[Decimal, Decimal]:
        """Add liquidity to a price range based on absolute pricing"""
        # Update price if needed before adding liquidity
        current_timestamp = int(datetime.now().timestamp())
        self.update_price_if_needed(current_timestamp)

        if lower_price >= upper_price:
            raise ValueError("Lower price must be less than upper price")

        # Align prices to bin boundaries
        adjusted_lower = self.position_manager._align_to_bin(lower_price)
        adjusted_upper = self.position_manager._align_to_bin(upper_price)

        affected_bins = self.position_manager.get_affected_bins(adjusted_lower, adjusted_upper)
        if not affected_bins:
            raise ValueError("Invalid price range")

        x_used = Decimal('0')
        y_used = Decimal('0')
        total_liquidity = Decimal('0')

        # Calculate and distribute liquidity across bins
        for bin_id in affected_bins:
            bin = self._get_or_create_bin(Decimal(bin_id) * self.bin_step)
            bin_share = (bin.upper_price - bin.lower_price) / (adjusted_upper - adjusted_lower)
            
            if self.current_price < bin.lower_price:
                # Only X token
                dx = amount_x * bin_share
                liquidity = dx
                x_used += dx
            elif self.current_price > bin.upper_price:
                # Only Y token
                dy = amount_y * bin_share
                liquidity = dy
                y_used += dy
            else:
                # Both tokens
                dx = amount_x * bin_share
                dy = amount_y * bin_share
                liquidity = min(dx, dy)
                x_used += dx
                y_used += dy

            bin.liquidity += liquidity
            total_liquidity += liquidity

        # Create or update position
        position = self.position_manager.create_position(
            user_id, adjusted_lower, adjusted_upper, total_liquidity
        )

        self.token_x_reserve += x_used
        self.token_y_reserve += y_used
        return x_used, y_used

    def remove_liquidity(self, user_id: str, lower_price: Decimal, upper_price: Decimal, 
                        liquidity_percentage: Decimal) -> Tuple[Decimal, Decimal]:
        """
        Remove liquidity from a position and collect accumulated fees
        Returns (amount_x, amount_y) representing tokens returned to the user
        """
        # Update price if needed before removing liquidity
        current_timestamp = int(datetime.now().timestamp())
        self.update_price_if_needed(current_timestamp)

        if not (Decimal('0') < liquidity_percentage <= Decimal('1')):
            raise ValueError("Liquidity percentage must be between 0 and 1")

        position = self.position_manager.get_position(user_id, lower_price, upper_price)
        if not position:
            raise ValueError("Position not found")

        # Calculate accumulated fees first
        self._update_position_fees(position)
        
        affected_bins = self.position_manager.get_affected_bins(position.lower_price, position.upper_price)
        liquidity_to_remove = position.liquidity * liquidity_percentage

        x_returned = Decimal('0')
        y_returned = Decimal('0')

        # Remove liquidity from each affected bin
        for bin_id in affected_bins:
            bin = self.bins[bin_id]
            bin_range = bin.upper_price - bin.lower_price
            position_range = position.upper_price - position.lower_price
            
            # Calculate the portion of liquidity in this bin
            bin_liquidity = liquidity_to_remove * (bin_range / position_range)
            
            if self.current_price < bin.lower_price:
                # Only X token in this bin
                dx = bin_liquidity
                x_returned += dx
            elif self.current_price > bin.upper_price:
                # Only Y token in this bin
                dy = bin_liquidity
                y_returned += dy
            else:
                # Both tokens in this bin
                price_range = bin.upper_price - bin.lower_price
                price_below = self.current_price - bin.lower_price
                price_above = bin.upper_price - self.current_price
                
                dx = bin_liquidity * (price_below / price_range)
                dy = bin_liquidity * (price_above / price_range)
                x_returned += dx
                y_returned += dy
            
            bin.liquidity -= bin_liquidity

        # Add accumulated fees
        x_returned += position.tokens_owed_x * liquidity_percentage
        y_returned += position.tokens_owed_y * liquidity_percentage

        # Update position state
        position.tokens_owed_x -= position.tokens_owed_x * liquidity_percentage
        position.tokens_owed_y -= position.tokens_owed_y * liquidity_percentage
        position.liquidity -= liquidity_to_remove

        # Remove position if all liquidity is withdrawn
        if position.liquidity == 0:
            self.position_manager.remove_position(user_id, lower_price, upper_price)

        # Update global state
        self.token_x_reserve -= x_returned
        self.token_y_reserve -= y_returned

        return x_returned, y_returned

    def swap(self, token_in: str, amount_in: Decimal) -> SwapResult:
        """
        Execute a swap operation with optimal routing and fee distribution
        Returns SwapResult containing swap details and execution path
        """
        if amount_in <= 0:
            raise ValueError("Amount must be positive")

        # Update price if needed before swapping
        current_timestamp = int(datetime.now().timestamp())
        self.update_price_if_needed(current_timestamp)

        # Calculate dynamic fee based on market conditions
        current_fee = self._calculate_dynamic_fee()
        fee_amount = amount_in * current_fee
        amount_in_after_fee = amount_in - fee_amount

        bins_touched = []
        amount_out = Decimal('0')
        remaining_amount = amount_in_after_fee
        next_price = self.current_price

        if token_in == 'X':
            # Swap X for Y (price increases)
            while remaining_amount > 0:
                current_bin = self._get_or_create_bin(next_price)
                if current_bin.liquidity == 0:
                    next_bin_price = self.get_next_bin_price(next_price)
                    if next_bin_price >= self._get_max_price():
                        break
                    next_price = next_bin_price
                    continue

                bins_touched.append(current_bin.bin_id)
                
                # Calculate maximum input possible for this bin
                max_dx = current_bin.liquidity * (current_bin.upper_price - next_price) / next_price
                dx = min(remaining_amount, max_dx)
                
                # Calculate output amount for this bin
                dy = dx * next_price / (current_bin.upper_price - next_price)
                
                remaining_amount -= dx
                amount_out += dy
                next_price = current_bin.upper_price if dx == max_dx else next_price

                if dx == max_dx:
                    next_price = self.get_next_bin_price(next_price)
                    if next_price >= self._get_max_price():
                        break
        else:
            # Swap Y for X (price decreases)
            while remaining_amount > 0:
                current_bin = self._get_or_create_bin(next_price)
                if current_bin.liquidity == 0:
                    next_bin_price = self.get_prev_bin_price(next_price)
                    if next_bin_price <= self._get_min_price():
                        break
                    next_price = next_bin_price
                    continue

                bins_touched.append(current_bin.bin_id)
                
                # Calculate maximum input possible for this bin
                max_dy = current_bin.liquidity
                dy = min(remaining_amount, max_dy)
                
                # Calculate output amount for this bin
                dx = dy * (current_bin.upper_price - next_price) / next_price
                
                remaining_amount -= dy
                amount_out += dx
                next_price = current_bin.lower_price if dy == max_dy else next_price

                if dy == max_dy:
                    next_price = self.get_prev_bin_price(next_price)
                    if next_price <= self._get_min_price():
                        break

        # Distribute fees across affected bins
        self._distribute_fees(bins_touched, fee_amount, token_in)

        # Update reserves
        if token_in == 'X':
            self.token_x_reserve += amount_in
            self.token_y_reserve -= amount_out
        else:
            self.token_y_reserve += amount_in
            self.token_x_reserve -= amount_out

        # Update price and volatility metrics
        self._update_price_metrics(next_price)

        return SwapResult(
            amount_in=amount_in,
            amount_out=amount_out,
            fee_amount=fee_amount,
            next_price=next_price,
            bins_touched=bins_touched
        )

    def get_price_from_bin_id(self, bin_id: int) -> Decimal:
        """Get the price at the start of a bin based on absolute price"""
        return Decimal(bin_id) * self.bin_step

    def get_bin_id_from_price(self, price: Decimal) -> int:
        """Get the bin ID that contains a given absolute price"""
        return int(price / self.bin_step)

    def get_next_bin_price(self, price: Decimal) -> Decimal:
        """Get the price at the start of the next bin based on absolute price"""
        current_bin = self.get_bin_id_from_price(price)
        return self.get_price_from_bin_id(current_bin + 1)

    def get_prev_bin_price(self, price: Decimal) -> Decimal:
        """Get the price at the start of the previous bin based on absolute price"""
        current_bin = self.get_bin_id_from_price(price)
        return self.get_price_from_bin_id(current_bin - 1)
    
    def _calculate_dynamic_fee(self) -> Decimal:
        """
        Calculate dynamic fee based on market conditions
        Takes into account:
        1. Volatility
        2. Liquidity depth
        3. Price impact
        """
        # Volatility component
        volatility_factor = self.volatility_accumulator / Decimal('100')
        
        # Liquidity depth component
        active_bins = self._get_active_bins()
        total_liquidity = sum(bin.liquidity for bin in active_bins)
        liquidity_factor = Decimal('1') / (Decimal('1') + total_liquidity / Decimal('10000'))
        
        # Combine factors
        dynamic_fee = self.base_fee + (self.max_fee - self.base_fee) * (
            Decimal('0.7') * volatility_factor + 
            Decimal('0.3') * liquidity_factor
        )
        
        return min(dynamic_fee, self.max_fee)

    def _distribute_fees(self, affected_bin_ids: List[int], fee_amount: Decimal, token_in: str) -> None:
        """
        Distribute fees across affected bins based on their contribution to the swap
        """
        if not affected_bin_ids:
            return

        # Calculate total liquidity in affected bins
        total_liquidity = sum(self.bins[bin_id].liquidity for bin_id in affected_bin_ids)
        if total_liquidity == 0:
            return

        # Distribute fees proportionally to liquidity
        for bin_id in affected_bin_ids:
            bin = self.bins[bin_id]
            bin_share = bin.liquidity / total_liquidity
            fee_share = fee_amount * bin_share
            
            if token_in == 'X':
                bin.fee_growth_global_x += fee_share / bin.liquidity
            else:
                bin.fee_growth_global_y += fee_share / bin.liquidity

    def _update_price_metrics(self, new_price: Decimal) -> None:
        """
        Update price-related metrics including volatility
        """
        if self.last_price > 0:
            price_change = abs(new_price - self.last_price) / self.last_price
            # Decay old volatility and add new change
            self.volatility_accumulator = (self.volatility_accumulator * Decimal('0.9') + 
                                         price_change * Decimal('0.1'))
        
        self.last_price = self.current_price
        self.current_price = new_price

    def collect_fees(self, user_id: str, lower_price: Decimal, upper_price: Decimal) -> Tuple[Decimal, Decimal]:
        """
        Collect accumulated fees for a position without removing liquidity
        """
        # Update price if needed before collecting fees
        current_timestamp = int(datetime.now().timestamp())
        self.update_price_if_needed(current_timestamp)

        position = self.position_manager.get_position(user_id, lower_price, upper_price)
        if not position:
            raise ValueError("Position not found")

        self._update_position_fees(position)
        
        x_collected = position.tokens_owed_x
        y_collected = position.tokens_owed_y
        
        # Reset owed tokens
        position.tokens_owed_x = Decimal('0')
        position.tokens_owed_y = Decimal('0')
        
        return x_collected, y_collected

    def _get_active_bins(self) -> List[LiquidityBin]:
        """Retrieve all bins that currently have liquidity"""
        return [bin for bin in self.bins.values() if bin.liquidity > 0]

    def _get_min_price(self) -> Decimal:
        """Define a minimum price boundary to prevent underflow"""
        return Decimal('0.0001')  # Example minimum price

    def _get_max_price(self) -> Decimal:
        """Define a maximum price boundary to prevent overflow"""
        return Decimal('1000000')  # Example maximum price

    def _update_position_fees(self, position: LiquidityPosition) -> None:
        """
        Update the fees owed to a position based on global fee growth
        """
        affected_bins = self.position_manager.get_affected_bins(position.lower_price, position.upper_price)
        for bin_id in affected_bins:
            bin = self.bins.get(bin_id)
            if not bin:
                continue
            # Calculate fee growth since last update
            fee_growth_x = bin.fee_growth_global_x - position.fee_growth_inside_x_last
            fee_growth_y = bin.fee_growth_global_y - position.fee_growth_inside_y_last
            # Update owed tokens
            position.tokens_owed_x += fee_growth_x * position.liquidity
            position.tokens_owed_y += fee_growth_y * position.liquidity
            # Update last fee growth
            position.fee_growth_inside_x_last = bin.fee_growth_global_x
            position.fee_growth_inside_y_last = bin.fee_growth_global_y
