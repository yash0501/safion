import { useState, useEffect } from "react";
import Navbar from "@/pages/Navbar.tsx";
import StarfieldAnimation from "react-starfield";
import { useTonAddress, TonConnectButton, useTonWallet, useTonConnectUI } from "@tonconnect/ui-react";
// import { TonClient, Address } from "@ton/ton";
import { beginCell, Cell, Address, toNano } from "@ton/core"; // Import Address
import { Buffer } from "buffer";

const AddLiquidity = () => {
  const tonAddress = useTonAddress(); // Fetch wallet address
  const [tonConnectUI] = useTonConnectUI(); // TonConnect UI instance
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
  const [showSuccessModal, setShowSuccessModal] = useState(false); // Success modal state
  const [isLoading, setIsLoading] = useState(false); // Loader state

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

  const tokens = ["TON", "USDT"];

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

  const handleJettonTransferWithPayload = async () => {  
    // Define addresses and amounts
    const jettonWalletAddress = "kQDZS7rzmexsaRg6HxOAomK2kVEh0cfi00AoSSkujxgF3uwB"; // Sender's Jetton Wallet Address
    // const recipientAddress = "EQBmSTu-q_e6RnfR7f4lWzZJbcDOSf_yUqjK5LzXBf9CVqpA"; // Recipient's Wallet Address
    const recipientAddress = "0QBZhckaQ4TTyuowAuD9DTCLBmyIqvrScZ_hZ0KMJAD-mkyh"
    const transferAmount = BigInt(1e9); // Amount in nanoTON (1 Jetton)
  
    // Prepare transaction message
    const transactionMessage = {
      validUntil: Math.floor(Date.now() / 1000) + 600, // Validity: 10 minutes
      messages: [
        {
          address: jettonWalletAddress,
          amount: "0", // No direct TON transfer
          payload: createJettonTransferPayload(recipientAddress, transferAmount)
        },
      ],
    };
  
    try {
      // Send the transaction using TonConnect
      await tonConnectUI.sendTransaction(transactionMessage);
      console.log("Jetton transfer with payload successful!");
    } catch (error) {
      console.error("Error during Jetton transfer with payload:", error);
    }
  };

  const createJettonTransferPayload = (recipientAddressBase64: string, amount: BigInt) => {
    const OPERATION_TRANSFER = BigInt(0xf8a7ea5); // Standard Jetton transfer operation
    const COMMENT = ""; // Optional comment
  
    const recipientAddress = Address.parse(recipientAddressBase64);
  
    // Create additionalData Cell
    const additionalData: Cell = beginCell()
      .storeInt(0, 32) // Some operation code (customize as needed)
      .storeAddress(recipientAddress) // Recipient address
      .storeInt(BigInt(5000000), 64) // Example data
      .storeInt(BigInt(6000000), 64) // Example data
      .endCell();
  
    // Create payload Cell
    const payload: Cell = beginCell()
      .storeInt(OPERATION_TRANSFER, 64) // Operation code as BigInt
      .storeAddress(recipientAddress) // Target address
      .storeInt(BigInt(Math.floor(Date.now() / 1000) + 600), 64) // Deadline: 10 minutes from now
      .storeRef(additionalData) // Reference additionalData Cell
      .endCell();
  
    console.log("Payload as Cell:", payload.toString());
    console.log("AdditionalData as Cell:", additionalData.toString());
  
    const body = new Uint8Array([
      ...numberToBytes(OPERATION_TRANSFER, 32), // Jetton operation (4 bytes)
      ...hexToBytes(recipientAddress.toString()), // Recipient address
      ...numberToBytes(amount, 32), // Transfer amount (8 bytes)
      ...numberToBytes(0, 32), // Forward TON amount (usually 0)
      ...stringToBytes(COMMENT),
    ]);
  
    return Buffer.from(body).toString("base64"); // Convert to base64 format for payload
  };  
  
  // Utility functions for payload creation
  const numberToBytes = (number: number | BigInt, size: number) => {
    const isBigInt = typeof number === "bigint";
    const num = isBigInt ? number : BigInt(number); // Ensure input is BigInt
    return Array(size)
      .fill(0)
      .map((_, i) => Number((num >> BigInt((size - i - 1) * 8)) & BigInt(0xff)));
  };
  
  
  const stringToBytes = (str) => Array.from(new TextEncoder().encode(str));
  
  const hexToBytes = (hex) => {
    const result = [];
    for (let i = 0; i < hex.length; i += 2) {
      result.push(parseInt(hex.substr(i, 2), 16));
    }
    return result;
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
      // Backend call for adding liquidity (optional, if needed for your application)
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

        const transactionData = {
          validUntil: Math.floor(Date.now() / 1000) + 60, // 60 seconds validity
          messages: [
            {
              address: "EQDdE5pHo6QRNi4srfwPyoH8HDNQU26dBvvLas4MQXbqdUB0", // Replace with the recipient's TON wallet address
              amount: `${parseFloat(depositAmount1) * 1e9}`, // Convert TON to nanoton
              bounce: false,
              payload: "",
            },
          ],
        };
    
        try {
          setIsLoading(true); // Show loader
          let txn = await tonConnectUI.sendTransaction(transactionData);
          console.log(txn);
          if (txn) {
            // Simulate a delay before showing the success modal
            setTimeout(() => {
              setIsLoading(false); // Hide loader
              setShowSuccessModal(true); // Show success modal
            }, 10000); // 10 seconds
          }
          console.log("Transaction successfully sent!");
        } catch (error) {
          setIsLoading(false); // Hide loader in case of error
          console.error("Error sending transaction:", error);
        }
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

      {/* Loader */}
      {isLoading && (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-75 flex items-center justify-center z-50">
          <div className="spinner border-t-4 border-purple-500 rounded-full w-12 h-12 animate-spin"></div>
          <p className="text-white mt-4">Processing your transaction...</p>
        </div>
      )}

      {/* Success Modal */}
      {showSuccessModal && (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg text-center">
            <h2 className="text-2xl font-bold mb-4 text-gray-800">
              Liquidity Added Successfully!
            </h2>
            <p className="text-gray-600 mb-6">
              Your liquidity has been successfully added to the pool.
            </p>
            <button
              onClick={() => setShowSuccessModal(false)}
              className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default AddLiquidity;
