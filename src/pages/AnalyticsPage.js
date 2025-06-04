import React, { useEffect, useState } from 'react';
import { Typography, Button, CircularProgress, Grid } from '@mui/material';
import { Bar, Pie } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, ArcElement, Tooltip, Legend } from 'chart.js';
import api from './utils/api';
import Notification from '../components/Layout/Notification';

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Tooltip, Legend);

function AnalyticsPage() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [notif, setNotif] = useState('');

  const fetchStats = async () => {
    setLoading(true);
    try {
      const res = await api.get('/analytics/stats');
      setStats(res.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchStats(); }, []);

  const download = (type) => {
    window.open(`${process.env.REACT_APP_API_URL}/api/analytics/export/${type}?token=${localStorage.getItem('token')}`);
    setNotif(`${type.toUpperCase()} export started`);
  };

  return (
    <div className="p-4 sm:p-6 md:p-8 bg-background min-h-screen font-inter">
      <h1 className="text-2xl md:text-3xl font-bold mb-8 text-primary">Analytics & Reports</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {loading ? <CircularProgress /> : stats ? (
          <>
            <div className="bg-white rounded-xl shadow-md p-4 flex flex-col items-center justify-center space-y-2">
              <div className="text-muted text-sm mb-1">Total Allowances</div>
              <div className="text-3xl md:text-4xl font-bold text-primary">{stats.totalAllowances}</div>
            </div>
            <div className="bg-white rounded-xl shadow-md p-4">
              <div className="text-muted text-sm mb-2">User Activity</div>
              <Bar
                data={{
                  labels: stats.userActivity.map(u => u._id),
                  datasets: [{
                    label: 'Check-ins',
                    data: stats.userActivity.map(u => u.count),
                    backgroundColor: '#1D4ED8',
                  }]
                }}
                options={{ plugins: { legend: { display: false } } }}
              />
            </div>
            <div className="bg-white rounded-xl shadow-md p-4">
              <div className="text-muted text-sm mb-2">Top Routes</div>
              <Pie
                data={{
                  labels: stats.topRoutes.map(r => r._id),
                  datasets: [{
                    data: stats.topRoutes.map(r => r.count),
                    backgroundColor: ['#1D4ED8', '#F59E0B', '#6B7280', '#4caf50', '#e91e63'],
                  }]
                }}
              />
            </div>
          </>
        ) : <div>No stats available.</div>}
      </div>
      <div className="mb-4 flex flex-wrap gap-4">
        <Button onClick={() => download('csv')} className="button-primary">Export CSV</Button>
        <Button onClick={() => download('pdf')} className="button-primary bg-secondary hover:bg-amber-600">Export PDF</Button>
      </div>
      <Notification open={!!notif} message={notif} severity="success" onClose={() => setNotif('')} />
      <Notification open={!!error} message={error} severity="error" onClose={() => setError('')} />
    </div>
  );
}

export default AnalyticsPage; 