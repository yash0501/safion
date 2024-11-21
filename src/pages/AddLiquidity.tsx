import { useState } from "react";
import Navbar from "@/pages/Navbar.tsx";
import StarfieldAnimation from "react-starfield";

const AddLiquidity = () => {
    const [selectedPair, setSelectedPair] = useState({ token1: 'ETH', token2: 'USDC' });
    const [feeTier, setFeeTier] = useState(null);
    const [lowPrice, setLowPrice] = useState('');
    const [highPrice, setHighPrice] = useState('');
    const [depositAmount1, setDepositAmount1] = useState('');
    const [depositAmount2, setDepositAmount2] = useState('');
    const [userAddress, setUserAddress] = useState('0xABC123...'); // Placeholder for user wallet address

    const tokens = ['ETH', 'USDC', 'TON', '1INCH', 'ZRX'];

    // Function to handle the API call
    const handleAddLiquidity = async () => {
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
            const response = await fetch('https://safion-simple-backend.onrender.com/liquidity-providers/create', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data),
            });

            if (response.ok) {
                const result = await response.json();
                console.log("Liquidity added successfully:", result);
                // Optionally, you can display a success message or reset the form fields here
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
                numParticles={500} // Customize the number of stars
                depth={500} // Adjust star depth for a more immersive effect
                style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', zIndex: -1 }}
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
                                    onChange={(e) => setSelectedPair({ ...selectedPair, token1: e.target.value })}
                                    className="bg-gray-700 text-white rounded-md p-2 w-full"
                                >
                                    {tokens.map(token => (
                                        <option key={token} value={token}>{token}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="flex items-center space-x-2 flex-1">
                                <select
                                    value={selectedPair.token2}
                                    onChange={(e) => setSelectedPair({ ...selectedPair, token2: e.target.value })}
                                    className="bg-gray-700 text-white rounded-md p-2 w-full"
                                >
                                    {tokens.map(token => (
                                        <option key={token} value={token}>{token}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Fee Tier Selection */}
                    <div className="mb-4">
                        <label className="block text-sm mb-1">Fee tier</label>
                        <div className="flex justify-between space-x-2">
                            {[0.01, 0.05, 0.30, 1.00].map((tier) => (
                                <button
                                    key={tier}
                                    className={`flex-1 p-3 text-center rounded-md ${feeTier === tier ? 'bg-purple-600' : 'bg-gray-700'}`}
                                    onClick={() => setFeeTier(tier)}
                                >
                                    {tier}% {feeTier !== tier && <span className="text-xs block">Not created</span>}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Price Range */}
                    <div className="mb-4">
                        <label className="block text-sm mb-1">Set price range</label>
                        <div className="flex space-x-2">
                            <input
                                type="text"
                                value={lowPrice}
                                onChange={(e) => setLowPrice(e.target.value)}
                                placeholder="Low price"
                                className="flex-1 p-2 bg-gray-700 rounded-md focus:outline-none"
                            />
                            <input
                                type="text"
                                value={highPrice}
                                onChange={(e) => setHighPrice(e.target.value)}
                                placeholder="High price"
                                className="flex-1 p-2 bg-gray-700 rounded-md focus:outline-none"
                            />
                        </div>
                    </div>

                    {/* Deposit Amounts */}
                    <div className="mb-6">
                        <label className="block text-sm mb-1">Deposit amounts</label>
                        <div className="flex space-x-2">
                            <input
                                type="text"
                                value={depositAmount1}
                                onChange={(e) => setDepositAmount1(e.target.value)}
                                placeholder={`Amount of ${selectedPair.token1}`}
                                className="flex-1 p-2 bg-gray-700 rounded-md focus:outline-none"
                            />
                            <input
                                type="text"
                                value={depositAmount2}
                                onChange={(e) => setDepositAmount2(e.target.value)}
                                placeholder={`Amount of ${selectedPair.token2}`}
                                className="flex-1 p-2 bg-gray-700 rounded-md focus:outline-none"
                            />
                        </div>
                    </div>

                    {/* Connect Wallet Button */}
                    <button
                        onClick={handleAddLiquidity}
                        className="w-full p-3 bg-purple-600 rounded-md text-white font-bold hover:bg-purple-700 transition duration-300"
                    >
                        Add Liquidity
                    </button>
                </div>
            </div>
        </>
    );
};

export default AddLiquidity;
