/**
 * PlayBite Landing Page - Modern Design
 */
import Link from 'next/link';
import Image from 'next/image';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Navigation Header */}
      <nav className="bg-white border-b border-gray-100 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">P</span>
              </div>
              <span className="text-2xl font-bold text-gray-900">PlayBite</span>
            </div>

            {/* Navigation Links */}
            <div className="hidden md:flex items-center gap-8">
              <a href="#features" className="text-gray-600 hover:text-gray-900 font-medium">Features</a>
              <a href="#how-it-works" className="text-gray-600 hover:text-gray-900 font-medium">How It Works</a>
              <a href="#restaurants" className="text-gray-600 hover:text-gray-900 font-medium">For Restaurants</a>
              <a href="#pricing" className="text-gray-600 hover:text-gray-900 font-medium">Pricing</a>
              <a href="#about" className="text-gray-600 hover:text-gray-900 font-medium">About Us</a>
            </div>

            {/* Auth Buttons */}
            <div className="flex items-center gap-4">
              <Link 
                href="/auth/customer/login"
                className="text-gray-600 hover:text-gray-900 font-medium"
              >
                Log In
              </Link>
              <Link 
                href="/auth/customer/login"
                className="bg-green-500 hover:bg-green-600 text-white px-6 py-2 rounded-lg font-semibold transition-colors"
              >
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="bg-white py-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Left Content */}
            <div>
              <div className="mb-8">
                <span className="inline-block bg-green-100 text-green-700 px-4 py-2 rounded-full text-sm font-semibold mb-6">
                  Play. Earn. Win.
                </span>
                <h1 className="text-5xl md:text-6xl font-bold text-gray-900 leading-tight mb-6">
                  Play games.<br/>
                  <span className="text-green-500">Earn rewards.</span><br/>
                  Love restaurants.
                </h1>
                <p className="text-xl text-gray-600 leading-relaxed mb-8">
                  Join PlayBite at your favorite restaurants, 
                  play fun games, earn points and win exciting rewards!
                </p>
              </div>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 mb-12">
                <Link 
                  href="/auth/customer/login"
                  className="bg-green-500 hover:bg-green-600 text-white px-8 py-4 rounded-xl font-bold text-lg transition-colors shadow-lg hover:shadow-xl transform hover:scale-105"
                >
                  I'm a Customer →
                </Link>
                <Link 
                  href="/auth/restaurant/login"
                  className="border-2 border-gray-300 hover:border-gray-400 text-gray-700 hover:text-gray-900 px-8 py-4 rounded-xl font-bold text-lg transition-colors"
                >
                  I'm a Restaurant 🏪
                </Link>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
                <div className="text-center">
                  <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                    <span className="text-2xl">🏪</span>
                  </div>
                  <div className="text-2xl font-bold text-gray-900">500+</div>
                  <div className="text-sm text-gray-600">Restaurants</div>
                </div>
                <div className="text-center">
                  <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                    <span className="text-2xl">😊</span>
                  </div>
                  <div className="text-2xl font-bold text-gray-900">100K+</div>
                  <div className="text-sm text-gray-600">Happy Players</div>
                </div>
                <div className="text-center">
                  <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                    <span className="text-2xl">🎮</span>
                  </div>
                  <div className="text-2xl font-bold text-gray-900">1M+</div>
                  <div className="text-sm text-gray-600">Games Played</div>
                </div>
                <div className="text-center">
                  <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                    <span className="text-2xl">🏆</span>
                  </div>
                  <div className="text-2xl font-bold text-gray-900">250K+</div>
                  <div className="text-sm text-gray-600">Rewards Won</div>
                </div>
              </div>
            </div>

            {/* Right Content - Mobile Mockup */}
            <div className="relative">
              <div className="bg-gray-900 rounded-[3rem] p-2 shadow-2xl mx-auto w-80 h-[640px]">
                <div className="bg-black rounded-[2.5rem] h-full p-4 relative overflow-hidden">
                  {/* Status Bar */}
                  <div className="flex justify-between items-center text-white text-sm mb-6">
                    <span>9:41</span>
                    <div className="flex items-center gap-1">
                      <div className="w-4 h-2 bg-white rounded-sm opacity-60"></div>
                      <div className="w-6 h-3 border border-white rounded-sm opacity-60"></div>
                    </div>
                  </div>

                  {/* App Content */}
                  <div className="text-center mb-6">
                    <h3 className="text-white text-lg font-semibold mb-2">Hey Aaryan! 👋</h3>
                    <div className="text-yellow-400 text-3xl font-bold mb-2">2,430 💰</div>
                    <p className="text-gray-400 text-sm">Your rewards: 8:03 pm</p>
                  </div>

                  <button className="w-full bg-green-500 text-white py-4 rounded-xl font-bold text-lg mb-8">
                    Play Now
                  </button>

                  {/* Spin Wheel */}
                  <div className="relative mb-6">
                    <h4 className="text-white text-lg font-semibold mb-4 text-left">Today's Spin</h4>
                    <div className="relative w-48 h-48 mx-auto">
                      {/* Wheel Background */}
                      <div className="w-full h-full rounded-full border-4 border-gray-700 bg-gradient-to-br from-gray-800 to-gray-900 relative overflow-hidden">
                        {/* Segments */}
                        <div className="absolute inset-4 rounded-full overflow-hidden">
                          <div className="w-full h-full relative">
                            <div className="absolute inset-0 bg-green-500" style={{clipPath: 'polygon(50% 50%, 50% 0%, 85% 15%)'}}></div>
                            <div className="absolute inset-0 bg-red-500" style={{clipPath: 'polygon(50% 50%, 85% 15%, 100% 50%)'}}></div>
                            <div className="absolute inset-0 bg-yellow-500" style={{clipPath: 'polygon(50% 50%, 100% 50%, 85% 85%)'}}></div>
                            <div className="absolute inset-0 bg-blue-500" style={{clipPath: 'polygon(50% 50%, 85% 85%, 50% 100%)'}}></div>
                            <div className="absolute inset-0 bg-purple-500" style={{clipPath: 'polygon(50% 50%, 50% 100%, 15% 85%)'}}></div>
                            <div className="absolute inset-0 bg-pink-500" style={{clipPath: 'polygon(50% 50%, 15% 85%, 0% 50%)'}}></div>
                            <div className="absolute inset-0 bg-orange-500" style={{clipPath: 'polygon(50% 50%, 0% 50%, 15% 15%)'}}></div>
                            <div className="absolute inset-0 bg-teal-500" style={{clipPath: 'polygon(50% 50%, 15% 15%, 50% 0%)'}}></div>
                          </div>
                        </div>
                        {/* Center Circle */}
                        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-12 h-12 bg-white rounded-full flex items-center justify-center">
                          <span className="text-black font-bold text-xs">SPIN</span>
                        </div>
                        {/* Pointer */}
                        <div className="absolute top-2 left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-3 border-r-3 border-b-6 border-l-transparent border-r-transparent border-b-white"></div>
                      </div>
                    </div>
                  </div>

                  {/* Bottom Navigation */}
                  <div className="absolute bottom-4 left-4 right-4">
                    <div className="flex justify-around">
                      <button className="text-gray-400">🏠</button>
                      <button className="text-gray-400">🎮</button>
                      <button className="text-green-400">🎡</button>
                      <button className="text-gray-400">🏆</button>
                      <button className="text-gray-400">📊</button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="bg-gray-900 text-white py-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-6">How PlayBite Works</h2>
          </div>

          <div className="grid md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="w-20 h-20 bg-gray-800 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <span className="text-3xl">📱</span>
              </div>
              <h3 className="text-xl font-bold mb-4">1. Check In</h3>
              <p className="text-gray-400">Scan QR at restaurant</p>
            </div>
            <div className="text-center">
              <div className="w-20 h-20 bg-gray-800 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <span className="text-3xl">🎮</span>
              </div>
              <h3 className="text-xl font-bold mb-4">2. Play Games</h3>
              <p className="text-gray-400">Play fun games and earn points</p>
            </div>
            <div className="text-center">
              <div className="w-20 h-20 bg-gray-800 rounded-2xl flex items-center mx-auto mb-6">
                <span className="text-3xl">🎡</span>
              </div>
              <h3 className="text-xl font-bold mb-4">3. Spin & Win</h3>
              <p className="text-gray-400">Spin the wheel and win rewards</p>
            </div>
            <div className="text-center">
              <div className="w-20 h-20 bg-gray-800 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <span className="text-3xl">🏆</span>
              </div>
              <h3 className="text-xl font-bold mb-4">4. Climb Leaderboard</h3>
              <p className="text-gray-400">Compete and be the top player</p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="restaurants" className="bg-white py-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-4xl font-bold text-gray-900 mb-6">
                Loved by Restaurants.<br/>
                Trusted by Players.
              </h2>
              <p className="text-xl text-gray-600 mb-8">
                A gamified engagement platform that keeps customers coming back.
              </p>

              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center flex-shrink-0">
                    <span className="text-2xl">📈</span>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Increase Repeat Visits</h3>
                    <p className="text-gray-600">Engage customers with fun</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center flex-shrink-0">
                    <span className="text-2xl">💚</span>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Boost Loyalty</h3>
                    <p className="text-gray-600">Reward your best customers</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center flex-shrink-0">
                    <span className="text-2xl">📊</span>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Real-time Analytics</h3>
                    <p className="text-gray-600">Track performance & growth</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Restaurant Image Placeholder */}
            <div className="bg-gray-100 rounded-3xl h-96 flex items-center justify-center">
              <div className="text-center">
                <div className="text-6xl mb-4">🏪</div>
                <p className="text-gray-600">Restaurant Dashboard Preview</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 mb-4">
              <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">P</span>
              </div>
              <span className="text-2xl font-bold">PlayBite</span>
            </div>
            <p className="text-gray-400 mb-8">Making dining more fun, one game at a time.</p>
            
            <div className="flex justify-center gap-8 mb-8">
              <Link href="/auth/customer/login" className="text-gray-400 hover:text-white">Customer Login</Link>
              <Link href="/auth/restaurant/login" className="text-gray-400 hover:text-white">Restaurant Login</Link>
            </div>
            
            <p className="text-gray-500 text-sm">© 2024 PlayBite. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}