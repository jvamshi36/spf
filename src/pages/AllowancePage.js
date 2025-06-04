import React, { useEffect, useState, useContext } from 'react';
import { Box, Button, TextField, MenuItem, Typography, CircularProgress, Paper } from '@mui/material';
import { Formik, Form, Field } from 'formik';
import * as Yup from 'yup';
import api from './utils/api';
import Notification from '../components/Layout/Notification';
import { AuthContext } from '../context/AuthContext';

const CheckinSchema = Yup.object().shape({
  date: Yup.string().required('Required'),
  checkInTime: Yup.string().required('Required'),
});
const CheckoutSchema = Yup.object().shape({
  date: Yup.string().required('Required'),
  checkOutTime: Yup.string().required('Required'),
});
const TravelSchema = Yup.object().shape({
  date: Yup.string().required('Required'),
  routeId: Yup.string().required('Required'),
});

function AllowancePage() {
  const [routes, setRoutes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notif, setNotif] = useState('');
  const [error, setError] = useState('');
  const [todayCheckin, setTodayCheckin] = useState(null);
  const [recentClaims, setRecentClaims] = useState([]);
  const { user } = useContext(AuthContext);

  // Get current date and time in the correct format
  const now = new Date();
  const today = now.toISOString().slice(0, 10);
  const currentTime = now.toTimeString().slice(0, 5);

  // Get allowance conditions from user.allowanceRates
  const allowanceConditions = [
    { key: 'headquarter', label: 'Headquarter', rate: user?.allowanceRates?.headquarter || 0 },
    { key: 'exStation', label: 'Ex-Station', rate: user?.allowanceRates?.exStation || 0 },
    { key: 'outStation', label: 'Out-Station', rate: user?.allowanceRates?.outStation || 0 },
  ];
  const travelPerKm = user?.allowanceRates?.travelPerKm || 0;

  // Fetch all assigned route objects for dropdown
  const [allRoutes, setAllRoutes] = useState([]);
  useEffect(() => {
    const fetchRoutes = async () => {
      try {
        const res = await api.get('/routes');
        setAllRoutes(res.data);
      } catch {}
    };
    fetchRoutes();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const user = JSON.parse(localStorage.getItem('user'));
      setRoutes(user.assignedRoutes || []);
      // Fetch today's check-in and recent claims
      const history = await api.get(`/users/${user.id}/history`);
      setTodayCheckin(history.data.checkins.find(c => c.date.slice(0, 10) === today));
      setRecentClaims(history.data.claims.slice(-5).reverse());
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  return (
    <div className="p-4 sm:p-6 md:p-8 bg-background min-h-screen font-inter">
      <h1 className="text-2xl md:text-3xl font-bold mb-8 text-primary">Allowances</h1>
      {loading ? <CircularProgress /> : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-md p-4 space-y-2">
              <Typography variant="h6" className="font-semibold text-lg mb-2 text-primary">Today's Status</Typography>
              {todayCheckin ? (
                <>
                  <div>Check-in: {todayCheckin.checkInTime ? new Date(todayCheckin.checkInTime).toLocaleTimeString() : '—'}</div>
                  <div>Check-out: {todayCheckin.checkOutTime ? new Date(todayCheckin.checkOutTime).toLocaleTimeString() : '—'}</div>
                  <div>Allowance: {todayCheckin.allowanceAmount}</div>
                </>
              ) : <div>No check-in today.</div>}
            </div>
            <div className="flex flex-col md:flex-row gap-6">
              {/* Daily Allowance Form: show if NOT checked in today */}
              {!todayCheckin && (
                <div className="bg-white rounded-xl shadow-md p-4 flex-1 space-y-4">
                  <Typography variant="h6" className="font-semibold text-lg mb-2 text-primary">Daily Check-In</Typography>
                  <Formik
                    initialValues={{ date: today, checkInTime: currentTime, condition: '' }}
                    enableReinitialize
                    validationSchema={Yup.object().shape({
                      date: Yup.string().required('Required'),
                      checkInTime: Yup.string().required('Required'),
                      condition: Yup.string().required('Select a condition'),
                    })}
                    onSubmit={async (values, { setSubmitting }) => {
                      try {
                        await api.post('/allowances/checkin', { ...values, inputs: {} });
                        setNotif('Checked in!');
                        fetchData();
                      } catch (err) { setError(err.message); }
                      setSubmitting(false);
                    }}
                  >
                    {({ errors, touched, isSubmitting, values, setFieldValue }) => (
                      <Form className="space-y-4">
                        <Field as={TextField} name="date" label="Date" type="date" className="input" InputLabelProps={{ shrink: true }} value={today} disabled />
                        <Field as={TextField} name="checkInTime" label="Check-In Time" type="time" className="input" InputLabelProps={{ shrink: true }} value={currentTime} disabled error={!!errors.checkInTime && touched.checkInTime} helperText={touched.checkInTime && errors.checkInTime} />
                        <TextField
                          select
                          name="condition"
                          label="Allowance Condition"
                          value={values.condition}
                          onChange={e => setFieldValue('condition', e.target.value)}
                          className="input"
                          error={!!errors.condition && touched.condition}
                          helperText={touched.condition && errors.condition}
                        >
                          {allowanceConditions.map(cond => (
                            <MenuItem key={cond.key} value={cond.key}>
                              {cond.label} (₹{cond.rate})
                            </MenuItem>
                          ))}
                        </TextField>
                        <button type="submit" className="button-primary w-full" disabled={isSubmitting}>Check In</button>
                      </Form>
                    )}
                  </Formik>
                </div>
              )}
              {/* Daily Check-Out Form: show if checked in but not checked out */}
              {todayCheckin && todayCheckin.checkInTime && !todayCheckin.checkOutTime && (
                <div className="bg-white rounded-xl shadow-md p-4 flex-1 space-y-4">
                  <Typography variant="h6" className="font-semibold text-lg mb-2 text-primary">Daily Check-Out</Typography>
                  <Formik
                    initialValues={{ date: today, checkOutTime: currentTime }}
                    enableReinitialize
                    validationSchema={CheckoutSchema}
                    onSubmit={async (values, { setSubmitting }) => {
                      try {
                        await api.post('/allowances/checkout', values);
                        setNotif('Checked out!');
                        fetchData();
                      } catch (err) { setError(err.message); }
                      setSubmitting(false);
                    }}
                  >
                    {({ errors, touched, isSubmitting }) => (
                      <Form className="space-y-4">
                        <Field as={TextField} name="date" label="Date" type="date" className="input" InputLabelProps={{ shrink: true }} value={today} disabled />
                        <Field as={TextField} name="checkOutTime" label="Check-Out Time" type="time" className="input" InputLabelProps={{ shrink: true }} value={currentTime} disabled error={!!errors.checkOutTime && touched.checkOutTime} helperText={touched.checkOutTime && errors.checkOutTime} />
                        <button type="submit" className="button-primary w-full" disabled={isSubmitting}>Check Out</button>
                      </Form>
                    )}
                  </Formik>
                </div>
              )}
              {/* Travel Allowance Form: always visible */}
              <div className="bg-white rounded-xl shadow-md p-4 flex-1 space-y-4">
                <Typography variant="h6" className="font-semibold text-lg mb-2 text-primary">Travel Allowance Claim</Typography>
                {(!user?.assignedRoutes || user.assignedRoutes.length === 0) ? (
                  <div className="text-gray-500">No routes assigned to you. Please contact admin.</div>
                ) : (
                <Formik
                  initialValues={{ date: today, routeId: '', stationType: '' }}
                  validationSchema={Yup.object().shape({
                    date: Yup.string().required('Required'),
                    routeId: Yup.string().required('Required'),
                    stationType: Yup.string().required('Select station type'),
                  })}
                  onSubmit={async (values, { setSubmitting }) => {
                    try {
                      await api.post('/allowances/travel-claim', values);
                      setNotif('Travel claim submitted!');
                      fetchData();
                    } catch (err) { setError(err.message); }
                    setSubmitting(false);
                  }}
                >
                  {({ errors, touched, isSubmitting, values, setFieldValue }) => {
                    // Support assignedRoutes as array of objects or IDs
                    const assignedRouteIds = (user?.assignedRoutes || []).map(r => (typeof r === 'string' ? r : r.id || r._id));
                    const assignedRouteObjs = allRoutes.filter(route => assignedRouteIds.includes(route._id));
                    const selectedRoute = allRoutes.find(r => r._id === values.routeId);
                    const amount = selectedRoute ? (selectedRoute.distance * travelPerKm) : 0;
                    return (
                      <Form className="space-y-4">
                        <Field as={TextField} name="date" label="Date" type="date" className="input" InputLabelProps={{ shrink: true }} />
                        <TextField
                          select
                          name="stationType"
                          label="Station Type"
                          value={values.stationType}
                          onChange={e => setFieldValue('stationType', e.target.value)}
                          className="input"
                          error={!!errors.stationType && touched.stationType}
                          helperText={touched.stationType && errors.stationType}
                        >
                          <MenuItem value="headquarter">Headquarter</MenuItem>
                          <MenuItem value="exStation">Ex-Station</MenuItem>
                          <MenuItem value="outStation">Out-Station</MenuItem>
                        </TextField>
                        <TextField
                          select
                          name="routeId"
                          label="Route"
                          value={values.routeId}
                          onChange={e => setFieldValue('routeId', e.target.value)}
                          className="input"
                          error={!!errors.routeId && touched.routeId}
                          helperText={touched.routeId && errors.routeId}
                        >
                          {assignedRouteObjs.length === 0 ? (
                            <MenuItem value="" disabled>No routes available</MenuItem>
                          ) : (
                            assignedRouteObjs.map(route => (
                              <MenuItem key={route._id} value={route._id}>
                                {route.headquarter} - {route.from} - {route.to} ({route.distance} km)
                              </MenuItem>
                            ))
                          )}
                        </TextField>

                        {selectedRoute && (
                          <div className="mb-2 text-primary font-medium space-y-1">
                            <div>Distance: <span className="font-bold">{selectedRoute.distance} km</span></div>
                            <div>Rate per km: <span className="font-bold">₹{travelPerKm}</span></div>
                            <div>Total Travel Allowance: <span className="font-bold">₹{amount}</span></div>
                          </div>
                        )}
                        <button type="submit" className="button-primary w-full" disabled={isSubmitting || assignedRouteObjs.length === 0}>Claim Travel</button>
                      </Form>
                    );
                  }}
                </Formik>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
      <Notification open={!!notif} message={notif} severity="success" onClose={() => setNotif('')} />
      <Notification open={!!error} message={error} severity="error" onClose={() => setError('')} />
    </div>
  );
}

export default AllowancePage; 