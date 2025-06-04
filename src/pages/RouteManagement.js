import React, { useEffect, useState } from 'react';
import { Box, Button, Dialog, DialogTitle, DialogContent, DialogActions, TextField, MenuItem, CircularProgress, Typography } from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import { Formik, Form, Field } from 'formik';
import * as Yup from 'yup';
import api from './utils/api';
import Notification from '../components/Layout/Notification';

const RouteSchema = Yup.object().shape({
  headquarter: Yup.string().required('Required'),
  from: Yup.string().required('Required'),
  to: Yup.string().required('Required'),
  distance: Yup.number().required('Required').min(0, 'Distance must be positive'),
});

function RouteManagement() {
  const [routes, setRoutes] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editRoute, setEditRoute] = useState(null);
  const [assignDialog, setAssignDialog] = useState(false);
  const [selectedUser, setSelectedUser] = useState('');
  const [selectedRoutes, setSelectedRoutes] = useState([]);
  const [notif, setNotif] = useState('');
  const [error, setError] = useState('');

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [routesRes, usersRes] = await Promise.all([
        api.get('/routes'),
        api.get('/users'),
      ]);
      setRoutes(routesRes.data);
      setUsers(usersRes.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAll(); }, []);

  const handleAdd = () => { setEditRoute(null); setDialogOpen(true); };
  const handleEdit = (route) => { setEditRoute(route); setDialogOpen(true); };
  const handleDelete = async (id) => {
    if (!window.confirm('Delete this route?')) return;
    try {
      await api.delete(`/routes/${id}`);
      setNotif('Route deleted');
      fetchAll();
    } catch (err) { setError(err.message); }
  };
  const handleAssign = () => { setAssignDialog(true); };
  const handleAssignSubmit = async () => {
    try {
      await api.post('/routes/assign', { userId: selectedUser, routeIds: selectedRoutes });
      setNotif('Routes assigned to user');
      setAssignDialog(false);
      fetchAll();
    } catch (err) { setError(err.message); }
  };

  return (
    <div className="p-6 bg-background min-h-screen font-inter">
      <h1 className="text-3xl font-bold mb-8 text-primary">Route Management</h1>
      <div className="card mb-8 flex gap-4">
        <button className="button-primary" onClick={handleAdd}>Add Route</button>
        <button className="button-primary bg-secondary hover:bg-amber-600" onClick={handleAssign}>Assign Routes to User</button>
      </div>
      {loading ? <CircularProgress /> : (
        <div className="card mb-8 overflow-x-auto">
          <div className="rounded-xl border border-gray-200 overflow-auto">
            <DataGrid
              rows={routes}
              columns={[
                { field: 'headquarter', headerName: 'Headquarter', flex: 1, minWidth: 120 },
                { field: 'from', headerName: 'From', flex: 1, minWidth: 100 },
                { field: 'to', headerName: 'To', flex: 1, minWidth: 100 },
                { field: 'distance', headerName: 'Distance (km)', flex: 1, minWidth: 120 },
                {
                  field: 'actions', headerName: 'Actions', flex: 1, minWidth: 120, renderCell: (params) => (
                    <div className="flex flex-col sm:flex-row gap-2">
                      <button className="button-primary" onClick={() => handleEdit(params.row)}>Edit</button>
                      <button className="button-primary bg-red-500 hover:bg-red-600" onClick={() => handleDelete(params.row._id)}>Delete</button>
                    </div>
                  )
                }
              ]}
              getRowId={row => row._id}
              autoHeight
              pageSize={10}
              className="bg-white"
            />
          </div>
        </div>
      )}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)}>
        <DialogTitle>{editRoute ? 'Edit Route' : 'Add Route'}</DialogTitle>
        <Formik
          initialValues={editRoute ? {
            headquarter: editRoute.headquarter,
            from: editRoute.from,
            to: editRoute.to,
            distance: editRoute.distance,
          } : {
            headquarter: '', from: '', to: '', distance: ''
          }}
          validationSchema={RouteSchema}
          onSubmit={async (values, { setSubmitting }) => {
            try {
              if (editRoute) {
                await api.put(`/routes/${editRoute._id}`, values);
                setNotif('Route updated');
              } else {
                await api.post('/routes', values);
                setNotif('Route added');
              }
              setDialogOpen(false);
              fetchAll();
            } catch (err) {
              setError(err.message);
            } finally {
              setSubmitting(false);
            }
          }}
        >
          {({ errors, touched, handleSubmit, isSubmitting }) => (
            <Form onSubmit={handleSubmit}>
              <DialogContent>
                <Field as={TextField} name="headquarter" label="Headquarter" fullWidth margin="normal" error={!!errors.headquarter && touched.headquarter} helperText={touched.headquarter && errors.headquarter} />
                <Field as={TextField} name="from" label="From" fullWidth margin="normal" error={!!errors.from && touched.from} helperText={touched.from && errors.from} />
                <Field as={TextField} name="to" label="To" fullWidth margin="normal" error={!!errors.to && touched.to} helperText={touched.to && errors.to} />
                <Field as={TextField} name="distance" label="Distance (km)" type="number" fullWidth margin="normal" error={!!errors.distance && touched.distance} helperText={touched.distance && errors.distance} />
              </DialogContent>
              <DialogActions>
                <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
                <Button type="submit" variant="contained" color="primary" disabled={isSubmitting}>{editRoute ? 'Update' : 'Add'}</Button>
              </DialogActions>
            </Form>
          )}
        </Formik>
      </Dialog>
      <Dialog open={assignDialog} onClose={() => setAssignDialog(false)}>
        <DialogTitle>Assign Routes to User</DialogTitle>
        <DialogContent>
          <TextField
            select
            label="User"
            value={selectedUser}
            onChange={e => setSelectedUser(e.target.value)}
            fullWidth
            margin="normal"
          >
            {users.map(user => (
              <MenuItem key={user._id} value={user._id}>{user.name} ({user.email})</MenuItem>
            ))}
          </TextField>
          <TextField
            select
            label="Routes"
            value={selectedRoutes}
            onChange={e => setSelectedRoutes(e.target.value)}
            fullWidth
            margin="normal"
            SelectProps={{ multiple: true }}
          >
            {routes.map(route => (
              <MenuItem key={route._id} value={route._id}>{route.headquarter} - {route.from} - {route.to} ({route.distance} km)</MenuItem>
            ))}
          </TextField>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAssignDialog(false)}>Cancel</Button>
          <Button onClick={handleAssignSubmit} variant="contained" color="primary">Assign</Button>
        </DialogActions>
      </Dialog>
      <Notification open={!!notif} message={notif} severity="success" onClose={() => setNotif('')} />
      <Notification open={!!error} message={error} severity="error" onClose={() => setError('')} />
    </div>
  );
}

export default RouteManagement; 