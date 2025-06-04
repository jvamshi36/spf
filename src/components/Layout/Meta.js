import React from 'react';
import { Helmet } from 'react-helmet';

export default function Meta({ title, description }) {
  return (
    <Helmet>
      <title>{title || 'Ethical - Allowance Management'}</title>
      <meta name="description" content={description || 'Manage daily and travel allowances efficiently.'} />
      <meta name="robots" content="index, follow" />
      <meta property="og:title" content={title || 'Ethical - Allowance Management'} />
      <meta property="og:description" content={description || 'Manage daily and travel allowances efficiently.'} />
    </Helmet>
  );
} 