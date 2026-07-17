/**
 * PlayBite Rewards Store - Enhanced Management with CRUD Operations
 */
'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import PremiumSidebar from '@/components/navigation/PremiumSidebar';

export default function RewardsPage() {
  const [redeemedRewards, setRedeemedRewards] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState('my-rewards');
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Empty rewards array - users will create their own rewards
  const rewards: any[] = [];
  
  // Empty templates array - can be populated with real templates later  
  const rewardTemplates: any[] = [];

  const renderIcon = (iconName: string, size: number = 24) => {
    const iconProps = {
      width: size,
      height: size,
      stroke: 'currentColor',
      strokeWidth: 2,
      fill: 'none',
      strokeLinecap: 'round' as const,
      strokeLinejoin: 'round' as const
    };

    switch (iconName) {
      case 'utensils':
        return (
          <svg {...iconProps} viewBox="0 0 24 24">
            <path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2"/>
            <path d="M7 2v20"/>
            <path d="M21 15V2a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3Z"/>
          </svg>
        );
      case 'coffee':
        return (
          <svg {...iconProps} viewBox="0 0 24 24">
            <path d="M18 8h1a4 4 0 0 1 0 8h-1"/>
            <path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8Z"/>
            <line x1="6" y1="1" x2="6" y2="4"/>
            <line x1="10" y1="1" x2="10" y2="4"/>
            <line x1="14" y1="1" x2="14" y2="4"/>
          </svg>
        );
      case 'cake':
        return (
          <svg {...iconProps} viewBox="0 0 24 24">
            <path d="M20 21V8a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v13"/>
            <path d="M4 16s.5-1 2-1 2.5 2 4 2 2.5-2 4-2 2.5 2 4 2 2-1 2-1"/>
            <path d="M2 21h20"/>
            <path d="M7 8V5a1 1 0 0 1 1-1"/>
            <path d="M12 8V5a1 1 0 0 1 1-1"/>
            <path d="M17 8V5a1 1 0 0 1 1-1"/>
          </svg>
        );
      case 'graduation-cap':
        return (
          <svg {...iconProps} viewBox="0 0 24 24">
            <path d="M22 10v6M2 10l10-5 10 5-10 5Z"/>
            <path d="M6 12v5c3 3 9 3 12 0v-5"/>
          </svg>
        );
      case 'clock':
        return (
          <svg {...iconProps} viewBox="0 0 24 24">
            <circle cx="12" cy="12" r="10"/>
            <polyline points="12,6 12,12 16,14"/>
          </svg>
        );
      case 'gift':
        return (
          <svg {...iconProps} viewBox="0 0 24 24">
            <rect x="3" y="8" width="18" height="4" rx="1"/>
            <path d="M12 8V21"/>
            <path d="M19 12v7a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2v-7"/>
            <path d="M7.5 8a2.5 2.5 0 0 1 0-5A4.9 4.9 0 0 1 12 8a4.9 4.9 0 0 1 4.5-5 2.5 2.5 0 0 1 0 5"/>
          </svg>
        );
      case 'star':
        return (
          <svg {...iconProps} viewBox="0 0 24 24">
            <polygon fill="currentColor" points="12,2 15.09,8.26 22,9 17,14 18.18,21 12,17.77 5.82,21 7,14 2,9 8.91,8.26"/>
          </svg>
        );
      case 'plus':
        return (
          <svg {...iconProps} viewBox="0 0 24 24">
            <path d="M5 12h14"/>
            <path d="M12 5v14"/>
          </svg>
        );
      default:
        return null;
    }
  };

  const redeemReward = (rewardId: string, pointsCost: number) => {
    // This would integrate with your points system
    setRedeemedRewards([...redeemedRewards, rewardId]);
  };

  const isRewardRedeemed = (rewardId: string) => redeemedRewards.includes(rewardId);
  
  const getStatusColor = (status: string) => {
    return status === 'Active' ? 'text-green-600 bg-green-100' : 'text-gray-600 bg-gray-100';
  };

  return (
    <div className="flex h-screen" style={{ backgroundColor: '#FFFFFF' }}>
      {/* Premium Black Sidebar */}
      <PremiumSidebar currentPage="rewards" />

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Premium Header */}
        <div className="border-b px-8 py-6" style={{ 
          backgroundColor: '#FFFFFF',
          borderColor: 'rgba(0,0,0,0.08)',
          backdropFilter: 'blur(20px)',
          boxShadow: '0 1px 0 rgba(0,0,0,0.05)'
        }}>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight" style={{ 
                color: '#1D1D1F',
                fontFamily: 'SF Pro Display, -apple-system, system-ui, sans-serif',
                fontWeight: '700'
              }}>
                Rewards Management
              </h1>
              <p className="mt-2 text-base" style={{ 
                color: '#6E6E73',
                fontFamily: 'SF Pro Display, -apple-system, system-ui, sans-serif',
                fontWeight: '400'
              }}>
                Create, manage, and analyze your restaurant rewards
              </p>
            </div>
            <div className="flex items-center gap-6">
              <div className="text-right">
                <p className="text-sm" style={{ 
                  color: '#6E6E73',
                  fontFamily: 'SF Pro Display, -apple-system, system-ui, sans-serif',
                  fontWeight: '400'
                }}>
                  Hi Restaurant Owner
                </p>
                <p className="font-medium" style={{ 
                  color: '#1D1D1F',
                  fontFamily: 'SF Pro Display, -apple-system, system-ui, sans-serif',
                  fontWeight: '500'
                }}>
                  Welcome back!
                </p>
              </div>
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-white font-bold shadow-lg transition-all duration-300 hover:scale-105" style={{
                background: 'linear-gradient(135deg, #34C759 0%, #30D158 100%)',
                boxShadow: '0 8px 32px rgba(52,199,89,0.15)',
                fontFamily: 'SF Pro Display, -apple-system, system-ui, sans-serif',
                fontWeight: '600'
              }}>
                R
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 overflow-auto p-8" style={{ backgroundColor: '#F5F5F7' }}>
          {/* Tabs */}
          <div className="flex gap-2 mb-8">
            {[
              { id: 'my-rewards', name: 'My Rewards', count: rewards.length },
              { id: 'templates', name: 'Templates', count: rewardTemplates.length },
              { id: 'analytics', name: 'Analytics', count: null }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-6 py-3 rounded-2xl font-medium transition-all duration-300 flex items-center gap-2 ${
                  activeTab === tab.id
                    ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-lg'
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
                <h2 className="text-xl font-bold" style={{ color: '#1D1D1F' }}>
                  Manage Your Rewards ({rewards.length})
                </h2>
                <button 
                  onClick={() => setShowCreateModal(true)}
                  className="px-6 py-3 rounded-2xl font-semibold text-white transition-all duration-300 hover:scale-[1.02] flex items-center gap-2"
                  style={{
                    background: 'linear-gradient(135deg, #34C759 0%, #30D158 100%)',
                    boxShadow: '0 8px 32px rgba(52,199,89,0.25)'
                  }}
                >
                  {renderIcon('plus', 20)} Create New Reward
                </button>
              </div>

              {rewards.length === 0 ? (
                <div className="rounded-3xl p-8 border text-center" style={{ 
                  backgroundColor: '#FFFFFF',
                  borderColor: 'rgba(0,0,0,0.08)',
                  boxShadow: '0 4px 24px rgba(0,0,0,0.08)'
                }}>
                  <div className="w-24 h-24 rounded-full mx-auto flex items-center justify-center mb-6 shadow-lg" style={{
                    background: 'linear-gradient(135deg, #34C759 0%, #30D158 100%)'
                  }}>
                    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                      <rect x="3" y="8" width="18" height="4" rx="1"/>
                      <path d="M12 8V21"/>
                      <path d="M19 12V20C19 20.5523 18.5523 21 18 21H6C5.44772 21 5 20.5523 5 20V12"/>
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold mb-4" style={{ color: '#1D1D1F' }}>
                    No Rewards Yet
                  </h3>
                  <p className="text-lg mb-6" style={{ color: '#6E6E73' }}>
                    Create your first reward to attract customers
                  </p>
                  <button 
                    onClick={() => setShowCreateModal(true)}
                    className="px-6 py-3 rounded-2xl font-semibold text-white transition-all duration-300 hover:scale-[1.02]"
                    style={{
                      background: 'linear-gradient(135deg, #34C759 0%, #30D158 100%)',
                      boxShadow: '0 8px 32px rgba(52,199,89,0.25)'
                    }}
                  >
                    Create Your First Reward
                  </button>
                </div>
              ) : (
                <div className="grid gap-6">
                  {rewards.map((reward) => (
                    <div key={reward.id} 
                         className="group rounded-3xl p-6 transition-all duration-300 ease-out hover:scale-[1.01] relative overflow-hidden border"
                         style={{ 
                           backgroundColor: '#FFFFFF',
                           borderColor: 'rgba(0,0,0,0.08)',
                           boxShadow: '0 4px 24px rgba(0,0,0,0.08)'
                         }}>
                      <div className="flex gap-6">
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
                            <div className="w-24 h-24 rounded-2xl flex items-center justify-center shadow-lg"
                                 style={{ 
                                   background: 'linear-gradient(135deg, #34C759 0%, #30D158 100%)'
                                 }}>
                              <span className="text-white">
                                {renderIcon(reward.icon, 32)}
                              </span>
                            </div>
                          )}
                        </div>
                        <div className="flex-1">
                          <h3 className="text-xl font-bold mb-2" style={{ color: '#1D1D1F' }}>
                            {reward.name}
                          </h3>
                          <p className="mb-3" style={{ color: '#6E6E73' }}>
                            {reward.description}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Templates Tab */}
          {activeTab === 'templates' && (
            <div className="space-y-6">
              <h2 className="text-xl font-bold" style={{ color: '#1D1D1F' }}>
                Reward Templates ({rewardTemplates.length})
              </h2>
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {rewardTemplates.map((template) => (
                  <div key={template.id} 
                       className="group rounded-3xl p-6 transition-all duration-300 ease-out hover:scale-[1.02] cursor-pointer border"
                       style={{ 
                         backgroundColor: '#FFFFFF',
                         borderColor: 'rgba(0,0,0,0.08)',
                         boxShadow: '0 4px 24px rgba(0,0,0,0.08)'
                       }}>
                    <div className="w-16 h-16 rounded-2xl flex items-center justify-center shadow-lg mb-4"
                         style={{ 
                           background: 'linear-gradient(135deg, #34C759 0%, #30D158 100%)'
                         }}>
                      <span className="text-white">{renderIcon(template.icon, 24)}</span>
                    </div>
                    <h3 className="text-lg font-bold mb-2" style={{ color: '#1D1D1F' }}>
                      {template.name}
                    </h3>
                    <p className="mb-4 text-sm" style={{ color: '#6E6E73' }}>
                      {template.description}
                    </p>
                    <button className="w-full py-3 px-4 rounded-xl font-medium border"
                            style={{ 
                              borderColor: 'rgba(52,199,89,0.3)',
                              color: '#34C759',
                              backgroundColor: 'rgba(52,199,89,0.1)'
                            }}>
                      Use This Template
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Analytics Tab */}
          {activeTab === 'analytics' && (
            <div className="space-y-6">
              <h2 className="text-xl font-bold" style={{ color: '#1D1D1F' }}>
                Rewards Analytics
              </h2>
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                {[
                  { label: 'Total Rewards', value: '3', change: '+2', color: '#34C759' },
                  { label: 'Claims This Month', value: '86', change: '+15%', color: '#007AFF' },
                  { label: 'Active Rewards', value: '3', change: '0', color: '#FF9F0A' },
                  { label: 'Success Rate', value: '68%', change: '+5%', color: '#34C759' }
                ].map((stat, index) => (
                  <div key={index} 
                       className="rounded-2xl p-6 border"
                       style={{ 
                         backgroundColor: '#FFFFFF',
                         borderColor: 'rgba(0,0,0,0.08)',
                         boxShadow: '0 4px 24px rgba(0,0,0,0.08)'
                       }}>
                    <p className="text-sm font-medium mb-2" style={{ color: '#6E6E73' }}>
                      {stat.label}
                    </p>
                    <p className="text-2xl font-bold" style={{ color: stat.color }}>
                      {stat.value}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Create Modal */}
          {showCreateModal && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
              <div className="bg-white rounded-3xl p-8 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold" style={{ color: '#1D1D1F' }}>
                    Create New Reward
                  </h2>
                  <button 
                    onClick={() => setShowCreateModal(false)}
                    className="p-2 rounded-xl hover:bg-gray-100 transition-colors"
                  >
                    <span className="text-xl">✕</span>
                  </button>
                </div>

                <form className="space-y-6" onSubmit={(e) => {
                  e.preventDefault();
                  const formData = new FormData(e.currentTarget);
                  const newReward = {
                    id: Date.now().toString(),
                    name: formData.get('name') as string,
                    description: formData.get('description') as string,
                    points: parseInt(formData.get('points') as string),
                    category: formData.get('category') as string,
                    discount: formData.get('discount') as string + '%',
                    status: 'Active',
                    claimed: 0,
                    totalIssued: 0,
                    validDays: parseInt(formData.get('validDays') as string),
                    conditions: formData.get('conditions') as string,
                    icon: 'gift',
                    gradient: 'from-green-400 to-green-500'
                  };
                  console.log('Creating new reward:', newReward);
                  setShowCreateModal(false);
                  alert('Reward created successfully! (Demo mode - not saved to database)');
                }}>
                  <div className="grid gap-6 md:grid-cols-2">
                    <div>
                      <label className="block text-sm font-medium mb-2" style={{ color: '#1D1D1F' }}>
                        Reward Name
                      </label>
                      <input 
                        name="name"
                        type="text" 
                        placeholder="e.g. Free Appetizer"
                        required
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2" style={{ color: '#1D1D1F' }}>
                        Category
                      </label>
                      <select 
                        name="category"
                        required
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500"
                      >
                        <option value="Food">Food</option>
                        <option value="Drinks">Drinks</option>
                        <option value="Service">Service</option>
                        <option value="Special">Special</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: '#1D1D1F' }}>
                      Description
                    </label>
                    <textarea 
                      name="description"
                      placeholder="Describe your reward..."
                      rows={3}
                      required
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                  </div>

                  <div className="grid gap-6 md:grid-cols-3">
                    <div>
                      <label className="block text-sm font-medium mb-2" style={{ color: '#1D1D1F' }}>
                        Points Required
                      </label>
                      <input 
                        name="points"
                        type="number" 
                        placeholder="500"
                        min="1"
                        required
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2" style={{ color: '#1D1D1F' }}>
                        Discount %
                      </label>
                      <input 
                        name="discount"
                        type="number" 
                        placeholder="25"
                        min="1"
                        max="100"
                        required
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2" style={{ color: '#1D1D1F' }}>
                        Valid Days
                      </label>
                      <input 
                        name="validDays"
                        type="number" 
                        placeholder="30"
                        min="1"
                        required
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: '#1D1D1F' }}>
                      Terms & Conditions
                    </label>
                    <textarea 
                      name="conditions"
                      placeholder="e.g. Valid on dine-in orders above ₹500"
                      rows={2}
                      required
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                  </div>

                  <div className="flex gap-4 pt-4">
                    <button 
                      type="button"
                      onClick={() => setShowCreateModal(false)}
                      className="flex-1 py-3 px-6 rounded-xl border border-gray-200 font-medium transition-all duration-300"
                      style={{ color: '#6E6E73' }}
                    >
                      Cancel
                    </button>
                    <button 
                      type="submit"
                      className="flex-1 py-3 px-6 rounded-xl font-medium text-white transition-all duration-300 hover:scale-[1.02]"
                      style={{
                        background: 'linear-gradient(135deg, #34C759 0%, #30D158 100%)',
                        boxShadow: '0 4px 16px rgba(52,199,89,0.25)'
                      }}
                    >
                      Create Reward
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}