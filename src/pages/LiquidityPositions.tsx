
import Navbar from "@/pages/Navbar.tsx";
import {Link} from "react-router-dom";
import StarfieldAnimation from "react-starfield";
const LiquidityPositions = () => {
    return (
        <>
            <StarfieldAnimation
                numParticles={500} // Customize the number of stars
                depth={500} // Adjust star depth for a more immersive effect
                style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', zIndex: -1 }}
            />
            <Navbar/>
        <div className="min-h-screen flex flex-col items-center justify-center bg-gray-900 text-white p-6">
            <div className="w-full max-w-2xl">
                {/* Header Section */}
                <div className="flex items-center justify-between mb-8">
                    <h1 className="text-3xl font-bold">Positions</h1>

                    <div className="flex items-center space-x-4">
                        <select className="bg-gray-800 text-white rounded-md p-2 cursor-pointer">
                            <option value="v3">v3</option>
                            {/* Add more options here if needed */}
                        </select>

                        <button className="bg-gray-800 text-white rounded-md p-2 cursor-pointer">
                            More
                        </button>
                        <Link to="/addLiquidity"
                              className="bg-pink-500 text-white px-4 py-2 rounded-md font-medium hover:bg-pink-600 transition duration-200">
                            + New Position
                        </Link>
                    </div>
                </div>

                {/* Active Positions Placeholder */}
                <div className="flex flex-col items-center justify-center bg-gray-900 rounded-lg p-8 border border-gray-700 mb-8">
                    <div className="text-6xl mb-4">📂</div> {/* Placeholder icon */}
                    <p className="text-lg text-center">Your active V3 liquidity positions will appear here.</p>
                </div>

                {/* Footer Links */}
                <div className="flex space-x-4">
                    <a
                        href="#learn-more"
                        className="flex-1 bg-gray-800 text-white p-4 rounded-md hover:bg-gray-700 transition duration-200"
                    >
                        <h2 className="font-medium">Learn about providing liquidity ↗</h2>
                        <p className="text-gray-400">Check out our v3 LP walkthrough and migration guides.</p>
                    </a>
                    <a
                        href="#top-pools"
                        className="flex-1 bg-gray-800 text-white p-4 rounded-md hover:bg-gray-700 transition duration-200"
                    >
                        <h2 className="font-medium">Top pools ↗</h2>
                        <p className="text-gray-400">Explore Uniswap Analytics.</p>
                    </a>
                </div>
            </div>
        </div>
            </>
    );
};

export default LiquidityPositions;
