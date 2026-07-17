/**
 * Restaurant Rewards Management - Full CRUD Operations
 */
'use client';

import { useState } from 'react';
import Image from 'next/image';
import PremiumButton from '@/components/ui/PremiumButton';

export default function RestaurantRewardsManagementPage() {
  const [activeTab, setActiveTab] = useState('my-rewards');
  const [showCreateModal, setShowCreateModal] = useState(false);

  const myRewards = [
    {
      id: 1,
      name: 'Free Appetizer',
      description: 'Get any starter worth ₹300 for free',
      type: 'Food Reward',
      pointsCost: 500,
      discount: '100%',
      status: 'Active',
      claimed: 45,
      totalIssued: 78,
      validDays: 30,
      image: '/appetizer-platter.jpg',
      category: 'Food',
      conditions: 'Valid on dine-in orders above ₹500'
    },
    {
      id: 2,
      name: '50% off Beverages',
      description: 'Half price on all teas, coffees & drinks',
      type: 'Percentage Discount',
      pointsCost: 250,
      discount: '50%',
      status: 'Active',
      claimed: 23,
      totalIssued: 34,
      validDays: 15,
      image: '/beverages.jpg',
      category: 'Beverages',
      conditions: 'Maximum discount ₹200, excludes alcohol'
    },
    {
      id: 3,
      name: 'Free Dessert',
      description: 'Complimentary dessert with main course',
      type: 'Food Reward',
      pointsCost: 400,
      discount: '100%',
      status: 'Active',
      claimed: 18,
      totalIssued: 25,
      validDays: 20,
      image: null,
      category: 'Food',
      conditions: 'Valid with any main course order'
    },
    {
      id: 4,
      name: 'VIP Priority Seating',
      description: 'Skip the queue and get premium table',
      type: 'Service Upgrade',
      pointsCost: 600,
      discount: 'VIP',
      status: 'Inactive',
      claimed: 8,
      totalIssued: 12,
      validDays: 7,
      image: null,
      category: 'Service',
      conditions: 'Subject to table availability'
    },
    {
      id: 5,
      name: 'Birthday Special Package',
      description: 'Free cake + decorations + priority service',
      type: 'Special Package',
      pointsCost: 1000,
      discount: '100%',
      status: 'Active',
      claimed: 5,
      totalIssued: 8,
      validDays: 60,
      image: null,
      category: 'Special',
      conditions: 'Valid only on customer birthday, advance booking required'
    }
  ];

  const rewardTemplates = [
    {
      id: 101,
      name: 'Student Discount',
      description: '20% off on total bill for students',
      type: 'Percentage Discount',
      category: 'Discount',
      suggestedPoints: 300,
      icon: '🎓'
    },
    {
      id: 102,
      name: 'Happy Hour Special',
      description: 'Buy one get one free on selected items',
      type: 'BOGO Offer',
      category: 'Promotion',
      suggestedPoints: 450,
      icon: '🍻'
    },
    {
      id: 103,
      name: 'Family Meal Deal',
      description: 'Special pricing for family of 4+',
      type: 'Package Deal',
      category: 'Family',
      suggestedPoints: 800,
      icon: '👨‍👩‍👧‍👦'
    },
    {
      id: 104,
      name: 'Chef\'s Special',
      description: 'Exclusive access to limited menu items',
      type: 'Exclusive Access',
      category: 'Premium',
      suggestedPoints: 750,
      icon: '👨‍🍳'
    }
  ];

  const getStatusColor = (status: string) => {
    return status === 'Active' ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-600';
  };

  const getTypeColor = (type: string) => {
    const colors = {
      'Food Reward': 'bg-orange-100 text-orange-600',
      'Percentage Discount': 'bg-blue-100 text-blue-600',
      'Service Upgrade': 'bg-purple-100 text-purple-600',
      'Special Package': 'bg-pink-100 text-pink-600'
    };
    return colors[type as keyof typeof colors] || 'bg-gray-100 text-gray-600';
  };

  return (
    <div className="flex h-screen" style={{ backgroundColor: '#FFFFFF' }}>
      {/* Sidebar Navigation */}
      <div className="w-64 flex flex-col border-r" style={{ 
        backgroundColor: '#1C1C1E', 
        borderColor: 'rgba(255,255,255,0.08)'
      }}>
        <div className="p-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl flex items-center justify-center shadow-lg" 
                 style={{ background: 'linear-gradient(135deg, #34C759 0%, #30D158 100%)' }}>
              <span className="text-white font-bold text-lg">P</span>
            </div>
            <div>
              <span className="text-xl font-bold block text-white">PlayBite</span>
              <span className="text-xs text-gray-400">Rewards Management</span>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-4">
          <div className="space-y-2">
            <a href="/restaurant-admin" className="flex items-center gap-3 px-4 py-3 rounded-2xl text-gray-400 hover:text-white">
              <span>📊</span> <span>Dashboard</span>
            </a>
            <a href="/restaurant-admin/games" className="flex items-center gap-3 px-4 py-3 rounded-2xl text-gray-400 hover:text-white">
              <span>🎮</span> <span>Games Management</span>
            </a>
            <a href="/restaurant-admin/rewards" className="flex items-center gap-3 px-4 py-3 rounded-2xl bg-green-500/15 text-green-500 border border-green-500/30">
              <span>🎁</span> <span>Rewards & Offers</span>
            </a>
            <a href="/restaurant-admin/customers" className="flex items-center gap-3 px-4 py-3 rounded-2xl text-gray-400 hover:text-white">
              <span>👥</span> <span>Customers</span>
            </a>
          </div>
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="border-b px-8 py-6 bg-white">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-800">Rewards & Offers Management</h1>
              <p className="mt-2 text-gray-600">Create, customize, and manage rewards for your customers</p>
            </div>
            
            <div className="flex items-center gap-4">
              <PremiumButton 
                onClick={() => setShowCreateModal(true)}
                className="flex items-center gap-2"
              >
                <span>➕</span> Create New Reward
              </PremiumButton>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto p-8 bg-gray-50">
          {/* Tabs */}
          <div className="flex gap-2 mb-8">
            {[
              { id: 'my-rewards', name: 'My Rewards', count: myRewards.length },
              { id: 'templates', name: 'Reward Templates', count: rewardTemplates.length },
              { id: 'analytics', name: 'Redemption Analytics', count: null },
              { id: 'settings', name: 'Reward Settings', count: null }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-6 py-3 rounded-2xl font-medium transition-all duration-300 flex items-center gap-2 ${
                  activeTab === tab.id
                    ? 'bg-green-500 text-white shadow-lg'
                    : 'bg-white text-gray-600 hover:bg-gray-100'
                }`}
              >
                <span>{tab.name}</span>
                {tab.count !== null && (
                  <span className={`px-2 py-0.5 rounded-full text-xs ${
                    activeTab === tab.id ? 'bg-white/20 text-white' : 'bg-gray-200 text-gray-600'
                  }`}>
                    {tab.count}
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* My Rewards Tab */}
          {activeTab === 'my-rewards' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-800">Active Rewards ({myRewards.filter(r => r.status === 'Active').length})</h2>
                <div className="flex items-center gap-3">
                  <select className="px-4 py-2 border border-gray-200 rounded-xl bg-white text-gray-600 focus:outline-none focus:ring-2 focus:ring-green-500">
                    <option>All Categories</option>
                    <option>Food</option>
                    <option>Beverages</option>
                    <option>Service</option>
                    <option>Special</option>
                  </select>
                  <select className="px-4 py-2 border border-gray-200 rounded-xl bg-white text-gray-600 focus:outline-none focus:ring-2 focus:ring-green-500">
                    <option>All Status</option>
                    <option>Active</option>
                    <option>Inactive</option>
                  </select>
                </div>
              </div>

              <div className="grid gap-6">
                {myRewards.map((reward) => (
                  <div key={reward.id} className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-all duration-300">
                    <div className="flex gap-6">
                      {/* Reward Image/Icon */}
                      <div className="flex-shrink-0">
                        {reward.image ? (
                          <div className="w-24 h-24 rounded-2xl overflow-hidden">
                            <Image
                              src={reward.image}
                              alt={reward.name}
                              width={96}
                              height={96}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        ) : (
                          <div className="w-24 h-24 bg-gradient-to-br from-green-400 to-green-600 rounded-2xl flex items-center justify-center text-3xl">
                            🎁
                          </div>
                        )}
                      </div>

                      {/* Reward Info */}
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-4">
                          <div>
                            <h3 className="text-xl font-bold text-gray-800 mb-1">{reward.name}</h3>
                            <p className="text-gray-600 mb-3">{reward.description}</p>
                            
                            <div className="flex items-center gap-3 mb-3">
                              <span className={`px-3 py-1 rounded-full text-xs font-medium ${getTypeColor(reward.type)}`}>
                                {reward.type}
                              </span>
                              <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(reward.status)}`}>
                                {reward.status}
                              </span>
                              <span className="px-3 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-600">
                                {reward.discount} OFF
                              </span>
                            </div>

                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mb-4">
                              <div>
                                <p className="text-gray-500">Points Cost</p>
                                <p className="font-semibold text-green-600">{reward.pointsCost} pts</p>
                              </div>
                              <div>
                                <p className="text-gray-500">Claimed</p>
                                <p className="font-semibold text-gray-800">{reward.claimed}/{reward.totalIssued}</p>
                              </div>
                              <div>
                                <p className="text-gray-500">Success Rate</p>
                                <p className="font-semibold text-gray-800">
                                  {Math.round((reward.claimed / reward.totalIssued) * 100)}%
                                </p>
                              </div>
                              <div>
                                <p className="text-gray-500">Valid Days</p>
                                <p className="font-semibold text-gray-800">{reward.validDays} days</p>
                              </div>
                            </div>

                            {reward.conditions && (
                              <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl">
                                <p className="text-sm text-blue-800">
                                  <strong>Conditions:</strong> {reward.conditions}
                                </p>
                              </div>
                            )}
                          </div>

                          <div className="flex items-center gap-2">
                            <PremiumButton size="sm" variant="outline">Edit</PremiumButton>
                            <PremiumButton size="sm" variant="secondary">Duplicate</PremiumButton>
                            <button 
                              className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                              title="Delete reward"
                            >
                              <span>🗑️</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Templates Tab */}
          {activeTab === 'templates' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-800">Reward Templates ({rewardTemplates.length})</h2>
                <div className="flex items-center gap-3">
                  <input 
                    type="search" 
                    placeholder="Search templates..."
                    className="px-4 py-2 border border-gray-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {rewardTemplates.map((template) => (
                  <div key={template.id} className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-all duration-300">
                    <div className="text-center">
                      <div className="w-16 h-16 bg-gradient-to-br from-purple-400 to-pink-500 rounded-3xl flex items-center justify-center text-2xl mx-auto mb-4">
                        {template.icon}
                      </div>
                      
                      <h3 className="text-lg font-bold text-gray-800 mb-2">{template.name}</h3>
                      <p className="text-sm text-gray-600 mb-4">{template.description}</p>
                      
                      <div className="flex items-center justify-center gap-2 mb-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(template.type)}`}>
                          {template.type}
                        </span>
                        <span className="px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-600">
                          {template.category}
                        </span>
                      </div>

                      <div className="text-sm text-gray-600 mb-4">
                        <p>Suggested: <span className="font-semibold text-green-600">{template.suggestedPoints} pts</span></p>
                      </div>

                      <div className="flex gap-2">
                        <PremiumButton size="sm" className="flex-1">
                          Use Template
                        </PremiumButton>
                        <button className="px-3 py-2 border border-gray-200 rounded-xl text-gray-600 hover:bg-gray-50 transition-colors">
                          Preview
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Analytics Tab */}
          {activeTab === 'analytics' && (
            <div className="space-y-6">
              <h2 className="text-xl font-bold text-gray-800">Redemption Analytics & Performance</h2>
              
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Top Performing Rewards */}
                <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
                  <h3 className="font-semibold text-gray-800 mb-4">Top Performing Rewards</h3>
                  <div className="space-y-3">
                    {myRewards
                      .sort((a, b) => (b.claimed / b.totalIssued) - (a.claimed / a.totalIssued))
                      .slice(0, 5)
                      .map((reward, index) => (
                        <div key={reward.id} className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <span className="font-bold text-gray-400">#{index + 1}</span>
                            <span className="font-medium text-gray-700">{reward.name}</span>
                          </div>
                          <span className="text-sm text-green-600 font-semibold">
                            {Math.round((reward.claimed / reward.totalIssued) * 100)}%
                          </span>
                        </div>
                      ))}
                  </div>
                </div>

                {/* Redemption Stats */}
                <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
                  <h3 className="font-semibold text-gray-800 mb-4">Redemption Statistics</h3>
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm text-gray-500">Total Rewards Issued</p>
                      <p className="text-2xl font-bold text-gray-800">
                        {myRewards.reduce((sum, r) => sum + r.totalIssued, 0)}
                      </p>
                      <p className="text-xs text-blue-600">This month</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Total Claimed</p>
                      <p className="text-2xl font-bold text-gray-800">
                        {myRewards.reduce((sum, r) => sum + r.claimed, 0)}
                      </p>
                      <p className="text-xs text-green-600">
                        ↑ {Math.round((myRewards.reduce((sum, r) => sum + r.claimed, 0) / myRewards.reduce((sum, r) => sum + r.totalIssued, 0)) * 100)}% success rate
                      </p>
                    </div>
                  </div>
                </div>

                {/* Customer Engagement */}
                <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
                  <h3 className="font-semibold text-gray-800 mb-4">Customer Impact</h3>
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm text-gray-500">Return Rate</p>
                      <p className="text-2xl font-bold text-gray-800">67%</p>
                      <p className="text-xs text-green-600">↑ 12% vs non-reward customers</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Avg Spend Increase</p>
                      <p className="text-2xl font-bold text-gray-800">₹245</p>
                      <p className="text-xs text-green-600">↑ 18% higher than average</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Reward Performance Chart */}
              <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
                <h3 className="font-semibold text-gray-800 mb-4">Weekly Redemption Trends</h3>
                <div className="h-64 bg-gray-50 rounded-2xl flex items-center justify-center">
                  <div className="text-center text-gray-500">
                    <div className="text-4xl mb-2">📈</div>
                    <p>Interactive chart would go here</p>
                    <p className="text-sm">Showing redemption patterns over time</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Settings Tab */}
          {activeTab === 'settings' && (
            <div className="space-y-6">
              <h2 className="text-xl font-bold text-gray-800">Reward System Settings</h2>
              
              <div className="grid gap-6">
                {/* Global Settings */}
                <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
                  <h3 className="font-semibold text-gray-800 mb-4">Global Reward Settings</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-gray-700">Allow Multiple Rewards Per Visit</p>
                        <p className="text-sm text-gray-500">Customers can redeem multiple rewards in one visit</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" className="sr-only peer" defaultChecked />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 dark:peer-focus:ring-green-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-green-600"></div>
                      </label>
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-gray-700">Auto-Approve Low-Value Rewards</p>
                        <p className="text-sm text-gray-500">Automatically approve rewards under ₹200</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" className="sr-only peer" />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 dark:peer-focus:ring-green-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-green-600"></div>
                      </label>
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Default Reward Validity (Days)
                        </label>
                        <input 
                          type="number" 
                          defaultValue="30"
                          className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Maximum Points Per Reward
                        </label>
                        <input 
                          type="number" 
                          defaultValue="1000"
                          className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Notification Settings */}
                <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
                  <h3 className="font-semibold text-gray-800 mb-4">Notification Settings</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-gray-700">Email Notifications</p>
                        <p className="text-sm text-gray-500">Get notified about reward redemptions</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" className="sr-only peer" defaultChecked />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 dark:peer-focus:ring-green-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-green-600"></div>
                      </label>
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-gray-700">SMS Notifications</p>
                        <p className="text-sm text-gray-500">SMS alerts for high-value redemptions</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" className="sr-only peer" defaultChecked />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 dark:peer-focus:ring-green-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-green-600"></div>
                      </label>
                    </div>
                  </div>
                </div>

                {/* Save Button */}
                <div className="flex justify-end">
                  <PremiumButton>
                    Save Settings
                  </PremiumButton>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}