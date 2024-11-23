import axios from "axios";

const BASE_URL = "https://safion-simple-backend.onrender.com";

export const getTonPriceInUsd = async (amount: number) => {
  try {
    console.log(amount, "amount");
    const response = await axios.get(
      `${BASE_URL}/liquidity-providers/price/ton/usd`,
      {
        params: { amount },
      }
    );
    console.log(response, "price1");
    return response.data;
  } catch (error) {
    console.error("Error fetching TON price:", error);
    throw error;
  }
};
