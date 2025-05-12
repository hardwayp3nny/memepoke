import React, { useState } from 'react';
import './styles/main.css';
import PokerGame from './components/PokerGame';
import Blackjack from './components/Blackjack';

const GAME_LIST = [
  { key: 'blackjack', label: 'Blackjack' },
];

function App() {
  const [selectedGame, setSelectedGame] = useState('blackjack');
  const [isWalletConnected, setIsWalletConnected] = useState(false);
  const [walletAddress, setWalletAddress] = useState('');

  const connectWallet = async () => {
    try {
      if (window.solana && window.solana.isPhantom) {
        const response = await window.solana.connect();
        setWalletAddress(response.publicKey.toString());
        setIsWalletConnected(true);
      } else {
        window.open('https://phantom.app/', '_blank');
      }
    } catch (error) {
      console.error('连接钱包失败:', error);
    }
  };

  const disconnectWallet = async () => {
    try {
      await window.solana.disconnect();
      setWalletAddress('');
      setIsWalletConnected(false);
    } catch (error) {
      console.error('断开钱包连接失败:', error);
    }
  };

  return (
    <div className="layout-container" style={{width: '100%', minHeight: '100vh', overflowX: 'hidden' }}>
      {/* Top Navbar */}
      <div className="navbar">
        <div className="navbar-logo" style={{ display: 'flex', alignItems: 'center', height: '40px' }}>
          <img src="/image/logo.png" alt="logo" style={{ height: '40px', width: 'auto', marginRight: '1rem' }} />
        </div>
        <div className="ml-4">
          <div className="avatar">
            <span className="text-xl">👤</span>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="content-container">
        {/* Left Panel */}
        <div className="panel panel-left" style={{ width: 180}}>
          <h2 className="panel-title">Game List</h2>
          <div className="space-y-2">
            {GAME_LIST.map(game => (
              <div
                key={game.key}
                className={`panel-item${selectedGame === game.key ? ' selected' : ''}`}
                style={{ cursor: 'pointer', fontWeight: selectedGame === game.key ? 'bold' : 'normal', background: selectedGame === game.key ? '#2563eb' : undefined, color: selectedGame === game.key ? '#fff' : undefined }}
                onClick={() => setSelectedGame(game.key)}
              >
                {game.label}
              </div>
            ))}
          </div>
        </div>

        {/* Center Panel */}
        <div className="panel panel-center" style={{ width: '79%'}}>
          {selectedGame === 'blackjack' && <Blackjack />}
        </div>

        
      </div>
    </div>
  );
}

export default App; 