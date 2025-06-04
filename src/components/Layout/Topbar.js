import React, { useContext, useRef, useState } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { Menu, MenuItem, IconButton, Avatar } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import MenuIcon from '@mui/icons-material/Menu';

function Topbar({ setSidebarOpen }) {
  const { user, logout } = useContext(AuthContext);
  const [anchorEl, setAnchorEl] = useState(null);
  const fileInputRef = useRef();
  const navigate = useNavigate();
  if (!user) return null;

  // Placeholder for profile picture logic
  const profilePic = user.profilePicUrl || null;

  const handleMenuOpen = (e) => setAnchorEl(e.currentTarget);
  const handleMenuClose = () => setAnchorEl(null);
  const handleProfile = () => { handleMenuClose(); navigate('/profile'); };
  const handleUploadClick = () => { handleMenuClose(); fileInputRef.current.click(); };
  const handleFileChange = (e) => {
    // TODO: Implement upload logic
    handleMenuClose();
  };

  return (
    <header className="w-full h-16 flex items-center justify-between px-4 md:px-8 bg-surface border-b border-gray-200 font-inter">
      {/* Mobile: Hamburger, App Name, Profile Logo */}
      <div className="md:hidden flex items-center w-full justify-between">
        <IconButton onClick={() => setSidebarOpen(true)} size="large" className="mr-2">
          <MenuIcon />
        </IconButton>
        <span className="text-xl font-bold text-primary flex-1 text-center">Ethical</span>
        <IconButton onClick={handleMenuOpen} size="large">
          {profilePic ? (
            <Avatar src={profilePic} alt={user.name} />
          ) : (
            <div className="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center font-bold text-lg">
              {user.name ? user.name[0].toUpperCase() : '?'}
            </div>
          )}
        </IconButton>
        <Menu anchorEl={anchorEl} open={!!anchorEl} onClose={handleMenuClose} anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }} transformOrigin={{ vertical: 'top', horizontal: 'right' }}>
          <MenuItem onClick={handleProfile}>View Profile</MenuItem>
          <MenuItem onClick={handleUploadClick}>Upload Picture</MenuItem>
          <MenuItem onClick={logout}>Logout</MenuItem>
        </Menu>
        <input type="file" accept="image/*" ref={fileInputRef} style={{ display: 'none' }} onChange={handleFileChange} />
      </div>
      {/* Desktop: Profile info and logout */}
      <div className="hidden md:flex items-center gap-4 w-full justify-end">
        <div className="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center font-bold text-lg">
          {user.name ? user.name[0].toUpperCase() : '?'}
        </div>
        <div className="text-right">
          <div className="font-semibold text-gray-800">{user.name}</div>
          <div className="text-xs text-muted">{user.role || `Level ${user.roleLevel}`}</div>
        </div>
        <button onClick={logout} className="ml-4 button-primary px-3 py-1 text-sm">Logout</button>
      </div>
    </header>
  );
}

export default Topbar; 