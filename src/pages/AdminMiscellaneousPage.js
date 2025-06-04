import React, { useEffect, useState } from 'react';
import { Card, Typography, Button, CircularProgress, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Chip } from '@mui/material';
import api from './utils/api';

function AdminMiscellaneousPage() {
  const [claims, setClaims] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notif, setNotif] = useState('');
  const [error, setError] = useState('');

  const fetchClaims = async () => {
    setLoading(true);
    try {
      const res = await api.get('/miscellaneous');
      setClaims(res.data);
    } catch (err) {
      setError('Failed to fetch claims');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchClaims(); }, []);

  const handleAction = async (id, action) => {
    try {
      await api.put(`/miscellaneous/${id}/${action}`);
      setNotif(`Claim ${action}d!`);
      fetchClaims();
    } catch (err) {
      setError('Failed to update claim');
    }
  };

  return (
    <div className="p-4 sm:p-6 md:p-8 bg-background min-h-screen font-inter">
      <h1 className="text-2xl md:text-3xl font-bold mb-8 text-primary">Miscellaneous Claims (Admin)</h1>
      {loading ? <CircularProgress /> : (
        <div className="bg-white rounded-xl shadow-md p-4 sm:p-8">
          <div className="overflow-x-auto">
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>User</TableCell>
                  <TableCell>Date</TableCell>
                  <TableCell>Name</TableCell>
                  <TableCell>Price</TableCell>
                  <TableCell>Attachment</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {claims.map(claim => (
                  <TableRow key={claim._id}>
                    <TableCell>{claim.userId?.name || '—'}</TableCell>
                    <TableCell>{claim.date ? claim.date.slice(0,10) : ''}</TableCell>
                    <TableCell>{claim.name}</TableCell>
                    <TableCell>₹{claim.price}</TableCell>
                    <TableCell>
                      <a href={`/${claim.attachment}`} target="_blank" rel="noopener noreferrer" className="text-primary underline">View</a>
                    </TableCell>
                    <TableCell>
                      <Chip label={claim.status} color={claim.status === 'approved' ? 'success' : claim.status === 'rejected' ? 'error' : 'warning'} />
                    </TableCell>
                    <TableCell>
                      {claim.status === 'pending' && (
                        <div className="flex gap-2 flex-wrap">
                          <Button size="small" color="success" variant="contained" onClick={() => handleAction(claim._id, 'approve')}>Approve</Button>
                          <Button size="small" color="error" variant="contained" onClick={() => handleAction(claim._id, 'reject')}>Reject</Button>
                        </div>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      )}
      {notif && <div className="text-green-600 mt-4">{notif}</div>}
      {error && <div className="text-red-600 mt-4">{error}</div>}
    </div>
  );
}

export default AdminMiscellaneousPage; 