import React, { useEffect, useState } from 'react';
import api from './utils/api';

function AdminDashboard() {
  const [users, setUsers] = useState([]);
  const [routes, setRoutes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [todayStats, setTodayStats] = useState({
    checkins: 0,
    allowances: 0,
    pendingCheckouts: 0,
  });

  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true);
      try {
        const [usersRes, routesRes] = await Promise.all([
          api.get('/users'),
          api.get('/routes'),
        ]);
        setUsers(usersRes.data);
        setRoutes(routesRes.data);

        // Aggregate today's check-ins, allowances, and pending check-outs
        const today = new Date().toISOString().slice(0, 10);
        let checkins = 0, allowances = 0, pendingCheckouts = 0;

        // For each user, fetch their history and aggregate
        await Promise.all(usersRes.data.map(async (user) => {
          const res = await api.get(`/users/${user._id}/history`);
          const todayCheckin = res.data.checkins.find(c => c.date.slice(0, 10) === today);
          if (todayCheckin) {
            checkins += 1;
            allowances += todayCheckin.allowanceAmount || 0;
            if (!todayCheckin.checkOutTime) pendingCheckouts += 1;
          }
          // Add today's travel claims
          res.data.claims
            .filter(c => c.date.slice(0, 10) === today)
            .forEach(c => { allowances += c.amount || 0; });
        }));

        setTodayStats({ checkins, allowances, pendingCheckouts });
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  return (
    <div className="p-4 sm:p-6 md:p-8 bg-gradient-to-r from-gray-100 to-gray-200 min-h-screen font-inter">
      <h1 className="text-2xl md:text-3xl font-bold mb-8 text-gray-800">Admin Dashboard</h1>
      {error && <div className="text-red-500 mb-4">{error}</div>}
      {loading ? <div>Loading...</div> : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-md p-4 flex flex-col items-center space-y-2">
            <div className="text-muted text-sm mb-1">Total Users</div>
            <div className="text-2xl md:text-3xl font-bold text-primary">{users.length}</div>
          </div>
          <div className="bg-white rounded-xl shadow-md p-4 flex flex-col items-center space-y-2">
            <div className="text-muted text-sm mb-1">Daily Check-ins Today</div>
            <div className="text-2xl md:text-3xl font-bold text-primary">{todayStats.checkins}</div>
          </div>
          <div className="bg-white rounded-xl shadow-md p-4 flex flex-col items-center space-y-2">
            <div className="text-muted text-sm mb-1">Total Allowances Paid Today</div>
            <div className="text-2xl md:text-3xl font-bold text-primary">₹{todayStats.allowances}</div>
          </div>
          <div className="bg-white rounded-xl shadow-md p-4 flex flex-col items-center space-y-2">
            <div className="text-muted text-sm mb-1">Active Routes</div>
            <div className="text-2xl md:text-3xl font-bold text-primary">{routes.length}</div>
          </div>
          <div className="bg-white rounded-xl shadow-md p-4 flex flex-col items-center space-y-2">
            <div className="text-muted text-sm mb-1">Pending Check-outs</div>
            <div className="text-2xl md:text-3xl font-bold text-primary">{todayStats.pendingCheckouts}</div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminDashboard; 