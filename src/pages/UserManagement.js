import React, { useEffect, useState } from 'react';
import { Box, Button, Dialog, DialogTitle, DialogContent, DialogActions, TextField, MenuItem, CircularProgress, Typography, IconButton, Collapse, List, ListItem, ListItemText } from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import { Formik, Form, Field } from 'formik';
import * as Yup from 'yup';
import api from './utils/api';
import Notification from '../components/Layout/Notification';
import { ExpandLess, ExpandMore } from '@mui/icons-material';

const UserSchema = Yup.object().shape({
  name: Yup.string().required('Required'),
  email: Yup.string().email('Invalid email').required('Required'),
  password: Yup.string().min(6, 'Too Short!'),
  roleLevel: Yup.number().min(2).required('Required'),
  assignedRoutes: Yup.array(),
  headquarter: Yup.string().required('Required'),
});

function UserManagement() {
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [routes, setRoutes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editUser, setEditUser] = useState(null);
  const [notif, setNotif] = useState('');
  const [error, setError] = useState('');
  const [headquarterFilter, setHeadquarterFilter] = useState('');
  const [allowanceDialogOpen, setAllowanceDialogOpen] = useState(false);
  const [allowanceUser, setAllowanceUser] = useState(null);
  const [allowanceHistory, setAllowanceHistory] = useState([]);
  const [expandedMonths, setExpandedMonths] = useState({});

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [usersRes, rolesRes, routesRes] = await Promise.all([
        api.get('/users'),
        api.get('/roles'),
        api.get('/routes'),
      ]);
      setUsers(usersRes.data);
      setRoles(rolesRes.data);
      setRoutes(routesRes.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAll(); }, []);

  const handleAdd = () => { setEditUser(null); setDialogOpen(true); };
  const handleEdit = (user) => { setEditUser(user); setDialogOpen(true); };
  const handleDelete = async (id) => {
    if (!window.confirm('Delete this user?')) return;
    try {
      await api.delete(`/users/${id}`);
      setNotif('User deleted');
      fetchAll();
    } catch (err) { setError(err.message); }
  };

  const handleAllowance = async (user) => {
    setAllowanceUser(user);
    setAllowanceDialogOpen(true);
    setAllowanceHistory([]);
    try {
      const res = await api.get(`/users/${user._id}/history`);
      // Group by month
      const allCheckins = res.data.checkins || [];
      const allClaims = res.data.claims || [];
      const byMonth = {};
      allCheckins.forEach(c => {
        const month = c.date.slice(0, 7); // YYYY-MM
        if (!byMonth[month]) byMonth[month] = { checkins: [], claims: [] };
        byMonth[month].checkins.push(c);
      });
      allClaims.forEach(c => {
        const month = c.date.slice(0, 7);
        if (!byMonth[month]) byMonth[month] = { checkins: [], claims: [] };
        byMonth[month].claims.push(c);
      });
      setAllowanceHistory(Object.entries(byMonth).sort((a, b) => b[0].localeCompare(a[0]))); // [[month, {checkins, claims}], ...]
    } catch (err) {
      setAllowanceHistory([]);
    }
  };

  const handleExpandMonth = (month) => {
    setExpandedMonths(prev => ({ ...prev, [month]: !prev[month] }));
  };

  const uniqueHeadquarters = Array.from(new Set(users.map(u => u.headquarter))).filter(Boolean);

  return (
    <div className="p-6 bg-background min-h-screen font-inter">
      <h1 className="text-3xl font-bold mb-8 text-primary">User Management</h1>
      <div className="card mb-8">
        <div className="flex flex-col md:flex-row md:items-center gap-4 mb-4">
          <button className="button-primary" onClick={handleAdd}>Add User</button>
          <TextField
            select
            label="Filter by Headquarter"
            value={headquarterFilter}
            onChange={e => setHeadquarterFilter(e.target.value)}
            style={{ minWidth: 200 }}
          >
            <MenuItem value="">All Headquarters</MenuItem>
            {uniqueHeadquarters.map(hq => (
              <MenuItem key={hq} value={hq}>{hq}</MenuItem>
            ))}
          </TextField>
        </div>
        {loading ? <CircularProgress /> : (
          <div className="overflow-x-auto">
            <div className="rounded-xl border border-gray-200 overflow-auto">
              <DataGrid
                rows={headquarterFilter ? users.filter(u => u.headquarter === headquarterFilter) : users}
                columns={[
                  { field: 'name', headerName: 'Name', flex: 1, minWidth: 120 },
                  { field: 'email', headerName: 'Email', flex: 1, minWidth: 140 },
                  { field: 'roleLevel', headerName: 'Role', flex: 1, minWidth: 80 },
                  { field: 'headquarter', headerName: 'Headquarter', flex: 1, minWidth: 120 },
                  { field: 'assignedRoutes', headerName: 'Routes', flex: 1, minWidth: 120, valueGetter: (params) => params.row.assignedRoutes?.map(r => r.from + '-' + r.to).join(', ') },
                  {
                    field: 'actions', headerName: 'Actions', flex: 1, minWidth: 120, renderCell: (params) => (
                      <div className="flex flex-col sm:flex-row gap-2">
                        <button className="button-primary mr-0 sm:mr-2" onClick={() => handleEdit(params.row)}>Edit</button>
                        <button className="button-primary bg-red-500 hover:bg-red-600 mr-0 sm:mr-2" onClick={() => handleDelete(params.row._id)}>Delete</button>
                        <button className="button-primary bg-blue-500 hover:bg-blue-600" onClick={() => handleAllowance(params.row)}>Allowance</button>
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
      </div>
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)}>
        <DialogTitle>{editUser ? 'Edit User' : 'Add User'}</DialogTitle>
        <Formik
          initialValues={editUser ? {
            name: editUser.name,
            email: editUser.email,
            password: '',
            roleLevel: editUser.roleLevel,
            assignedRoutes: editUser.assignedRoutes?.map(r => r._id) || [],
            headquarter: editUser.headquarter || '',
          } : {
            name: '', email: '', password: '', roleLevel: 2, assignedRoutes: [], headquarter: ''
          }}
          validationSchema={UserSchema}
          onSubmit={async (values, { setSubmitting }) => {
            try {
              if (editUser) {
                await api.put(`/users/${editUser._id}`, values);
                setNotif('User updated');
              } else {
                await api.post('/users', values);
                setNotif('User added');
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
          {({ errors, touched, handleSubmit, isSubmitting, values, setFieldValue }) => (
            <Form onSubmit={handleSubmit}>
              <DialogContent>
                <Field as={TextField} name="name" label="Name" fullWidth margin="normal" error={!!errors.name && touched.name} helperText={touched.name && errors.name} />
                <Field as={TextField} name="email" label="Email" fullWidth margin="normal" error={!!errors.email && touched.email} helperText={touched.email && errors.email} />
                {!editUser && <Field as={TextField} name="password" label="Password" type="password" fullWidth margin="normal" error={!!errors.password && touched.password} helperText={touched.password && errors.password} />}
                <TextField
                  select
                  name="roleLevel"
                  label="Role"
                  value={values.roleLevel}
                  onChange={e => setFieldValue('roleLevel', e.target.value)}
                  fullWidth
                  margin="normal"
                  error={!!errors.roleLevel && touched.roleLevel}
                  helperText={touched.roleLevel && errors.roleLevel}
                >
                  {roles.filter(r => r.roleLevel !== 1).map(role => (
                    <MenuItem key={role.roleLevel} value={role.roleLevel}>{role.name}</MenuItem>
                  ))}
                </TextField>
                <TextField
                  select
                  name="assignedRoutes"
                  label="Assigned Routes"
                  value={values.assignedRoutes}
                  onChange={e => setFieldValue('assignedRoutes', e.target.value)}
                  fullWidth
                  margin="normal"
                  SelectProps={{ multiple: true }}
                >
                  {routes.map(route => (
                    <MenuItem key={route._id} value={route._id}>{route.from} - {route.to}</MenuItem>
                  ))}
                </TextField>
                <TextField
                  name="headquarter"
                  label="Headquarter"
                  value={values.headquarter}
                  onChange={e => setFieldValue('headquarter', e.target.value)}
                  fullWidth
                  margin="normal"
                  error={!!errors.headquarter && touched.headquarter}
                  helperText={touched.headquarter && errors.headquarter}
                  placeholder="Enter headquarter (free text)"
                />
              </DialogContent>
              <DialogActions>
                <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
                <Button type="submit" variant="contained" color="primary" disabled={isSubmitting}>{editUser ? 'Update' : 'Add'}</Button>
              </DialogActions>
            </Form>
          )}
        </Formik>
      </Dialog>
      <Notification open={!!notif} message={notif} severity="success" onClose={() => setNotif('')} />
      <Notification open={!!error} message={error} severity="error" onClose={() => setError('')} />
      <Dialog open={allowanceDialogOpen} onClose={() => setAllowanceDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Allowance History for {allowanceUser?.name}</DialogTitle>
        <DialogContent>
          {allowanceHistory.length === 0 ? (
            <div>No allowance history found.</div>
          ) : (
            <List>
              {allowanceHistory.map(([month, data]) => (
                <React.Fragment key={month}>
                  <ListItem button onClick={() => handleExpandMonth(month)}>
                    <ListItemText primary={month} secondary={`Daily: ₹${data.checkins.reduce((sum, c) => sum + (c.allowanceAmount || 0), 0)} | Travel: ₹${data.claims.reduce((sum, c) => sum + (c.amount || 0), 0)}`} />
                    {expandedMonths[month] ? <ExpandLess /> : <ExpandMore />}
                  </ListItem>
                  <Collapse in={expandedMonths[month]} timeout="auto" unmountOnExit>
                    <List component="div" disablePadding>
                      {data.checkins.map((c, i) => (
                        <ListItem key={i} sx={{ pl: 4 }}>
                          <ListItemText primary={`Check-in: ${c.date.slice(0,10)}`} secondary={`Amount: ₹${c.allowanceAmount}`} />
                        </ListItem>
                      ))}
                      {data.claims.map((c, i) => (
                        <ListItem key={i + data.checkins.length} sx={{ pl: 4 }}>
                          <ListItemText primary={`Travel: ${c.date.slice(0,10)}`} secondary={`Amount: ₹${c.amount}`} />
                        </ListItem>
                      ))}
                    </List>
                  </Collapse>
                </React.Fragment>
              ))}
            </List>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default UserManagement; 