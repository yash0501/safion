import Navbar from "@/pages/Navbar.tsx";
import StarfieldAnimation from "react-starfield";
import { useNavigate } from "react-router-dom";

const PoolTable = () => {
  const poolData = [
    {
      id: 1,
      pool: "TON/USDT",
      fee: "0.02%",
      tvl: "$10,000",
      apr: "1.14%",
      vol1D: "$1,635",
      vol7D: "$8,723",
      poolIcon: "https://cryptologos.cc/logos/toncoin-ton-logo.png?v=035", // Replace with actual path or URL
    },
  ];

  const navigate = useNavigate(); // React Router hook for navigation

  // Helper function to parse formatted numbers
  const parseValue = (value) => {
    return parseFloat(value.replace(/[$,]/g, ""));
  };

  const handleRowClick = () => {
    navigate("/addLiquidity");
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
      <div className="min-h-screen flex flex-col items-center bg-gray-900 text-white p-6">
        <h1 className="text-3xl font-bold mb-6 text-center">Top Pools</h1>
        <div className="overflow-x-auto w-full max-w-5xl bg-gray-800 rounded-lg shadow-md">
          <table className="min-w-full divide-y divide-gray-700">
            <thead className="bg-gray-700">
              <tr>
                <th className="py-3 px-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-400">
                  #
                </th>
                <th className="py-3 px-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-400">
                  Pool
                </th>
                <th className="py-3 px-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-400">
                  TVL
                </th>
                <th className="py-3 px-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-400">
                  APR
                </th>
                <th className="py-3 px-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-400">
                  1D Vol
                </th>
                <th className="py-3 px-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-400">
                  7D Vol
                </th>
                <th className="py-3 px-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-400">
                  1D Vol/TVL
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700">
              {poolData.map((pool) => {
                const vol1D = parseValue(pool.vol1D);
                const tvl = parseValue(pool.tvl);
                const volTvlRatio = tvl ? (vol1D / tvl).toFixed(4) : "N/A"; // Handle division by zero

                return (
                  <tr
                    key={pool.id}
                    className="hover:bg-gray-700 transition duration-200 cursor-pointer"
                    onClick={handleRowClick} // Navigate to the specified route
                  >
                    <td className="py-3 px-4 text-sm">{pool.id}</td>
                    <td className="py-3 px-4 flex items-center space-x-4">
                      <img
                        src={pool.poolIcon}
                        alt={pool.pool}
                        className="h-8 w-8 rounded-full"
                      />
                      <div>
                        <div className="font-medium">{pool.pool}</div>
                        <span className="text-gray-400 text-xs">
                          {pool.fee}
                        </span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-sm">{pool.tvl}</td>
                    <td className="py-3 px-4 text-sm">{pool.apr}</td>
                    <td className="py-3 px-4 text-sm">{pool.vol1D}</td>
                    <td className="py-3 px-4 text-sm">{pool.vol7D}</td>
                    <td className="py-3 px-4 text-sm">{volTvlRatio}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
};

export default PoolTable;
