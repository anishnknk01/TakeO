/**
 * Customer Rewards Page - Mobile-First Design
 */
'use client';

import { useState } from 'react';
import Image from 'next/image';

export default function CustomerRewardsPage() {
  const [activeTab, setActiveTab] = useState('available');
  const [redeemedRewards, setRedeemedRewards] = useState<string[]>(['chai-discount']);

  const userPoints = 2430;

  const rewards = [
    {
      id: 'free-appetizer',
      title: 'Free Appetizer',
      description: 'Get any starter worth ₹300 for free',
      points: 500,
      category: 'Food',
      discount: '100% OFF',
      image: '/appetizer-platter.jpg',
      gradient: 'from-orange-400 to-red-500',
      available: true
    },
    {
      id: 'chai-discount',
      title: '50% off Beverages',
      description: 'Half price on all teas, coffees & drinks',
      points: 250,
      category: 'Drinks',
      discount: '50% OFF',
      image: '/beverages.jpg',
      gradient: 'from-blue-400 to-purple-500',
      available: true
    },
    {
      id: 'dessert-free',
      title: 'Complimentary Dessert',
      description: 'Free dessert with any main course order',
      points: 400,
      category: 'Food',
      discount: '100% OFF',
      icon: '🍰',
      gradient: 'from-pink-400 to-red-500',
      available: true
    },
    {
      id: 'meal-discount',
      title: '25% off Entire Meal',
      description: 'Quarter off your total bill (max ₹500)',
      points: 800,
      category: 'Meal',
      discount: '25% OFF',
      icon: '🍽️',
      gradient: 'from-green-400 to-teal-500',
      available: true
    },
    {
      id: 'vip-seating',
      title: 'VIP Priority Seating',
      description: 'Skip the queue and get premium table',
      points: 600,
      category: 'Service',
      discount: 'VIP ACCESS',
      icon: '👑',
      gradient: 'from-yellow-400 to-orange-500',
      available: true
    },
    {
      id: 'birthday-special',
      title: 'Birthday Special Package',
      description: 'Free cake + decorations + priority service',
      points: 1000,
      category: 'Special',
      discount: '100% OFF',
      icon: '🎂',
      gradient: 'from-purple-400 to-pink-500',
      available: false // Not enough points
    }
  ];

  const tabs = [
    { id: 'available', name: 'Available', icon: '🎁' },
    { id: 'redeemed', name: 'Redeemed', icon: '✅' }
  ];

  const redeemReward = (rewardId: string, pointsCost: number) => {
    if (userPoints >= pointsCost && !redeemedRewards.includes(rewardId)) {
      setRedeemedRewards([...redeemedRewards, rewardId]);
    }
  };

  const isRewardRedeemed = (rewardId: string) => redeemedRewards.includes(rewardId);
  const canAffordReward = (pointsCost: number) => userPoints >= pointsCost;

  const availableRewards = rewards.filter(reward => !isRewardRedeemed(reward.id));
  const myRedeemedRewards = rewards.filter(reward => isRewardRedeemed(reward.id));

  const displayRewards = activeTab === 'available' ? availableRewards : myRedeemedRewards;

  return (
    <div className="space-y-6 p-4">
      {/* Header */}
      <div className="text-center py-4">
        <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-500 rounded-3xl mx-auto mb-4 flex items-center justify-center shadow-lg">
          <span className="text-2xl">🎁</span>
        </div>
        <h1 className="text-2xl font-bold text-gray-800 mb-1">My Rewards</h1>
        <p className="text-gray-500">Redeem points for amazing rewards!</p>
      </div>

      {/* Points Display */}
      <div className="bg-gradient-to-r from-green-500 to-emerald-500 rounded-3xl p-6 text-white shadow-xl">
        <div className="text-center">
          <p className="text-green-100 mb-1">Your Balance</p>
          <p className="text-3xl font-bold mb-2">{userPoints.toLocaleString()} ⭐</p>
          <p className="text-green-100 text-sm">Keep playing to earn more points!</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex bg-gray-100 rounded-2xl p-1">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-medium transition-all duration-300 ${
              activeTab === tab.id
                ? 'bg-white text-gray-800 shadow-sm'
                : 'text-gray-500'
            }`}
          >
            <span>{tab.icon}</span>
            <span>{tab.name}</span>
            {tab.id === 'available' && (
              <span className="bg-green-500 text-white text-xs px-2 py-0.5 rounded-full">
                {availableRewards.length}
              </span>
            )}
            {tab.id === 'redeemed' && myRedeemedRewards.length > 0 && (
              <span className="bg-gray-400 text-white text-xs px-2 py-0.5 rounded-full">
                {myRedeemedRewards.length}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Rewards List */}
      <div className="space-y-4">
        {displayRewards.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 rounded-3xl mx-auto mb-4 flex items-center justify-center">
              <span className="text-2xl text-gray-400">
                {activeTab === 'available' ? '🎁' : '✅'}
              </span>
            </div>
            <h3 className="font-semibold text-gray-600 mb-2">
              {activeTab === 'available' ? 'No rewards available' : 'No redeemed rewards'}
            </h3>
            <p className="text-sm text-gray-400">
              {activeTab === 'available' 
                ? 'Keep playing games to unlock more rewards!' 
                : 'Start redeeming rewards to see them here'}
            </p>
          </div>
        ) : (
          displayRewards.map((reward) => {
            const isRedeemed = isRewardRedeemed(reward.id);
            const canAfford = canAffordReward(reward.points);
            
            return (
              <div
                key={reward.id}
                className={`bg-white rounded-3xl shadow-sm border transition-all duration-300 overflow-hidden ${
                  isRedeemed 
                    ? 'border-green-200 bg-green-50' 
                    : canAfford 
                      ? 'border-gray-100 hover:shadow-md hover:scale-[1.02]' 
                      : 'border-gray-100 opacity-60'
                }`}
              >
                {/* Reward Image */}
                {reward.image && (
                  <div className="relative h-32">
                    <Image
                      src={reward.image}
                      alt={reward.title}
                      fill
                      className="object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent"></div>
                    <div className="absolute top-3 right-3">
                      <div className="bg-white/20 backdrop-blur-sm px-2 py-1 rounded-full">
                        <span className="text-white font-semibold text-xs">{reward.discount}</span>
                      </div>
                    </div>
                  </div>
                )}

                <div className="p-4">
                  {/* Header */}
                  <div className="flex items-start gap-4 mb-3">
                    {!reward.image && (
                      <div className={`w-12 h-12 bg-gradient-to-br ${reward.gradient} rounded-2xl flex items-center justify-center shadow-md`}>
                        <span className="text-xl text-white">{reward.icon}</span>
                      </div>
                    )}
                    
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-bold text-gray-800">{reward.title}</h3>
                        <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
                          {reward.category}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">{reward.description}</p>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1 text-green-600">
                          <span className="text-sm">⭐</span>
                          <span className="font-semibold">{reward.points} points</span>
                        </div>
                        {!reward.image && (
                          <span className="text-xs bg-orange-100 text-orange-600 px-2 py-1 rounded-full font-medium">
                            {reward.discount}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Action Button */}
                  {activeTab === 'available' ? (
                    isRedeemed ? (
                      <div className="bg-green-500 text-white py-3 px-4 rounded-2xl text-center font-semibold">
                        <div className="flex items-center justify-center gap-2">
                          <span>✓</span>
                          <span>Redeemed! Show to Staff</span>
                        </div>
                      </div>
                    ) : canAfford ? (
                      <button
                        onClick={() => redeemReward(reward.id, reward.points)}
                        className="w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white py-3 px-4 rounded-2xl font-semibold transition-all duration-300 hover:shadow-lg hover:scale-[1.02]"
                      >
                        <div className="flex items-center justify-center gap-2">
                          <span>🎁</span>
                          <span>Redeem Now</span>
                        </div>
                      </button>
                    ) : (
                      <div className="bg-gray-100 text-gray-500 py-3 px-4 rounded-2xl text-center font-medium">
                        <div className="flex items-center justify-center gap-2">
                          <span>⏳</span>
                          <span>Need {(reward.points - userPoints).toLocaleString()} more points</span>
                        </div>
                      </div>
                    )
                  ) : (
                    <div className="bg-green-100 text-green-700 py-3 px-4 rounded-2xl text-center font-semibold">
                      <div className="flex items-center justify-center gap-2">
                        <span>✓</span>
                        <span>Successfully Redeemed</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Bottom Spacing for Navigation */}
      <div className="h-4"></div>
    </div>
  );
}