import React, { useState } from 'react';
import { Box, Button, TextField, Typography, CircularProgress } from '@mui/material';
import { Formik, Form, Field } from 'formik';
import * as Yup from 'yup';
import Notification from '../components/Layout/Notification';
import api from '../utils/api';
import { useSearchParams, useNavigate } from 'react-router-dom';

const ResetSchema = Yup.object().shape({
  newPassword: Yup.string().min(6, 'Too Short!').required('Required'),
});

function ResetPasswordPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [notif, setNotif] = useState('');
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const email = params.get('email');
  const token = params.get('token');

  return (
    <div className="max-w-md mx-auto p-5 bg-white rounded-lg shadow-md">
      <h1 className="text-3xl font-bold mb-5">Reset Password</h1>
      <Formik
        initialValues={{ newPassword: '' }}
        validationSchema={ResetSchema}
        onSubmit={async (values) => {
          setLoading(true); setError('');
          try {
            await api.post('/auth/reset-password', { email, token, ...values });
            setNotif('Password reset successful!');
            setTimeout(() => navigate('/login'), 2000);
          } catch (err) {
            setError(err.message);
          } finally {
            setLoading(false);
          }
        }}
      >
        {({ errors, touched }) => (
          <Form>
            <Field as={TextField} name="newPassword" label="New Password" type="password" fullWidth margin="normal" error={!!errors.newPassword && touched.newPassword} helperText={touched.newPassword && errors.newPassword} />
            <Button type="submit" variant="contained" color="primary" fullWidth disabled={loading} sx={{ mt: 2 }}>
              {loading ? <CircularProgress size={24} /> : 'Reset Password'}
            </Button>
          </Form>
        )}
      </Formik>
      <Notification open={!!error} message={error} severity="error" onClose={() => setError('')} />
      <Notification open={!!notif} message={notif} severity="success" onClose={() => setNotif('')} />
    </div>
  );
}

export default ResetPasswordPage; 