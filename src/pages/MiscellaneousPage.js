import React, { useState } from 'react';
import { Box, Button, TextField, Typography, Card, CircularProgress } from '@mui/material';
import { Formik, Form, Field } from 'formik';
import * as Yup from 'yup';
import Notification from '../components/Layout/Notification';
import api from './utils/api';

const MiscSchema = Yup.object().shape({
  date: Yup.string().required('Required'),
  name: Yup.string().required('Required'),
  price: Yup.number().min(1, 'Must be positive').required('Required'),
  attachment: Yup.mixed().required('Proof is required'),
});

function MiscellaneousPage() {
  const [notif, setNotif] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  return (
    <div className="p-4 sm:p-6 md:p-8 bg-background min-h-screen font-inter">
      <h1 className="text-2xl md:text-3xl font-bold mb-8 text-primary">Miscellaneous Claim</h1>
      <Card className="max-w-lg mx-auto p-4 sm:p-8 shadow-lg border border-gray-200 bg-white rounded-xl">
        <Formik
          initialValues={{ date: '', name: '', price: '', attachment: null }}
          validationSchema={MiscSchema}
          onSubmit={async (values, { setSubmitting, resetForm }) => {
            setLoading(true);
            try {
              const formData = new FormData();
              formData.append('date', values.date);
              formData.append('name', values.name);
              formData.append('price', values.price);
              formData.append('attachment', values.attachment);
              await api.post('/miscellaneous', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
              });
              setNotif('Miscellaneous claim submitted!');
              resetForm();
            } catch (err) {
              setError(err?.response?.data?.message || 'Failed to submit claim.');
            } finally {
              setLoading(false);
              setSubmitting(false);
            }
          }}
        >
          {({ errors, touched, isSubmitting, setFieldValue, values }) => (
            <Form className="space-y-5">
              <Field as={TextField} name="date" label="Date" type="date" fullWidth InputLabelProps={{ shrink: true }} error={!!errors.date && touched.date} helperText={touched.date && errors.date} />
              <Field as={TextField} name="name" label="Miscellaneous Name" fullWidth error={!!errors.name && touched.name} helperText={touched.name && errors.name} />
              <Field as={TextField} name="price" label="Price" type="number" fullWidth error={!!errors.price && touched.price} helperText={touched.price && errors.price} />
              <div>
                <label className="block text-sm font-medium mb-1 text-gray-700">Attachment (Proof)</label>
                <input
                  id="attachment"
                  name="attachment"
                  type="file"
                  accept="image/*,application/pdf"
                  onChange={event => setFieldValue('attachment', event.currentTarget.files[0])}
                  className="input w-full"
                />
                {errors.attachment && touched.attachment && (
                  <div className="text-red-500 text-sm mt-1">{errors.attachment}</div>
                )}
              </div>
              <Button type="submit" variant="contained" color="primary" fullWidth className="button-primary" disabled={isSubmitting || loading} style={{ height: 48, fontWeight: 600, fontSize: '1rem' }}>
                {loading ? <CircularProgress size={24} /> : 'Submit Claim'}
              </Button>
            </Form>
          )}
        </Formik>
      </Card>
      <Notification open={!!notif} message={notif} severity="success" onClose={() => setNotif('')} />
      <Notification open={!!error} message={error} severity="error" onClose={() => setError('')} />
    </div>
  );
}

export default MiscellaneousPage; 