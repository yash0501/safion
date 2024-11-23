"use client";
import { useState } from "react";
import axios from "axios";
import { debounce } from "lodash";
import Navbar from "@/pages/Navbar.tsx";
import StarfieldAnimation from "react-starfield";
import { useTonAddress, useTonConnectUI } from "@tonconnect/ui-react";
import { message } from "antd";

// Component: Swap
interface PriceData {
  pricePerUnit: number;
  finalPrice: number;
}

const Swap = () => {
  const [sellAmount, setSellAmount] = useState("");
  const [buyAmount, setBuyAmount] = useState("");
  const [priceDataSell, setPriceDataSell] = useState<PriceData | null>(null);
  const [priceDataBuy, setPriceDataBuy] = useState<PriceData | null>(null);
  const [loadingSell, setLoadingSell] = useState(false);
  const [loadingBuy, setLoadingBuy] = useState(false);
  const [error, setError] = useState("");
  const tonAddress = useTonAddress();
  const [tonConnectUI] = useTonConnectUI();

  // Fetch price for selling TON
  const fetchPriceSell = debounce(async (amount) => {
    setLoadingSell(true);
    setError("");
    try {
      const response = await axios.get(
        `https://safion-simple-backend.onrender.com/liquidity-providers/price/ton/usd`,
        { params: { amount } }
      );
      setPriceDataSell(response.data);
      setBuyAmount(response.data.finalPrice);
    } catch (error) {
      setError("Failed to fetch TON sell price. Please try again.");
    } finally {
      setLoadingSell(false);
    }
  }, 500);

  const fetchPriceBuy = debounce(async (amount) => {
    setLoadingBuy(true);
    setError("");
    try {
      const response = await axios.get(
        `https://safion-simple-backend.onrender.com/liquidity-providers/price/usdc/ton`,
        { params: { amount } }
      );
      console.log(response, "price1");
      setPriceDataBuy(response.data);
      setSellAmount(response.data.finalPrice); // Auto-update sell amount
    } catch (error) {
      setError("Failed to fetch TON buy price. Please try again.");
    } finally {
      setLoadingBuy(false);
    }
  }, 500);

  // Handle change in sell amount
  const handleSellAmountChange = (e) => {
    const value = e.target.value;
    setSellAmount(value);

    if (value) {
      fetchPriceSell(value);
    }
  };

  // Handle change in buy amount
  const handleBuyAmountChange = (e) => {
    const value = e.target.value;
    setBuyAmount(value);

    if (value) {
      fetchPriceBuy(value);
    }
  };

  // Placeholder swap handler
  const handleSwap = async () => {
    if (!tonAddress) {
      message.error("Please connect your wallet first.");
      console.error("TON Connect UI not available.");
      return;
    }
    const transactionData = {
      validUntil: Math.floor(Date.now() / 1000) + 60,
      messages: [
        {
          address: "address",
          amount: `${parseFloat(sellAmount) * 1e9}`,
          bounce: false,
          payload: "",
        },
      ],
    };

    try {
      await tonConnectUI.sendTransaction(transactionData);
      console.log("Sell transaction successfully sent!");
      setSellAmount("");
      setBuyAmount("");
    } catch (error) {
      console.error("Error sending sell transaction:", error);
    }
  };

  return (
    <>
      <Navbar />
      <StarfieldAnimation
        numParticles={500}
        depth={500}
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          zIndex: -1,
        }}
      />
      <div className="flex items-center justify-center h-screen bg-gray-900">
        <div className="bg-gray-900 p-6 rounded-lg shadow-lg text-white max-w-md w-full">
          {/* Sell Section */}
          <div className="flex items-center justify-between bg-gray-800 rounded-lg p-4 mb-4">
            <div className="flex-1 mr-4">
              <label className="block text-sm mb-2">Sell</label>
              <input
                type="text"
                value={sellAmount}
                placeholder="Enter amount to sell"
                onChange={handleSellAmountChange}
                className="text-2xl bg-transparent outline-none w-full text-white placeholder-1xl placeholder-gray-500 border-b-2 border-gray-700 focus:border-purple-600 transition duration-200"
              />
              <div className="text-gray-500 text-sm mt-1">
                {loadingSell
                  ? "Loading sell price..."
                  : priceDataSell
                  ? `Price per Unit: $${priceDataSell.pricePerUnit.toFixed(2)}`
                  : "Price per Unit: $0.00"}
              </div>
            </div>
            <div className="bg-gray-700 text-white px-3 py-2 rounded-lg flex items-center space-x-1">
              <span>TON</span>
            </div>
          </div>

          {/* Buy Section */}
          <div className="flex items-center justify-between bg-gray-800 rounded-lg p-4 mb-4">
            <div className="flex-1 mr-4">
              <label className="block text-sm mb-2">Buy</label>
              <input
                type="text"
                value={buyAmount}
                placeholder="Enter amount to buy"
                onChange={handleBuyAmountChange}
                className="text-2xl bg-transparent outline-none w-full text-white placeholder-1xl placeholder-gray-500 border-b-2 border-gray-700 focus:border-purple-600 transition duration-200"
              />
              <div className="text-gray-500 text-sm mt-1">
                {loadingBuy
                  ? "Loading buy price..."
                  : priceDataBuy
                  ? `Price per Unit: $${priceDataBuy.pricePerUnit.toFixed(2)}`
                  : "Price per Unit: $0.00"}
              </div>
            </div>
            <div className="bg-gray-700 text-white px-3 py-2 rounded-lg flex items-center space-x-1">
              <span>USD</span>
            </div>
          </div>

          {/* Swap Button */}
          <div className="flex justify-center mb-4">
            <button
              onClick={handleSwap}
              className="bg-purple-700 text-white px-4 py-2 rounded-lg hover:bg-purple-800 transition w-full"
            >
              Swap
            </button>
          </div>

          {/* Error Message */}
          {error && <div className="text-red-500 text-sm mt-4">{error}</div>}
        </div>
      </div>
    </>
  );
};

export default Swap;
