import Navbar from "@/pages/Navbar.tsx";
import { Link } from "react-router-dom";
import StarfieldAnimation from "react-starfield";
import { useTonAddress, TonConnectButton } from "@tonconnect/ui-react";
import { useState, useEffect } from "react";

const LiquidityPositions = () => {
  const tonAddress = useTonAddress(); // Fetch wallet address
  const [positions, setPositions] = useState([]); // Store fetched positions
  const [loading, setLoading] = useState(false); // Loading state for the API call
  const [error, setError] = useState(null); // Error state

  useEffect(() => {
    if (tonAddress) {
      fetchPositions(tonAddress);
    }
  }, [tonAddress]);

  const fetchPositions = async (address) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(
        `https://safion-simple-backend.onrender.com/liquidity-providers/getByAddress?address=${address}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          }
        }
      );
      if (response.ok) {
        const data = await response.json();
        setPositions(data);
      } else {
        setError("Failed to fetch positions.");
        console.error("Failed to fetch positions", response.statusText);
      }
    } catch (error) {
      setError("Error fetching positions.");
      console.error("Error fetching positions:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <StarfieldAnimation
        numParticles={500} // Customize the number of stars
        depth={500} // Adjust star depth for a more immersive effect
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
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-900 text-white p-6">
        <div className="w-full max-w-2xl">
          {/* Check if TON address is available */}
          {!tonAddress ? (
            <div className="flex flex-col items-center justify-center bg-gray-800 rounded-lg p-8 border border-gray-700 mb-8">
              <p className="text-lg mb-4 text-center">
                Please connect your wallet to view liquidity positions.
              </p>
            </div>
          ) : (
            <>
              {/* Header Section */}
              <div className="flex items-center justify-between mb-8 position-container">
                <h1 className="text-3xl font-bold">Positions</h1>
                <div className="flex items-center space-x-4">
                  <Link
                    to="/addLiquidity"
                    className="bg-pink-500 text-white px-4 py-2 rounded-md font-medium hover:bg-pink-600 transition duration-200"
                  >
                    + New Position
                  </Link>
                </div>
              </div>

              {/* Loading/Error State */}
              {loading ? (
                <p className="text-lg text-center">Loading positions...</p>
              ) : error ? (
                <p className="text-lg text-red-500 text-center">{error}</p>
              ) : positions.length === 0 ? (
                <div className="flex flex-col items-center justify-center bg-gray-900 rounded-lg p-8 border border-gray-700 mb-8">
                  <div className="text-6xl mb-4">📂</div> {/* Placeholder icon */}
                  <p className="text-lg text-center">
                    Your active liquidity positions will appear here.
                  </p>
                </div>
              ) : (
                <div className="space-y-6">
                  {positions.map((position) => (
                    <div
                      key={position.id}
                      className="bg-gray-800 p-6 rounded-md border border-gray-700 shadow-md hover:shadow-lg transition-shadow duration-200"
                    >
                      <div className="flex justify-between items-center mb-4">
                        <h2 className="text-xl font-semibold">
                          {position.tokenX}/{position.tokenY}
                        </h2>
                        <span className="text-sm text-gray-400">
                          Created: {new Date(position.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="grid grid-cols-2 gap-4 text-sm text-gray-400">
                        <div>
                          <span className="block font-medium text-gray-300">Amount {position.tokenX}:</span>
                          {position.amountX}
                        </div>
                        <div>
                          <span className="block font-medium text-gray-300">Amount {position.tokenY}:</span>
                          {position.amountY}
                        </div>
                        <div>
                          <span className="block font-medium text-gray-300">Lower Price:</span>
                          {position.lowerPrice}
                        </div>
                        <div>
                          <span className="block font-medium text-gray-300">Upper Price:</span>
                          {position.upperPrice}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

              )}

              {/* Footer Links */}
              <div className="flex space-x-4 position-card mt-8">
                <a
                  href="#learn-more"
                  className="flex-1 bg-gray-800 text-white p-4 rounded-md hover:bg-gray-700 transition duration-200 w-100"
                >
                  <h2 className="font-medium">
                    Learn about providing liquidity ↗
                  </h2>
                  <p className="text-gray-400">
                    Check out our LP walkthrough and migration guides.
                  </p>
                </a>
                <a
                  href="/reactjs-template#/pool-table"
                  className="flex-1 bg-gray-800 text-white p-4 rounded-md hover:bg-gray-700 transition duration-200 w-100"
                >
                  <h2 className="font-medium">Top pools ↗</h2>
                  <p className="text-gray-400">Explore Safion Analytics.</p>
                </a>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
};

export default LiquidityPositions;
