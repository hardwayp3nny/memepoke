import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';

const GAME_LIST = [
  { key: 'blackjack', label: 'Blackjack', path: '/blackjack' },
];

function Layout({ children }) {
  const location = useLocation();
  const wallet = useWallet();
  
  return (
    <div className="layout-container" style={{ padding: 0, margin: 0, width: '100%', minHeight: '100vh', overflowX: 'hidden' }}>
      {/* Top Navbar */}
      <div className="navbar">
        <div className="navbar-logo" style={{ display: 'flex', alignItems: 'center', height: '40px' }}>
          <Link to="/">
            <img src="/image/logo.png" alt="logo" style={{ height: '40px', width: 'auto', marginRight: '1rem' }} />
          </Link>
        </div>
        <div className="ml-4" style={{ display: 'flex', alignItems: 'center' }}>
          <WalletMultiButton className="wallet-adapter-button-navbar" />
        </div>
      </div>

      {/* Main Content Area */}
      <div className="content-container">
        {/* Left Panel */}
        <div className="panel panel-left" style={{ width: 180}}>
          <h2 className="panel-title">Game List</h2>
          <div className="space-y-2">
            {GAME_LIST.map(game => (
              <Link 
                key={game.key}
                to={game.path}
                className={`panel-item${location.pathname === game.path ? ' selected' : ''}`}
                style={{ 
                  cursor: 'pointer', 
                  fontWeight: location.pathname === game.path ? 'bold' : 'normal', 
                  background: location.pathname === game.path ? '#2563eb' : undefined, 
                  color: location.pathname === game.path ? '#fff' : undefined,
                  display: 'block',
                  textDecoration: 'none'
                }}
              >
                {game.label}
              </Link>
            ))}
          </div>
        </div>

        {/* Center Panel */}
        <div className="panel panel-center" style={{ width: '79%'}}>
          {children}
        </div>
      </div>
    </div>
  );
}

export default Layout; 