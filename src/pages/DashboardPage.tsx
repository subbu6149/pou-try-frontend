import React from 'react';
import { 
  Building2, Bird, Package, Egg, Heart, AlertCircle 
} from 'lucide-react';
import { useAuthStore } from '../store/authStore';

interface DashboardCard {
  title: string;
  icon: React.ReactNode;
  value: string;
  change: string;
  color: string;
}

export default function DashboardPage() {
  const user = useAuthStore((state) => state.user);

  const cards: DashboardCard[] = [
    {
      title: 'Active Batches',
      icon: <Bird className="w-6 h-6" />,
      value: '12',
      change: '+2 this week',
      color: 'bg-blue-500',
    },
    {
      title: 'Total Birds',
      icon: <Package className="w-6 h-6" />,
      value: '45,230',
      change: '+1,230 this month',
      color: 'bg-green-500',
    },
    {
      title: 'Egg Production',
      icon: <Egg className="w-6 h-6" />,
      value: '38,450',
      change: 'Today',
      color: 'bg-yellow-500',
    },
    {
      title: 'Feed Stock',
      icon: <Package className="w-6 h-6" />,
      value: '125 MT',
      change: '15 days supply',
      color: 'bg-purple-500',
    },
    {
      title: 'Active Sites',
      icon: <Building2 className="w-6 h-6" />,
      value: '8',
      change: '32 sheds total',
      color: 'bg-indigo-500',
    },
    {
      title: 'Pending Tasks',
      icon: <AlertCircle className="w-6 h-6" />,
      value: '5',
      change: '2 overdue',
      color: 'bg-red-500',
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-1">Welcome back, {user?.full_name}!</p>
        </div>
        <div className="text-sm text-gray-600">
          <p>Role: <span className="font-semibold">{user?.role_name}</span></p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {cards.map((card, index) => (
          <div key={index} className="card p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">{card.title}</p>
                <p className="text-3xl font-bold text-gray-900">{card.value}</p>
                <p className="text-sm text-gray-500 mt-2">{card.change}</p>
              </div>
              <div className={`${card.color} p-3 rounded-lg text-white`}>
                {card.icon}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="card p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <button className="btn btn-secondary flex flex-col items-center gap-2 py-4">
            <Bird className="w-6 h-6" />
            <span>New Batch</span>
          </button>
          <button className="btn btn-secondary flex flex-col items-center gap-2 py-4">
            <Egg className="w-6 h-6" />
            <span>Daily Production</span>
          </button>
          <button className="btn btn-secondary flex flex-col items-center gap-2 py-4">
            <Package className="w-6 h-6" />
            <span>Feed Usage</span>
          </button>
          <button className="btn btn-secondary flex flex-col items-center gap-2 py-4">
            <Heart className="w-6 h-6" />
            <span>Health Event</span>
          </button>
        </div>
      </div>

      {/* Recent Activities */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Recent Activities</h2>
          <div className="space-y-4">
            {[
              { action: 'Batch B-2024-012 placement', time: '2 hours ago', type: 'batch' },
              { action: 'Daily production entry for Shed A-1', time: '5 hours ago', type: 'production' },
              { action: 'Feed receipt - 50 MT Maize', time: '1 day ago', type: 'feed' },
              { action: 'Vaccination scheduled for Batch B-2024-011', time: '2 days ago', type: 'health' },
            ].map((activity, index) => (
              <div key={index} className="flex items-start gap-3 pb-3 border-b last:border-0">
                <div className="w-2 h-2 bg-primary-500 rounded-full mt-2"></div>
                <div className="flex-1">
                  <p className="text-sm text-gray-900">{activity.action}</p>
                  <p className="text-xs text-gray-500">{activity.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="card p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Upcoming Schedules</h2>
          <div className="space-y-4">
            {[
              { title: 'Newcastle Disease Vaccination', batch: 'Batch B-2024-010', date: 'Today, 2:00 PM' },
              { title: 'Body weight measurement', batch: 'Batch B-2024-011', date: 'Tomorrow, 10:00 AM' },
              { title: 'Feed formulation review', batch: 'All batches', date: 'Dec 15, 2024' },
            ].map((schedule, index) => (
              <div key={index} className="flex items-start gap-3 pb-3 border-b last:border-0">
                <AlertCircle className="w-5 h-5 text-orange-500 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">{schedule.title}</p>
                  <p className="text-xs text-gray-600">{schedule.batch}</p>
                  <p className="text-xs text-gray-500 mt-1">{schedule.date}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
