import type { FC } from 'react';
import { Page } from '@/components/Page.tsx';
import Navbar from '@/pages/Navbar.tsx';
import ReactTypingEffect from 'react-typing-effect';
import StarfieldAnimation from 'react-starfield';

export const IndexPage: FC = () => {
    return (
        <Page back={false}>
            <Navbar />

            {/* Starfield animation as the background */}
            <div className="relative h-screen overflow-hidden bg-gray-900">
                <StarfieldAnimation
                    numParticles={500}       // Customize the number of stars
                    depth={500}              // Adjust star depth for a more immersive effect
                    style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', zIndex: -1 }}
                />

                <div className="flex items-center justify-center h-full relative">
                    <div className="text-center">
                        <h1 className="text-4xl md:text-6xl font-bold text-white mb-4">
                            Welcome to <span className="text-indigo-500">Safion</span>
                        </h1>

                        {/* Typing effect using react-typing-effect */}
                        <span className="text-xl md:text-2xl font-medium text-gray-300">
                          <ReactTypingEffect
                              text={[
                                  "Innovating the future...",
                                  "Empowering creativity...",
                                  "Building solutions for tomorrow...",
                              ]}
                              speed={100}
                              eraseSpeed={50}
                              eraseDelay={2000}
                              typingDelay={500}
                          />
                      </span>

                        <p className="mt-6 text-gray-400">Join us on our journey to excellence.</p>
                        <a
                            href="#learn-more"
                            className="mt-8 inline-block bg-indigo-500 text-white px-6 py-3 rounded-md font-medium hover:bg-indigo-600 transition"
                        >
                            Learn More
                        </a>
                    </div>
                </div>
            </div>
        </Page>
    );
};
