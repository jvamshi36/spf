import React, { useEffect, useState } from 'react';
import { DataGrid } from '@mui/x-data-grid';
import api from './utils/api';
import Notification from '../components/Layout/Notification';
import Modal from '../components/Modal';

const PERMISSIONS = [
  { key: 'canApprove', label: 'Can Approve' },
  { key: 'canEdit', label: 'Can Edit' },
  { key: 'canView', label: 'Can View' },
];

const ALL_POSSIBLE_PERMISSIONS = [
  'canApprove',
  'canEdit',
  'canView',
  'canApplyDailyAllowance',
  'canDownloadReport',
  'canDeleteUser',
  'canExportData',
  'canManageSettings',
  'canAssignRoutes',
  'canResetPassword',
  // Add more as needed
];

function RoleManagement() {
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [currentId, setCurrentId] = useState(null);
  const [notif, setNotif] = useState('');
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    name: '',
    roleLevel: '',
    allowanceRates: { headquarter: '', exStation: '', outStation: '', travelPerKm: '' },
    permissions: { canApprove: false, canEdit: false, canView: false },
    description: '',
  });
  const [newPermKey, setNewPermKey] = useState('');

  const fetchRoles = async () => {
    setLoading(true);
    try {
      const res = await api.get('/roles');
      setRoles(res.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchRoles(); }, []);

  const openAddModal = () => {
    setEditMode(false);
    setCurrentId(null);
    setForm({
      name: '',
      roleLevel: '',
      allowanceRates: { headquarter: '', exStation: '', outStation: '', travelPerKm: '' },
      permissions: { canApprove: false, canEdit: false, canView: false },
      description: '',
    });
    setModalOpen(true);
  };

  const openEditModal = (role) => {
    setEditMode(true);
    setCurrentId(role._id);
    setForm({
      name: role.name,
      roleLevel: role.roleLevel,
      allowanceRates: {
        headquarter: role.allowanceRates?.headquarter ?? '',
        exStation: role.allowanceRates?.exStation ?? '',
        outStation: role.allowanceRates?.outStation ?? '',
        travelPerKm: role.allowanceRates?.travelPerKm ?? '',
      },
      permissions: {
        canApprove: role.permissions?.canApprove || false,
        canEdit: role.permissions?.canEdit || false,
        canView: role.permissions?.canView || false,
      },
      description: role.description || '',
    });
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setError('');
  };

  const validateForm = () => {
    const msg = (() => {
      if (!form.name.trim()) return 'Role name is required';
      if (!form.roleLevel || isNaN(form.roleLevel) || form.roleLevel < 1) return 'Role level must be 1 or higher';
      const r = form.allowanceRates;
      if ([r.headquarter, r.exStation, r.outStation].some(v => v === '' || isNaN(v) || v < 0)) return 'All allowance rates must be numbers';
      if (r.travelPerKm === '' || isNaN(r.travelPerKm) || r.travelPerKm < 0) return 'Travel per km must be a number';
      return null;
    })();
    return msg;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errMsg = validateForm();
    if (errMsg) {
      setError(errMsg);
      return;
    }
    setError('');
    try {
      if (editMode) {
        await api.put(`/roles/${currentId}`, {
          name: form.name,
          roleLevel: form.roleLevel,
          permissions: form.permissions,
          allowanceRates: {
            headquarter: Number(form.allowanceRates.headquarter) || 0,
            exStation: Number(form.allowanceRates.exStation) || 0,
            outStation: Number(form.allowanceRates.outStation) || 0,
            travelPerKm: Number(form.allowanceRates.travelPerKm) || 0,
          },
          description: form.description,
        });
        setNotif('Role updated');
      } else {
        await api.post('/roles', {
          name: form.name,
          roleLevel: parseInt(form.roleLevel, 10),
          permissions: form.permissions,
          allowanceRates: {
            headquarter: Number(form.allowanceRates.headquarter) || 0,
            exStation: Number(form.allowanceRates.exStation) || 0,
            outStation: Number(form.allowanceRates.outStation) || 0,
            travelPerKm: Number(form.allowanceRates.travelPerKm) || 0,
          },
          description: form.description,
        });
        setNotif('Role created');
      }
      closeModal();
      fetchRoles();
    } catch (err) {
      if (err.message && err.message.includes('Role level already exists')) {
        setError('Role level already exists. Please choose a unique level.');
      } else {
        setError(err.message);
      }
    }
  };

  const handlePermToggle = (key) => {
    setForm(f => ({ ...f, permissions: { ...f.permissions, [key]: !f.permissions[key] } }));
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this role?')) return;
    try {
      await api.delete(`/roles/${id}`);
      setNotif('Role deleted');
      fetchRoles();
    } catch (err) { setError(err.message); }
  };

  const allPermissionKeys = [
    ...PERMISSIONS.map(p => p.key),
    ...Object.keys(form.permissions).filter(
      k => !PERMISSIONS.map(p => p.key).includes(k)
    )
  ];

  return (
    <div className="p-6 bg-background min-h-screen font-inter">
      <h1 className="text-3xl font-bold mb-8 text-primary">Role Management</h1>
      <div className="card mb-8">
        <button className="button-primary mb-4" onClick={openAddModal}>Add Role</button>
        {loading ? <div>Loading...</div> : (
          <div className="overflow-x-auto">
            <div className="rounded-xl border border-gray-200 overflow-auto">
              <DataGrid
                rows={roles}
                columns={[
                  { field: 'roleLevel', headerName: 'Level', flex: 1, minWidth: 80 },
                  { field: 'name', headerName: 'Name', flex: 1, minWidth: 120 },
                  { field: 'description', headerName: 'Description', flex: 1, minWidth: 120, hide: true },
                  { field: 'headquarter', headerName: 'Headquarter Rate', flex: 1, minWidth: 120, valueGetter: (params) => params.row.allowanceRates?.headquarter },
                  { field: 'exStation', headerName: 'Ex-Station Rate', flex: 1, minWidth: 120, valueGetter: (params) => params.row.allowanceRates?.exStation },
                  { field: 'outStation', headerName: 'Out-Station Rate', flex: 1, minWidth: 120, valueGetter: (params) => params.row.allowanceRates?.outStation },
                  { field: 'travelPerKm', headerName: 'Travel/km', flex: 1, minWidth: 100, valueGetter: (params) => params.row.allowanceRates?.travelPerKm },
                  { field: 'permissions', headerName: 'Permissions', flex: 1, minWidth: 120, valueGetter: (params) => PERMISSIONS.map(p => params.row.permissions?.[p.key] ? p.label : null).filter(Boolean).join(', ') },
                  {
                    field: 'actions', headerName: 'Actions', flex: 1, minWidth: 120, renderCell: (params) => (
                      <div className="flex flex-col sm:flex-row gap-2">
                        <button className="button-primary" onClick={() => openEditModal(params.row)}>Edit</button>
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
      </div>
      <Modal isOpen={modalOpen} onClose={closeModal} title={editMode ? 'Edit Role' : 'Add Role'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex gap-2">
            <div className="flex-1">
              <label className="block text-sm font-medium mb-1">Role Name</label>
              <input
                className="input w-full"
                placeholder="Role Name"
                value={form.name}
                onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
              />
            </div>
            <div className="w-32">
              <label className="block text-sm font-medium mb-1">Role Level</label>
              <input
                className="input w-full"
                placeholder="Role Level (1+)"
                type="number"
                value={form.roleLevel}
                onChange={e => setForm(f => ({ ...f, roleLevel: e.target.value }))}
                min={1}
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Description (optional)</label>
            <input
              className="input w-full"
              placeholder="Description (optional)"
              value={form.description}
              onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
            />
          </div>
          <div className="flex gap-2 flex-wrap">
            <div className="w-32">
              <label className="block text-sm font-medium mb-1">Headquarter Allowance</label>
              <input
                className="input w-full"
                placeholder="Headquarter Allowance"
                type="number"
                value={form.allowanceRates.headquarter}
                onChange={e => setForm(f => ({ ...f, allowanceRates: { ...f.allowanceRates, headquarter: e.target.value } }))}
              />
            </div>
            <div className="w-32">
              <label className="block text-sm font-medium mb-1">Ex-Station Allowance</label>
              <input
                className="input w-full"
                placeholder="Ex-Station Allowance"
                type="number"
                value={form.allowanceRates.exStation}
                onChange={e => setForm(f => ({ ...f, allowanceRates: { ...f.allowanceRates, exStation: e.target.value } }))}
              />
            </div>
            <div className="w-32">
              <label className="block text-sm font-medium mb-1">Out-Station Allowance</label>
              <input
                className="input w-full"
                placeholder="Out-Station Allowance"
                type="number"
                value={form.allowanceRates.outStation}
                onChange={e => setForm(f => ({ ...f, allowanceRates: { ...f.allowanceRates, outStation: e.target.value } }))}
              />
            </div>
            <div className="w-32">
              <label className="block text-sm font-medium mb-1">Travel Allowance (per km)</label>
              <input
                className="input w-full"
                placeholder="Travel Allowance (per km)"
                type="number"
                value={form.allowanceRates.travelPerKm}
                onChange={e => setForm(f => ({ ...f, allowanceRates: { ...f.allowanceRates, travelPerKm: e.target.value } }))}
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Permissions</label>
            <div className="flex gap-4 mt-2 flex-wrap">
              {allPermissionKeys.map(key => (
                <label key={key} className="flex items-center gap-1 text-sm">
                  <input
                    type="checkbox"
                    checked={!!form.permissions[key]}
                    onChange={() => handlePermToggle(key)}
                  />
                  {key}
                </label>
              ))}
            </div>
            <div className="flex gap-2 mt-2 items-center">
              <select
                className="input w-48"
                value={newPermKey}
                onChange={e => setNewPermKey(e.target.value)}
              >
                <option value="">Select permission to add</option>
                {ALL_POSSIBLE_PERMISSIONS.filter(
                  p => !allPermissionKeys.includes(p)
                ).map(p => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>
              <button
                type="button"
                className="button-primary"
                onClick={() => {
                  if (newPermKey && !allPermissionKeys.includes(newPermKey)) {
                    setForm(f => ({ ...f, permissions: { ...f.permissions, [newPermKey]: true } }));
                    setNewPermKey('');
                  }
                }}
                disabled={!newPermKey}
              >Add</button>
            </div>
          </div>
          {error && <div className="text-red-500 text-sm">{error}</div>}
          <div className="flex justify-end gap-2">
            <button type="button" className="button-primary bg-muted hover:bg-gray-400" onClick={closeModal}>Cancel</button>
            <button type="submit" className="button-primary">{editMode ? 'Update' : 'Add'}</button>
          </div>
        </form>
      </Modal>
      <Notification open={!!notif} message={notif} severity="success" onClose={() => setNotif('')} />
      <Notification open={!!error} message={error} severity="error" onClose={() => setError('')} />
    </div>
  );
}

export default RoleManagement; 