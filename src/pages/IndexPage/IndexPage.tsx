import type { FC } from "react";
import { Page } from "@/components/Page.tsx";
import Navbar from "@/pages/Navbar.tsx";
import ReactTypingEffect from "react-typing-effect";
import StarfieldAnimation from "react-starfield";

export const IndexPage: FC = () => {
  return (
    <Page back={false}>
      <Navbar />

      {/* Starfield animation as the background */}
      <div className="relative h-screen overflow-hidden bg-gray-900">
        <StarfieldAnimation
          numParticles={700} // Increased particles for more vibrant effect
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

        <div className="flex flex-col items-center justify-center h-full relative text-center px-6">
          {/* Hero Section */}
          <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight">
            Welcome to <span className="text-indigo-500">Safion</span>
          </h1>
          <span className="text-xl md:text-2xl font-medium text-gray-300">
            <ReactTypingEffect
              text={[
                "Unlocking the power of concentrated liquidity.",
                "Revolutionizing DeFi liquidity solutions.",
                "Empowering traders and liquidity providers alike.",
              ]}
              speed={100}
              eraseSpeed={50}
              eraseDelay={2000}
              typingDelay={500}
            />
          </span>
          <p className="mt-6 text-lg text-gray-400 max-w-3xl">
            Safion is a cutting-edge <span className="text-indigo-500">DeFi platform</span> built
            to provide unparalleled efficiency in liquidity provision and
            trading. By concentrating liquidity within specific price ranges,
            Safion maximizes returns for liquidity providers and minimizes slippage for traders.
          </p>

          <div className="mt-10 space-y-4 md:space-y-0 md:flex md:space-x-6">
            <a
              href="#learn-more"
              className="bg-indigo-500 text-white px-8 py-3 rounded-md text-lg font-medium hover:bg-indigo-600 transition"
            >
              Learn More
            </a>
            <a
              href="/reactjs-template#/addLiquidity"
              className="bg-gray-800 text-white px-8 py-3 rounded-md text-lg font-medium hover:bg-gray-700 transition"
            >
              Get Started
            </a>
          </div>
        </div>
      </div>

      {/* Product Features Section */}
      <div className="bg-gray-800 py-16">
        <div className="container mx-auto px-6 md:px-12">
          <h2 className="text-4xl font-bold text-center text-white mb-12">
            Why Choose <span className="text-indigo-500">Safion?</span>
          </h2>
          <div className="grid md:grid-cols-3 gap-12">
            <div className="text-center">
              <div className="text-indigo-500 text-6xl mb-4">⚡</div>
              <h3 className="text-2xl font-semibold text-white mb-2">
                Concentrated Liquidity
              </h3>
              <p className="text-gray-400">
                Focus your liquidity within specific price ranges to achieve
                higher capital efficiency and maximize returns.
              </p>
            </div>
            <div className="text-center">
              <div className="text-indigo-500 text-6xl mb-4">🔒</div>
              <h3 className="text-2xl font-semibold text-white mb-2">
                Secure & Transparent
              </h3>
              <p className="text-gray-400">
                Built on the robust TON blockchain, Safion ensures security and
                transparency for all your transactions.
              </p>
            </div>
            <div className="text-center">
              <div className="text-indigo-500 text-6xl mb-4">📈</div>
              <h3 className="text-2xl font-semibold text-white mb-2">
                Minimized Slippage
              </h3>
              <p className="text-gray-400">
                Traders benefit from lower slippage, while liquidity providers
                capture more trading fees.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Learn More Section */}
      <div id="learn-more" className="bg-gray-800 py-16">
        <div className="container mx-auto px-6 md:px-12">
          <h2 className="text-4xl font-bold text-center text-white mb-12">
            Learn More About <span className="text-indigo-500">Safion</span>
          </h2>

          <div className="grid md:grid-cols-2 gap-12">
            {/* Feature 1 */}
            <div>
              <h3 className="text-2xl font-semibold text-white mb-4">
                What is Concentrated Liquidity?
              </h3>
              <p className="text-gray-400 leading-relaxed">
                Concentrated liquidity allows liquidity providers to allocate
                their capital within a specific price range rather than across
                the entire curve. This strategy significantly increases capital
                efficiency, enabling higher returns and better trading
                conditions.
              </p>
            </div>

            {/* Feature 2 */}
            <div>
              <h3 className="text-2xl font-semibold text-white mb-4">
                How Does Safion Work?
              </h3>
              <p className="text-gray-400 leading-relaxed">
                Safion uses an advanced algorithm to concentrate liquidity
                dynamically, providing optimal fee earnings for liquidity
                providers while ensuring minimal slippage for traders. It is
                built on the highly scalable TON blockchain, ensuring
                transparency and security.
              </p>
            </div>

            {/* Feature 3 */}
            <div>
              <h3 className="text-2xl font-semibold text-white mb-4">
                Benefits for Traders
              </h3>
              <p className="text-gray-400 leading-relaxed">
                Traders enjoy significantly reduced slippage and better trade
                execution prices. Safion ensures seamless trading experiences by
                leveraging the concentrated liquidity model.
              </p>
            </div>

            {/* Feature 4 */}
            <div>
              <h3 className="text-2xl font-semibold text-white mb-4">
                Benefits for Liquidity Providers
              </h3>
              <p className="text-gray-400 leading-relaxed">
                Liquidity providers earn higher fees as their capital is
                utilized more effectively within specific price ranges. Safion
                provides detailed analytics and tools to help maximize
                profitability.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Call to Action */}
      <div className="bg-gray-900 py-16">
        <div className="container mx-auto px-6 md:px-12 text-center">
          <h2 className="text-4xl font-bold text-white mb-6">
            Ready to revolutionize DeFi liquidity?
          </h2>
          <p className="text-gray-400 text-lg mb-10">
            Join the Safion ecosystem today and experience the future of
            liquidity management.
          </p>
          <a
            href="/reactjs-template#/addLiquidity"
            className="bg-indigo-500 text-white px-10 py-3 rounded-md text-lg font-medium hover:bg-indigo-600 transition"
          >
            Start Providing Liquidity
          </a>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-800 py-6">
        <div className="container mx-auto px-6 md:px-12 text-center text-gray-400">
          <p>
            &copy; {new Date().getFullYear()} Safion. All rights reserved. Built
            on the TON blockchain.
          </p>
        </div>
      </footer>
    </Page>
  );
};
