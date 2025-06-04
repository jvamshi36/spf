import React, { useState } from 'react';
import { Box, Button, TextField, Typography, CircularProgress } from '@mui/material';
import { Formik, Form, Field } from 'formik';
import * as Yup from 'yup';
import Notification from '../components/Layout/Notification';
import api from '../utils/api';

const ForgotSchema = Yup.object().shape({
  email: Yup.string().email('Invalid email').required('Required'),
});

function ForgotPasswordPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [notif, setNotif] = useState('');

  return (
    <div className="max-w-md mx-auto p-5 bg-white rounded-lg shadow-md">
      <h1 className="text-3xl font-bold mb-5">Forgot Password</h1>
      <Formik
        initialValues={{ email: '' }}
        validationSchema={ForgotSchema}
        onSubmit={async (values) => {
          setLoading(true); setError('');
          try {
            await api.post('/auth/forgot-password', values);
            setNotif('Password reset email sent!');
          } catch (err) {
            setError(err.message);
          } finally {
            setLoading(false);
          }
        }}
      >
        {({ errors, touched }) => (
          <Form>
            <Field as={TextField} name="email" label="Email" fullWidth margin="normal" error={!!errors.email && touched.email} helperText={touched.email && errors.email} />
            <Button type="submit" variant="contained" color="primary" fullWidth disabled={loading} sx={{ mt: 2 }}>
              {loading ? <CircularProgress size={24} /> : 'Send Reset Email'}
            </Button>
          </Form>
        )}
      </Formik>
      <Notification open={!!error} message={error} severity="error" onClose={() => setError('')} />
      <Notification open={!!notif} message={notif} severity="success" onClose={() => setNotif('')} />
    </div>
  );
}

export default ForgotPasswordPage; 