import React, { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../context/AuthContext';
import api from './utils/api';
import Meta from '../components/Layout/Meta';

function UserDashboard() {
  const { user } = useContext(AuthContext);
  const [history, setHistory] = useState({ checkins: [], claims: [] });
  const [routes, setRoutes] = useState([]);
  const [misc, setMisc] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [historyRes, routesRes, miscRes] = await Promise.all([
          api.get(`/users/${user.id}/history`),
          api.get('/routes'),
          api.get(`/miscellaneous/user/${user.id}`)
        ]);
        setHistory(historyRes.data);
        setRoutes(routesRes.data);
        setMisc(miscRes.data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    if (user) fetchData();
  }, [user]);

  // Create a map of routeId to route name
  const routeMap = {};
  routes.forEach(r => { routeMap[r._id] = `${r.from} - ${r.to}`; });

  // Calculate this month's daily, travel, and misc allowance totals
  const now = new Date();
  const thisMonth = now.toISOString().slice(0, 7); // 'YYYY-MM'
  const monthCheckins = history.checkins.filter(c => c.date.slice(0, 7) === thisMonth);
  const monthClaims = history.claims.filter(c => c.date.slice(0, 7) === thisMonth);
  const monthMisc = misc.filter(m => m.date && m.date.slice(0, 7) === thisMonth);
  const dailyTotal = monthCheckins.reduce((sum, c) => sum + (c.allowanceAmount || 0), 0);
  const travelTotal = monthClaims.reduce((sum, c) => sum + (c.amount || 0), 0);
  const miscTotal = monthMisc.reduce((sum, m) => sum + (m.price || 0), 0);
  const recentCheckins = [...history.checkins].reverse().slice(0, 5);
  const recentClaims = [...history.claims].reverse().slice(0, 5);
  const recentMisc = [...misc].reverse().slice(0, 5);
  const recentRoutes = recentClaims.map(c => routeMap[c.routeId] || c.routeId).filter(Boolean).slice(0, 5);

  // Calculate monthly totals for the last 12 months
  const getLast12Months = () => {
    const arr = [];
    const now = new Date();
    for (let i = 0; i < 12; i++) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      arr.push({
        key: d.toISOString().slice(0, 7),
        label: d.toLocaleString('default', { month: 'short', year: 'numeric' })
      });
    }
    return arr.reverse();
  };
  const months = getLast12Months();
  const monthlyTotals = months.map(m => {
    const checkins = history.checkins.filter(c => c.date.slice(0, 7) === m.key);
    const claims = history.claims.filter(c => c.date.slice(0, 7) === m.key);
    const miscs = misc.filter(mc => mc.date && mc.date.slice(0, 7) === m.key);
    const daily = checkins.reduce((sum, c) => sum + (c.allowanceAmount || 0), 0);
    const travel = claims.reduce((sum, c) => sum + (c.amount || 0), 0);
    const miscTotal = miscs.reduce((sum, m) => sum + (m.price || 0), 0);
    return { ...m, daily, travel, misc: miscTotal, total: daily + travel + miscTotal };
  });
  const thisMonthTotal = dailyTotal + travelTotal + miscTotal;

  return (
    <>
      <Meta title="Dashboard" description="User dashboard for allowance management." />
      <div className="p-4 sm:p-6 md:p-8 bg-background min-h-screen font-inter">
        <h2 className="text-2xl md:text-3xl font-bold mb-8 text-primary">User Dashboard</h2>
        {error && <div className="text-red-500 mb-4">{error}</div>}
        {loading ? <div>Loading...</div> : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Allowance summary */}
            <div className="bg-white rounded-xl shadow-md p-4 space-y-4">
              <h3 className="text-xl md:text-2xl font-bold text-primary mb-2">This Month's Allowances</h3>
              <div className="flex flex-col gap-2">
                <div className="flex justify-between text-base md:text-lg">
                  <span>Daily Allowance</span>
                  <span className="font-semibold">₹{dailyTotal}</span>
                </div>
                <div className="flex justify-between text-base md:text-lg">
                  <span>Travel Allowance</span>
                  <span className="font-semibold">₹{travelTotal}</span>
                </div>
                <div className="flex justify-between text-base md:text-lg">
                  <span>Miscellaneous</span>
                  <span className="font-semibold">₹{miscTotal}</span>
                </div>
                <div className="flex justify-between text-base md:text-lg border-t pt-2 mt-2">
                  <span className="font-bold">Total Allowance</span>
                  <span className="font-bold text-primary">₹{thisMonthTotal}</span>
                </div>
              </div>
            </div>
            {/* Monthly totals table */}
            <div className="bg-white rounded-xl shadow-md p-4 mt-8">
              <h3 className="text-lg font-bold text-primary mb-2">Monthly Allowance Summary (Last 12 Months)</h3>
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm md:text-base">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="px-4 py-2 text-left font-semibold">Month</th>
                      <th className="px-4 py-2 text-left font-semibold">Daily</th>
                      <th className="px-4 py-2 text-left font-semibold">Travel</th>
                      <th className="px-4 py-2 text-left font-semibold">Misc</th>
                      <th className="px-4 py-2 text-left font-semibold">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {monthlyTotals.map((m, i) => (
                      <tr key={m.key} className="border-b">
                        <td className="px-4 py-2">{m.label}</td>
                        <td className="px-4 py-2">₹{m.daily}</td>
                        <td className="px-4 py-2">₹{m.travel}</td>
                        <td className="px-4 py-2">₹{m.misc}</td>
                        <td className="px-4 py-2 font-bold">₹{m.total}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
            {/* Recent daily allowances */}
            <div className="bg-white rounded-xl shadow-md p-4 space-y-4">
              <h3 className="text-xl md:text-2xl font-bold text-primary mb-2">Recent Daily Allowances</h3>
              <ul className="divide-y divide-gray-100">
                {recentCheckins.length === 0 ? <li className="py-2">No recent check-ins.</li> : recentCheckins.map((c, i) => (
                  <li key={i} className="py-2 flex justify-between text-sm md:text-base">
                    <span>{c.date.slice(0, 10)}</span>
                    <span className="font-semibold">₹{c.allowanceAmount}</span>
                  </li>
                ))}
              </ul>
            </div>
            {/* Recent travel allowances */}
            <div className="bg-white rounded-xl shadow-md p-4 space-y-4">
              <h3 className="text-xl md:text-2xl font-bold text-primary mb-2">Recent Travel Allowances</h3>
              <ul className="divide-y divide-gray-100">
                {recentClaims.length === 0 ? <li className="py-2">No recent travel claims.</li> : recentClaims.map((c, i) => (
                  <li key={i} className="py-2 flex justify-between text-sm md:text-base">
                    <span>{c.date.slice(0, 10)}</span>
                    <span className="font-semibold">₹{c.amount}</span>
                  </li>
                ))}
              </ul>
            </div>
            {/* Recent travelled routes */}
            <div className="bg-white rounded-xl shadow-md p-4 space-y-4">
              <h3 className="text-xl md:text-2xl font-bold text-primary mb-2">Recent Travelled Routes</h3>
              <ul className="divide-y divide-gray-100">
                {recentRoutes.length === 0 ? <li className="py-2">No recent routes.</li> : recentRoutes.map((route, i) => (
                  <li key={i} className="py-2 text-sm md:text-base">{route}</li>
                ))}
              </ul>
            </div>
            {/* Recent miscellaneous claims */}
            <div className="bg-white rounded-xl shadow-md p-4 space-y-4">
              <h3 className="text-xl md:text-2xl font-bold text-primary mb-2">Recent Miscellaneous Claims</h3>
              <ul className="divide-y divide-gray-100">
                {recentMisc.length === 0 ? <li className="py-2">No recent claims.</li> : recentMisc.map((m, i) => (
                  <li key={i} className="py-2 flex justify-between text-sm md:text-base">
                    <span>{m.date ? m.date.slice(0, 10) : ''}</span>
                    <span className="font-semibold">₹{m.price}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </div>
    </>
  );
}

export default UserDashboard; 