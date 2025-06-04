import React, { useRef, useState } from 'react';

function SettingsPage() {
  // Demo state for org info
  const [orgName, setOrgName] = useState('Ethical Inc.');
  const [logo, setLogo] = useState(null);
  const logoInput = useRef();

  // Demo state for notifications
  const [emailNotif, setEmailNotif] = useState(true);
  const [smsNotif, setSmsNotif] = useState(false);

  // Demo state for API keys
  const [apiKeys, setApiKeys] = useState([
    { id: 1, key: 'sk_test_1234567890' },
    { id: 2, key: 'sk_live_0987654321' },
  ]);
  const [newKey, setNewKey] = useState('');

  // Handlers
  const handleLogoChange = e => {
    if (e.target.files && e.target.files[0]) {
      setLogo(URL.createObjectURL(e.target.files[0]));
    }
  };
  const handleAddKey = () => {
    if (!newKey) return;
    setApiKeys([...apiKeys, { id: Date.now(), key: newKey }]);
    setNewKey('');
  };
  const handleDeleteKey = id => setApiKeys(apiKeys.filter(k => k.id !== id));

  return (
    <div className="p-6 bg-background min-h-screen font-inter">
      <h1 className="text-3xl font-bold mb-8 text-primary">System Settings</h1>
      {/* Organization Info */}
      <div className="card mb-8">
        <h2 className="text-xl font-semibold mb-4">Organization Info</h2>
        <div className="flex items-center gap-4 mb-4">
          <input
            className="input flex-1"
            value={orgName}
            onChange={e => setOrgName(e.target.value)}
            placeholder="Organization Name"
          />
          <input
            type="file"
            accept="image/*"
            className="hidden"
            ref={logoInput}
            onChange={handleLogoChange}
          />
          <button className="button-primary" onClick={() => logoInput.current.click()}>Upload Logo</button>
          {logo && <img src={logo} alt="Logo" className="h-12 w-12 rounded-full object-cover border ml-2" />}
        </div>
      </div>
      {/* JWT Secret */}
      <div className="card mb-8">
        <h2 className="text-xl font-semibold mb-4">JWT Secret</h2>
        <button className="button-primary">Refresh JWT Secret</button>
      </div>
      {/* Notifications */}
      <div className="card mb-8">
        <h2 className="text-xl font-semibold mb-4">Notifications</h2>
        <div className="flex items-center gap-6">
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={emailNotif} onChange={e => setEmailNotif(e.target.checked)} />
            <span>Email Notifications</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={smsNotif} onChange={e => setSmsNotif(e.target.checked)} />
            <span>SMS Notifications</span>
          </label>
        </div>
      </div>
      {/* API Keys */}
      <div className="card">
        <h2 className="text-xl font-semibold mb-4">API Keys</h2>
        <div className="mb-4 flex gap-2">
          <input
            className="input flex-1"
            placeholder="New API Key"
            value={newKey}
            onChange={e => setNewKey(e.target.value)}
          />
          <button className="button-primary" onClick={handleAddKey}>Add</button>
        </div>
        <ul className="divide-y divide-gray-100">
          {apiKeys.map(k => (
            <li key={k.id} className="py-2 flex justify-between items-center text-sm">
              <span className="font-mono">{k.key}</span>
              <button className="button-primary bg-red-500 hover:bg-red-600 px-2 py-1 text-xs" onClick={() => handleDeleteKey(k.id)}>Delete</button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default SettingsPage; 