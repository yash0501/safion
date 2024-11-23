import React, { useState } from "react";
import { Link } from "react-router-dom";
import safionLogo from "../../assets/logo1.svg";
import { TonConnectButton } from "@tonconnect/ui-react";

const Navbar: React.FC = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <nav className="bg-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <div className="flex items-center">
            <div className="text-white text-2xl font-bold">
              <div className="image-container">
                <img
                  src={safionLogo}
                  alt="Logo"
                  className="h-10 text-center responsive-logo"
                />
              </div>
            </div>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex space-x-4">
            <Link
              to="/swap"
              className="text-white px-3 py-2 rounded-md text-lg font-medium hover:bg-gray-700"
            >
              Swap
            </Link>
            <Link
              to="/pool-table"
              className="text-white px-3 py-2 rounded-md text-lg font-medium hover:bg-gray-700"
            >
              Pool Table
            </Link>
            <Link
              to="/positions"
              className="text-white px-3 py-2 rounded-md text-lg font-medium hover:bg-gray-700"
            >
              Positions
            </Link>
          </div>

          {/* TonConnectButton - Always Mounted */}
          <div className="wallet-button">
            <TonConnectButton />
          </div>

          {/* Mobile Menu Toggle */}
          <div className="flex md:hidden">
            <button
              onClick={toggleMobileMenu}
              className="text-white hover:text-gray-300 focus:outline-none"
              aria-label="Toggle menu"
            >
              <svg
                className="h-6 w-6"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                {isMobileMenuOpen ? (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M6 18L18 6M6 6l12 12"
                  />
                ) : (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M4 6h16M4 12h16m-7 6h7"
                  />
                )}
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            <Link
              to="/swap"
              className="block text-white px-3 py-2 rounded-md text-base font-medium hover:bg-gray-700"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Swap
            </Link>
            <Link
              to="/pool-table"
              className="block text-white px-3 py-2 rounded-md text-base font-medium hover:bg-gray-700"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Pools
            </Link>
            <Link
              to="/positions"
              className="block text-white px-3 py-2 rounded-md text-base font-medium hover:bg-gray-700"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Positions
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
