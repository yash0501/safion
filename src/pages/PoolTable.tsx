
import Navbar from "@/pages/Navbar.tsx";
import StarfieldAnimation from "react-starfield";
const PoolTable = () => {
    const poolData = [
        {
            id: 1,
            pool: "USDC/ETH",
            fee: "0.05%",
            tvl: "$152.2M",
            apr: "1.14%",
            vol1D: "$9.5M",
            vol7D: "$860.4M",
            volTvl: "0.05",
            poolIcon: "https://token-icons.s3.amazonaws.com/eth.png", // Replace with actual path or URL
        },
        {
            id: 2,
            pool: "ETH/USDT",
            fee: "0.3%",
            tvl: "$81.6M",
            apr: "0.62%",
            vol1D: "$462K",
            vol7D: "$136.5M",
            volTvl: "<0.01",
            poolIcon: "https://token-icons.s3.amazonaws.com/eth.png", // Replace with actual path or URL
        },
        {
            id: 3,
            pool: "DAI/USDC",
            fee: "0.01%",
            tvl: "$73.2M",
            apr: "0.011%",
            vol1D: "$218.8K",
            vol7D: "$57.4M",
            volTvl: "0.03",
            poolIcon: "https://coin-images.coingecko.com/coins/images/9956/large/Badge_Dai.png?1696509996", // Replace with actual path or URL
        },
        // Add more pools here...
    ];

    return (
        <>
            <StarfieldAnimation
                numParticles={500}       // Customize the number of stars
                depth={500}              // Adjust star depth for a more immersive effect
                style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', zIndex: -1 }}
            />
        <Navbar/>
        <div className="overflow-x-auto bg-gray-900 p-4 rounded-lg shadow-lg">

            <table className="min-w-full text-left text-sm text-gray-400">
                <thead className="hidden md:table-header-group">
                <tr className="text-gray-500 uppercase">
                    <th className="py-3 px-2">#</th>
                    <th className="py-3 px-2">Pool</th>
                    <th className="py-3 px-2">TVL</th>
                    <th className="py-3 px-2">APR</th>
                    <th className="py-3 px-2">1D vol</th>
                    <th className="py-3 px-2">7D vol</th>
                    <th className="py-3 px-2">1D vol/TVL</th>
                </tr>
                </thead>
                <tbody>
                {poolData.map((pool) => (
                    <tr
                        key={pool.id}
                        className="md:table-row border-b border-gray-700 hover:bg-gray-800 block md:table-row"
                    >
                        {/* Mobile layout */}
                        <td className="block md:table-cell py-3 px-2">
                            <span className="block md:hidden text-gray-500 font-medium">#</span>
                            {pool.id}
                        </td>
                        <td className="block md:table-cell py-3 px-2 flex items-center space-x-2">
                            <span className="block md:hidden text-gray-500 font-medium">Pool</span>
                            <img
                                src={pool.poolIcon}
                                alt={pool.pool}
                                className="h-6 w-6 rounded-full"
                            />
                            <div>
                                <div>{pool.pool}</div>
                                <span className="text-gray-500 text-xs">{pool.fee}</span>
                            </div>
                        </td>
                        <td className="block md:table-cell py-3 px-2">
                            <span className="block md:hidden text-gray-500 font-medium">TVL</span>
                            {pool.tvl}
                        </td>
                        <td className="block md:table-cell py-3 px-2">
                            <span className="block md:hidden text-gray-500 font-medium">APR</span>
                            {pool.apr}
                        </td>
                        <td className="block md:table-cell py-3 px-2">
                            <span className="block md:hidden text-gray-500 font-medium">1D vol</span>
                            {pool.vol1D}
                        </td>
                        <td className="block md:table-cell py-3 px-2">
                            <span className="block md:hidden text-gray-500 font-medium">7D vol</span>
                            {pool.vol7D}
                        </td>
                        <td className="block md:table-cell py-3 px-2">
                            <span className="block md:hidden text-gray-500 font-medium">1D vol/TVL</span>
                            {pool.volTvl}
                        </td>
                    </tr>
                ))}
                </tbody>
            </table>
        </div>
            </>
    );
};

export default PoolTable;
