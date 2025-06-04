import React, { useContext, useState } from 'react';
import { AuthContext } from '../context/AuthContext';
import { TextField } from '@mui/material';
import { Formik, Form, Field } from 'formik';
import * as Yup from 'yup';
import Notification from '../components/Layout/Notification';
import { Link, useNavigate } from 'react-router-dom';
import api from './utils/api';

const LoginSchema = Yup.object().shape({
  email: Yup.string().email('Invalid email').required('Required'),
  password: Yup.string().min(6, 'Too Short!').required('Required'),
});

function LoginPage() {
  const { login } = useContext(AuthContext);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [notif, setNotif] = useState('');
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center bg-background font-inter px-2">
      <div className="w-full max-w-md bg-white rounded-xl shadow-md p-4 sm:p-8 space-y-6">
        <h1 className="text-2xl md:text-3xl font-bold text-primary text-center">Login</h1>
        <Formik
          initialValues={{ email: '', password: '' }}
          validationSchema={LoginSchema}
          onSubmit={async (values) => {
            setLoading(true); setError('');
            try {
              const res = await api.post('/auth/login', values);
              login(res.data);
            } catch (err) {
              setError(err.message);
            } finally {
              setLoading(false);
            }
          }}
        >
          {({ errors, touched }) => (
            <Form className="space-y-4">
              <Field as={TextField} name="email" label="Email" className="input" error={!!errors.email && touched.email} helperText={touched.email && errors.email} fullWidth margin="normal" inputProps={{ className: 'text-base md:text-lg' }} />
              <Field as={TextField} name="password" label="Password" type="password" className="input" error={!!errors.password && touched.password} helperText={touched.password && errors.password} fullWidth margin="normal" inputProps={{ className: 'text-base md:text-lg' }} />
              <button type="submit" className="w-full py-2 px-4 rounded-lg bg-primary text-white font-semibold shadow-md hover:bg-primary/90 transition min-h-[44px] text-base md:text-lg" disabled={loading}>
                {loading ? 'Loading...' : 'Login'}
              </button>
              <Link to="/forgot-password" className="block text-sm text-primary text-center mt-2 hover:underline">
                Forgot password?
              </Link>
            </Form>
          )}
        </Formik>
        <Notification open={!!error} message={error} severity="error" onClose={() => setError('')} />
        <Notification open={!!notif} message={notif} severity="success" onClose={() => setNotif('')} />
      </div>
    </div>
  );
}

export default LoginPage; 