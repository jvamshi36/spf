import React, { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../context/AuthContext';
import { Box, Card, CardContent, Typography, Chip, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, TextField, MenuItem, CircularProgress, Button } from '@mui/material';
import api from './utils/api';
import Notification from '../components/Layout/Notification';
import { saveAs } from 'file-saver';
import moment from 'moment';
import Meta from '../components/Layout/Meta';

function ProfilePage() {
  const { user } = useContext(AuthContext);
  const [history, setHistory] = useState({ checkins: [], claims: [] });
  const [misc, setMisc] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [notif, setNotif] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterDate, setFilterDate] = useState('');
  const [selectedMonth, setSelectedMonth] = useState(moment().month() === 0 ? 12 : moment().month());
  const [selectedYear, setSelectedYear] = useState(moment().month() === 0 ? moment().year() - 1 : moment().year());

  const fetchHistory = async () => {
    setLoading(true);
    try {
      const [res, miscRes] = await Promise.all([
        api.get(`/users/${user.id}/history`),
        api.get(`/miscellaneous/user/${user.id}`)
      ]);
      setHistory(res.data);
      setMisc(miscRes.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { if (user) fetchHistory(); }, [user]);

  // Group by month
  const groupByMonth = (arr, dateKey = 'date') => {
    return arr.reduce((acc, item) => {
      const month = moment(item[dateKey]).format('YYYY-MM');
      if (!acc[month]) acc[month] = [];
      acc[month].push(item);
      return acc;
    }, {});
  };

  // Get last 6 months keys and labels
  const getLast6Months = () => {
    const arr = [];
    for (let i = 0; i < 6; i++) {
      const m = moment().subtract(i, 'months');
      arr.push({ key: m.format('YYYY-MM'), label: m.format('MMMM YYYY') });
    }
    return arr.reverse();
  };
  const last6Months = getLast6Months();
  // State for selected month
  const [selectedHistoryMonth, setSelectedHistoryMonth] = useState(last6Months[last6Months.length - 1].key);
  // Get all data for selected month
  const selectedMonthData = [
    ...history.checkins.filter(c => moment(c.date).format('YYYY-MM') === selectedHistoryMonth).map(c => ({ ...c, _type: 'checkin' })),
    ...history.claims.filter(c => moment(c.date).format('YYYY-MM') === selectedHistoryMonth).map(c => ({ ...c, _type: 'claim' })),
    ...misc.filter(m => moment(m.date).format('YYYY-MM') === selectedHistoryMonth).map(m => ({ ...m, _type: 'misc' })),
  ].sort((a, b) => new Date(a.date) - new Date(b.date));

  const now = moment();
  const thisMonth = now.format('YYYY-MM');
  const monthCheckins = groupByMonth(history.checkins)[thisMonth] || [];
  const monthClaims = groupByMonth(history.claims)[thisMonth] || [];
  const monthMisc = groupByMonth(misc)[thisMonth] || [];
  const dailyTotal = monthCheckins.reduce((sum, c) => sum + (c.allowanceAmount || 0), 0);
  const travelTotal = monthClaims.reduce((sum, c) => sum + (c.amount || 0), 0);
  const miscTotal = monthMisc.reduce((sum, m) => sum + (m.price || 0), 0);

  const recentCheckins = [...history.checkins].reverse().slice(0, 5);
  const recentClaims = [...history.claims].reverse().slice(0, 5);
  const recentMisc = [...misc].reverse().slice(0, 5);
  const recentRoutes = recentClaims.map(c => c.routeId).filter(Boolean).slice(0, 5);

  // Only allow download if the selected month is complete
  const isMonthComplete = moment({ year: selectedYear, month: selectedMonth - 1 }).endOf('month').isBefore(now, 'day');

  const handleDownload = async () => {
    try {
      const res = await api.get(`/reports/monthly/${user._id || user.id}/${selectedYear}/${selectedMonth}`, { responseType: 'blob' });
      saveAs(res.data, `report_${user.name}_${selectedYear}_${selectedMonth}.pdf`);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to download report');
    }
  };

  return (
    <>
      <Meta title="Profile" description="User profile and allowance history." />
        <h1 className="text-2xl md:text-3xl font-bold mb-8 text-primary">Profile</h1>
        <div className="bg-white rounded-xl shadow-md p-4 sm:p-8 flex flex-col items-center mb-8">
          <div className="w-20 h-20 rounded-full bg-primary text-white flex items-center justify-center font-bold text-3xl mb-4">
            {user.name ? user.name[0].toUpperCase() : '?'}
          </div>
          <div className="text-lg font-semibold text-gray-800 mb-1">{user.name}</div>
          <div className="text-sm text-muted mb-2">{user.role || `Level ${user.roleLevel}`}</div>
          <div className="text-sm text-gray-600 mb-2">{user.email}</div>
          <div className="text-sm text-gray-600 mb-2">Headquarter: {user.headquarter || ''}</div>
          <div className="flex flex-wrap gap-2 mt-2 justify-center">
            <TextField
              select
              label="Month"
              value={selectedMonth}
              onChange={e => setSelectedMonth(Number(e.target.value))}
              size="small"
            >
              {Array.from({ length: 12 }, (_, i) => {
                const m = moment().subtract(i, 'months');
                return <MenuItem key={m.format('YYYY-MM')} value={m.month() + 1}>{m.format('MMMM YYYY')}</MenuItem>;
              })}
            </TextField>
            <TextField
              select
              label="Year"
              value={selectedYear}
              onChange={e => setSelectedYear(Number(e.target.value))}
              size="small"
            >
              {Array.from(new Set(Array.from({ length: 12 }, (_, i) => moment().subtract(i, 'months').year()))).map(y => (
                <MenuItem key={y} value={y}>{y}</MenuItem>
              ))}
            </TextField>
            <Button
              variant="contained"
              color="primary"
              onClick={handleDownload}
              disabled={!isMonthComplete}
              className="min-h-[44px]"
            >
              Download Monthly Report
            </Button>
          </div>
          {!isMonthComplete && <div className="text-xs text-gray-500 mt-1">Report available only after month end.</div>}
          <div className="flex flex-wrap gap-4 mt-4 justify-center">
            <div className="bg-gray-100 rounded-lg px-4 py-2 text-center">
              <div className="text-xs text-muted">Monthly Daily Allowance</div>
              <div className="text-lg font-bold text-primary">₹{dailyTotal}</div>
            </div>
            <div className="bg-gray-100 rounded-lg px-4 py-2 text-center">
              <div className="text-xs text-muted">Monthly Travel Allowance</div>
              <div className="text-lg font-bold text-primary">₹{travelTotal}</div>
            </div>
            <div className="bg-gray-100 rounded-lg px-4 py-2 text-center">
              <div className="text-xs text-muted">Monthly Miscellaneous</div>
              <div className="text-lg font-bold text-primary">₹{miscTotal}</div>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-md p-4 sm:p-8 mb-8">
          <h2 className="text-xl md:text-2xl font-bold text-primary mb-4">Recent Activity</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <h3 className="font-semibold text-primary mb-2">Recent Daily Allowances</h3>
              <ul className="divide-y divide-gray-100">
                {recentCheckins.length === 0 ? <li className="py-2">No recent check-ins.</li> : recentCheckins.map((c, i) => (
                  <li key={i} className="py-2 flex justify-between text-sm md:text-base">
                    <span>{moment(c.date).format('YYYY-MM-DD')}</span>
                    <span className="font-semibold">₹{c.allowanceAmount}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-primary mb-2">Recent Travel Allowances</h3>
              <ul className="divide-y divide-gray-100">
                {recentClaims.length === 0 ? <li className="py-2">No recent travel claims.</li> : recentClaims.map((c, i) => (
                  <li key={i} className="py-2 flex justify-between text-sm md:text-base">
                    <span>{moment(c.date).format('YYYY-MM-DD')}</span>
                    <span className="font-semibold">₹{c.amount}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-primary mb-2">Recent Miscellaneous</h3>
              <ul className="divide-y divide-gray-100">
                {recentMisc.length === 0 ? <li className="py-2">No recent claims.</li> : recentMisc.map((m, i) => (
                  <li key={i} className="py-2 flex justify-between text-sm md:text-base">
                    <span>{moment(m.date).format('YYYY-MM-DD')}</span>
                    <span className="font-semibold">₹{m.price}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-md p-4 sm:p-8">
          <h2 className="text-xl md:text-2xl font-bold text-primary mb-4">Full Allowance, Travel & Miscellaneous History</h2>
          <div className="flex items-center gap-4 mb-4">
            <label className="font-semibold text-primary">Select Month:</label>
            <select
              className="input px-2 py-1 rounded border border-gray-300"
              value={selectedHistoryMonth}
              onChange={e => setSelectedHistoryMonth(e.target.value)}
            >
              {last6Months.map(m => (
                <option key={m.key} value={m.key}>{m.label}</option>
              ))}
            </select>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm md:text-base">
              <thead>
                <tr className="bg-gray-50">
                  <th className="px-4 py-2 text-left font-semibold">Date</th>
                  <th className="px-4 py-2 text-left font-semibold">Type</th>
                  <th className="px-4 py-2 text-left font-semibold">Amount</th>
                  <th className="px-4 py-2 text-left font-semibold">Details</th>
                </tr>
              </thead>
              <tbody>
                {selectedMonthData.length === 0 ? (
                  <tr><td colSpan={4} className="text-center py-4 text-gray-500">No data for this month.</td></tr>
                ) : selectedMonthData.map((item, i) => (
                  <tr key={item._id || i} className="border-b">
                    <td className="px-4 py-2">{moment(item.date).format('YYYY-MM-DD')}</td>
                    <td className="px-4 py-2">
                      {item._type === 'checkin' ? 'Check-in' : item._type === 'claim' ? 'Travel' : 'Miscellaneous'}
                    </td>
                    <td className="px-4 py-2">₹{item._type === 'checkin' ? item.allowanceAmount : item._type === 'claim' ? item.amount : item.price}</td>
                    <td className="px-4 py-2">
                      {item._type === 'checkin' ? '—' : item._type === 'claim' ? `Route: ${item.routeId || '—'}` : item.name}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        <Notification open={!!notif} message={notif} severity="success" onClose={() => setNotif('')} />
        <Notification open={!!error} message={error} severity="error" onClose={() => setError('')} />
    </>
  );
}

export default ProfilePage;