import { FaWallet } from "react-icons/fa";
import { useState } from "react";
import axios from "axios";
import Navbar from "@/pages/Navbar.tsx";
import StarfieldAnimation from "react-starfield";

const Swap = () => {
    const [sellAmount, setSellAmount] = useState(""); // Empty string initially
    const [buyAmount, setBuyAmount] = useState(""); // Empty string initially
    const [isWalletConnected, setIsWalletConnected] = useState(false);
    const [selectedToken, setSelectedToken] = useState("Select Token"); // Default token value
    const [priceData, setPriceData] = useState<any>(null); // State to store price data
    const [inputField, setInputField] = useState<'sell' | 'buy' | null>(null); // Track which input field was used

    const handleWalletConnect = () => {
        setIsWalletConnected(!isWalletConnected);
    };

    // Handle token change for the first dropdown
    const handleTokenChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setSelectedToken(e.target.value);
    };

    // Handle the API call on Swap button click
    const handleSwap = async () => {
        if (selectedToken === "Bitcoin") {
            try {
                if (inputField === "sell" && sellAmount) {
                    // API call based on sellAmount input
                    const response = await axios.get(
                        `https://safion-simple-backend.onrender.com/liquidity-providers/price/bitcoin/usd?amount=${sellAmount}`
                    );
                    setPriceData(response.data);
                    // Update the buyAmount based on the API response
                    setBuyAmount(response.data.totalPrice); // Now using totalPrice from the API response
                } else if (inputField === "buy" && buyAmount) {
                    // API call based on buyAmount input, convert buyAmount to sellAmount
                    const response = await axios.get(
                        `https://safion-simple-backend.onrender.com/liquidity-providers/price/usd/bitocoin?amount=${buyAmount}`
                    );
                    setPriceData(response.data);
                    // Update the sellAmount based on the API response
                    setSellAmount((parseFloat(buyAmount) / response.data.pricePerUnit).toFixed(8));
                } else {
                    alert("Please enter an amount.");
                }
            } catch (error) {
                console.error("Error fetching price data:", error);
            }
        } else {
            alert("Please select Bitcoin as the token.");
        }
    };

    return (
        <>
            <Navbar />
            <StarfieldAnimation
                numParticles={500}       // Customize the number of stars
                depth={500}              // Adjust star depth for a more immersive effect
                style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', zIndex: -1 }}
            />
            <div className="flex items-center justify-center h-screen bg-gray-900">
                <div className="bg-gray-900 p-4 rounded-lg shadow-lg text-white max-w-md w-full">
                    {/* Sell section */}
                    <div className="flex items-center justify-between bg-gray-800 rounded-lg p-4 mb-4">
                        <div>
                            <label className="block text-sm mb-2">Sell</label>
                            <input
                                type="text"
                                value={sellAmount}
                                placeholder="Enter amount to sell"
                                onChange={(e) => {
                                    setSellAmount(e.target.value);
                                    setInputField("sell"); // Mark the field being used
                                }}
                                className="text-2xl bg-transparent outline-none w-full text-white placeholder-1xl placeholder-gray-500 border-b-2 border-gray-700 focus:border-purple-600 transition duration-200"
                            />

                            <div className="text-gray-500 text-sm mt-1">
                                {/* Show the pricePerUnit fetched from the API */}
                                {priceData ? `Price per Unit: $${priceData.pricePerUnit}` : "Price per Unit: $0.00"}
                            </div>
                        </div>

                        {/* Token dropdown for the Sell section */}
                        <select
                            value={selectedToken}
                            onChange={handleTokenChange}
                            className="bg-gray-700 text-white px-3 py-2 rounded-lg flex items-center space-x-1 outline-none"
                        >
                            <option value="Select Token" disabled>
                                Select Token
                            </option>
                            <option value="Bitcoin">Bitcoin</option>
                            <option value="Ethereum">Ethereum</option>
                            <option value="TON">TON</option>
                        </select>
                    </div>

                    {/* Swap button */}
                    <div className="flex justify-center mb-4">
                        <button
                            onClick={handleSwap}
                            className="bg-purple-700 text-white px-4 py-2 rounded-lg hover:bg-purple-800 transition"
                        >
                            Swap
                        </button>
                    </div>

                    {/* Buy section as a container */}
                    <div className="flex items-center justify-between bg-gray-800 rounded-lg p-4 mb-4">
                        <div>
                            <label className="block text-sm mb-2">Buy</label>
                            <input
                                type="text"
                                value={buyAmount}
                                placeholder="Enter amount to buy"
                                onChange={(e) => {
                                    setBuyAmount(e.target.value);
                                    setInputField("buy"); // Mark the field being used
                                }}
                                className="text-2xl bg-transparent outline-none w-full text-white placeholder-1xl placeholder-gray-500 border-b-2 border-gray-700 focus:border-purple-600 transition duration-200"
                            />

                        </div>

                        {/* Fixed value for Buy section */}
                        <div className="bg-gray-700 text-white px-3 py-2 rounded-lg flex items-center space-x-1">
                            <span>USD</span>
                        </div>
                    </div>

                    {/* Connect wallet button */}
                    <button
                        onClick={handleWalletConnect}
                        className="w-full bg-purple-700 text-white text-lg py-3 rounded-lg hover:bg-purple-800 transition"
                    >
                        {isWalletConnected ? "Wallet Connected" : "Connect Wallet"}
                    </button>

                    {/* Exchange rate */}
                    <div className="mt-4 text-sm text-gray-400">
                        1 {selectedToken} = 0.000378768 ETH ($1.00)
                    </div>

                    {/* Fees */}
                    <div className="flex justify-between items-center mt-4 text-sm text-gray-400">
                        <span>Fees</span>
                        <span className="flex items-center">
              <FaWallet className="mr-1" /> $9.80
            </span>
                    </div>
                </div>
            </div>
        </>
    );
};

export default Swap;
