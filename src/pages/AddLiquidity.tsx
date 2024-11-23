import { useState, useEffect } from "react";
import Navbar from "@/pages/Navbar.tsx";
import StarfieldAnimation from "react-starfield";
import { useTonAddress, TonConnectButton } from "@tonconnect/ui-react";

const AddLiquidity = () => {
  const tonAddress = useTonAddress(); // Fetch wallet address
  const [selectedPair, setSelectedPair] = useState({
    token1: "TON",
    token2: "USDT",
  });
  const [feeTier, setFeeTier] = useState(null);
  const [lowPrice, setLowPrice] = useState("");
  const [highPrice, setHighPrice] = useState("");
  const [depositAmount1, setDepositAmount1] = useState("");
  const [depositAmount2, setDepositAmount2] = useState("");
  const [userAddress, setUserAddress] = useState("");
  const [isFormValid, setIsFormValid] = useState(false);
  const [isWalletConnected, setIsWalletConnected] = useState(false);

  useEffect(() => {
    // Update userAddress and wallet connection status when wallet is connected
    setUserAddress(tonAddress || ""); // Set empty string if tonAddress is null/undefined
    setIsWalletConnected(!!tonAddress);
  }, [tonAddress]);

  // Validate form inputs
  useEffect(() => {
    const isValid =
      isWalletConnected &&
      selectedPair.token1 &&
      selectedPair.token2 &&
      feeTier !== null &&
      lowPrice &&
      highPrice &&
      depositAmount1 &&
      depositAmount2;

    setIsFormValid(isValid);
  }, [
    isWalletConnected,
    selectedPair,
    feeTier,
    lowPrice,
    highPrice,
    depositAmount1,
    depositAmount2,
  ]);

  const tokens = ["ETH", "USDT", "TON", "1INCH", "ZRX"];

  const updatePriceRange = async (amount, baseToken, targetToken, updateOtherAmount) => {
    try {
      const response = await fetch(
        `https://safion-simple-backend.onrender.com/liquidity-providers/price/${baseToken}/${targetToken}?amount=${amount}`,
        {
          method: "GET",
        }
      );
      if (response.ok) {
        const data = await response.json();
        const pricePerUnit = data.pricePerUnit;
        const totalPrice = data.totalPrice;

        setLowPrice((pricePerUnit / 2).toFixed(4));
        setHighPrice((pricePerUnit * 2).toFixed(4));

        // Update the other deposit amount automatically
        if (updateOtherAmount) {
          if (baseToken === selectedPair.token1) {
            setDepositAmount2(totalPrice.toFixed(4));
          } else {
            setDepositAmount1(totalPrice.toFixed(4));
          }
        }
      } else {
        console.error("Failed to fetch price range", response.statusText);
      }
    } catch (error) {
      console.error("Error fetching price range:", error);
    }
  };

  const handleDepositAmountChange = (amount, isToken1) => {
    if (isToken1) {
      setDepositAmount1(amount);
      updatePriceRange(amount, selectedPair.token1, selectedPair.token2, true);
    } else {
      setDepositAmount2(amount);
      updatePriceRange(amount, selectedPair.token2, selectedPair.token1, true);
    }
  };

  const handleAddLiquidity = async () => {
    if (!isWalletConnected) {
      console.error("Wallet is not connected");
      return;
    }

    const data = {
      lowerPrice: parseFloat(lowPrice),
      upperPrice: parseFloat(highPrice),
      amountX: parseFloat(depositAmount1),
      amountY: parseFloat(depositAmount2),
      tokenX: selectedPair.token1,
      tokenY: selectedPair.token2,
      userAddress,
    };

    try {
      const response = await fetch(
        "https://safion-simple-backend.onrender.com/liquidity-providers/create",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(data),
        }
      );

      if (response.ok) {
        const result = await response.json();
        console.log("Liquidity added successfully:", result);
      } else {
        console.error("Failed to add liquidity", response.statusText);
      }
    } catch (error) {
      console.error("Error adding liquidity:", error);
    }
  };

  return (
    <>
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
      <Navbar />
      <div className="flex items-center justify-center bg-gray-900 text-white min-h-screen p-6">
        <div className="max-w-md w-full bg-gray-800 p-4 rounded-lg shadow-md">
          <h1 className="text-lg font-bold mb-4 text-center">Add Liquidity</h1>

          {/* Pair Selection */}
          <div className="mb-4">
            <label className="block text-sm mb-1">Select pair</label>
            <div className="flex items-center space-x-4 bg-gray-700 p-3 rounded-md">
              <div className="flex items-center space-x-2 flex-1">
                <select
                  value={selectedPair.token1}
                  onChange={(e) =>
                    setSelectedPair({ ...selectedPair, token1: e.target.value })
                  }
                  className="bg-gray-700 text-white rounded-md p-2 w-full"
                >
                  {tokens.map((token) => (
                    <option key={token} value={token}>
                      {token}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex items-center space-x-2 flex-1">
                <select
                  value={selectedPair.token2}
                  onChange={(e) =>
                    setSelectedPair({ ...selectedPair, token2: e.target.value })
                  }
                  className="bg-gray-700 text-white rounded-md p-2 w-full"
                >
                  {tokens.map((token) => (
                    <option key={token} value={token}>
                      {token}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Fee Tier Selection */}
          <div className="mb-4">
            <label className="block text-sm mb-1">Fee tier</label>
            <div className="flex justify-between space-x-2 fee-tier-card">
              {[0.2].map((tier) => (
                <button
                  key={tier}
                  className={`flex-1 p-3 text-center rounded-md ${
                    feeTier === tier ? "bg-purple-600" : "bg-gray-700"
                  }`}
                  onClick={() => setFeeTier(tier)}
                >
                  {tier}%{" "}
                  {feeTier !== tier && (
                    <span className="text-xs block">Not created</span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Deposit Amounts */}
          <div className="mb-6">
            <label className="block text-sm mb-1">Deposit amounts</label>
            <div className="flex space-x-2 price-range">
              <input
                type="text"
                value={depositAmount1}
                onChange={(e) =>
                  handleDepositAmountChange(e.target.value, true)
                }
                placeholder={`Amount of ${selectedPair.token1}`}
                className="flex-1 p-2 bg-gray-700 rounded-md focus:outline-none"
              />
              <input
                type="text"
                value={depositAmount2}
                onChange={(e) =>
                  handleDepositAmountChange(e.target.value, false)
                }
                placeholder={`Amount of ${selectedPair.token2}`}
                className="flex-1 p-2 bg-gray-700 rounded-md focus:outline-none"
              />
            </div>
          </div>

          {/* Price Range */}
          <div className="mb-4">
            <label className="block text-sm mb-1">Set price range</label>
            <div className="flex space-x-2 price-range">
              <input
                type="text"
                value={lowPrice}
                readOnly
                placeholder="Low price"
                className="flex-1 p-2 bg-gray-700 rounded-md focus:outline-none"
              />
              <input
                type="text"
                value={highPrice}
                readOnly
                placeholder="High price"
                className="flex-1 p-2 bg-gray-700 rounded-md focus:outline-none"
              />
            </div>
          </div>

          {/* TonConnectButton or Add Liquidity Button */}
          {!isWalletConnected ? (
            <div className="flex justify-center">
              <button className="w-full p-3 rounded-md text-white font-bold transition duration-300 bg-purple-600 hover:bg-purple-700">Connect Wallet</button>
            </div>
          ) : (
            <button
              onClick={handleAddLiquidity}
              className={`w-full p-3 rounded-md text-white font-bold transition duration-300 ${
                isFormValid
                  ? "bg-purple-600 hover:bg-purple-700"
                  : "bg-gray-600 cursor-not-allowed"
              }`}
              disabled={!isFormValid}
            >
              Add Liquidity
            </button>
          )}
        </div>
      </div>
    </>
  );
};

export default AddLiquidity;
