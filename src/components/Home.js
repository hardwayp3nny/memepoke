import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';

function Home() {
  const wallet = useWallet();
  const [showRules, setShowRules] = useState(false);

  const toggleRules = () => {
    setShowRules(!showRules);
  };

  return (
    <div className="home-container">
      <div className="home-hero">
        <div className="logo-container">
          <img src="/image/logo_.png" alt="Meme Poker Logo" className="logo-image" />
        </div>
        <h1 className="home-title">Welcome to Meme Poker</h1>
        
        <div className="home-actions">
          {wallet.connected ? (
            <Link to="/blackjack" className="home-button primary">
              Play Blackjack
            </Link>
          ) : (
            <div className="home-wallet-section">
              <p>Connect your wallet to start playing</p>
              <WalletMultiButton className="wallet-adapter-button-home" />
            </div>
          )}
        </div>
        
        <div className="home-games">
          <div className="home-game-card">
            <h3>BLACKJACK</h3>
            <p>classic blackjack game, challenge the dealer to win</p>
            <div className="home-game-buttons">
              <Link to="/blackjack" className="home-button secondary">
                PLAY
              </Link>
              <button onClick={toggleRules} className="home-button rules">
                RULES
              </button>
            </div>
          </div>
          <div className="home-game-card">
            <h3>MORE GAMES IS COMING</h3>
          </div>
          <div className="home-game-card">
            <h3>MORE GAMES IS COMING</h3>
          </div>
          {/* 可以添加更多游戏卡片 */}
        </div>
      </div>
      
      {showRules && (
        <div className="rules-modal">
          <div className="rules-modal-content">
            <div className="rules-modal-header">
              <h2>Blackjack Rules</h2>
              <button onClick={toggleRules} className="close-button">&times;</button>
            </div>
            <div className="rules-modal-body">
              <h3>Objective</h3>
              <p>Get a hand value closer to 21 than the dealer without exceeding 21.</p>
              
              <h3>Card Values</h3>
              <ul>
                <li>Cards 2-10 are worth their face value</li>
                <li>Face cards (J, Q, K) are worth 10 points</li>
                <li>Aces can be worth either 1 or 11 points</li>
              </ul>
              
              <h3>Basic Gameplay</h3>
              <ul>
                <li>Both player and dealer receive two cards</li>
                <li>Player's cards are face up, dealer has one card face up and one face down</li>
                <li>Players can "hit" for more cards or "stand" to keep their current hand</li>
                <li>If you exceed 21, you "bust" and lose automatically</li>
                <li>Dealer must hit on 16 or less and stand on 17 or more</li>
              </ul>
              
              <h3>Special Rules</h3>
              <ul>
                <li>Blackjack (A + 10/J/Q/K) pays 3:2</li>
                <li>Double Down: Double your bet and receive exactly one more card</li>
                <li>Split: Divide matching cards into two separate hands</li>
              </ul>
            </div>
          </div>
        </div>
      )}
      
      <style jsx>{`
        .home-container {
          padding: 2rem;
        }
        .home-hero {
          text-align: center;
          margin-bottom: 3rem;
        }
        .home-title {
          font-size: 2.5rem;
          margin-top: -0.5rem;
          margin-bottom: 1rem;
          color: #fff;
        }
        .home-subtitle {
          font-size: 1.2rem;
          color: #9ca3af;
          margin-bottom: 2rem;
        }
        .home-actions {
          margin-bottom: 3rem;
        }
        .home-button {
          display: inline-block;
          padding: 0.75rem 1.5rem;
          border-radius: 0.5rem;
          text-decoration: none;
          font-weight: bold;
          transition: all 0.2s;
          border: none;
          cursor: pointer;
        }
        .home-button.primary {
          background: #4ade80;
          color: #111827;
        }
        .home-button.primary:hover {
          background: #22c55e;
        }
        .home-button.secondary {
          background: #3b82f6;
          color: #fff;
          margin-right: 0.5rem;
        }
        .home-button.secondary:hover {
          background: #2563eb;
        }
        .home-button.rules {
          background: #8b5cf6;
          color: #fff;
        }
        .home-button.rules:hover {
          background: #7c3aed;
        }
        .home-games {
          display: flex;
          justify-content: center;
          gap: 2rem;
        }
        .home-game-card {
          background: rgba(15, 23, 42, 0.6);
          backdrop-filter: blur(10px);
          -webkit-backdrop-filter: blur(10px);
          border-radius: 1rem;
          padding: 1.5rem;
          width: 280px;
          text-align: center;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
          border: 1px solid rgba(255, 255, 255, 0.1);
          transition: transform 0.3s ease, box-shadow 0.3s ease;
        }
        .home-game-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 8px 30px rgba(0, 0, 0, 0.4);
        }
        .home-game-buttons {
          display: flex;
          justify-content: center;
        }
        .home-game-image {
          width: 100%;
          height: 160px;
          object-fit: cover;
          border-radius: 0.5rem;
          margin-bottom: 1rem;
        }
        .home-wallet-section {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 1rem;
        }
        .wallet-adapter-button-home {
          background-color: #4ade80 !important;
        }
        .rules-modal {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-color: rgba(0, 0, 0, 0.7);
          display: flex;
          justify-content: center;
          align-items: center;
          z-index: 1000;
        }
        .rules-modal-content {
          background: rgba(30, 41, 59, 0.95);
          border-radius: 1rem;
          width: 80%;
          max-width: 600px;
          max-height: 80vh;
          overflow-y: auto;
          color: #fff;
        }
        .rules-modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1rem 1.5rem;
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        }
        .rules-modal-header h2 {
          margin: 0;
          color: #4ade80;
        }
        .close-button {
          background: transparent;
          border: none;
          color: #fff;
          font-size: 1.5rem;
          cursor: pointer;
        }
        .rules-modal-body {
          padding: 1.5rem;
          text-align: left;
        }
        .rules-modal-body h3 {
          color: #3b82f6;
          margin-top: 1rem;
          margin-bottom: 0.5rem;
        }
        .rules-modal-body p, .rules-modal-body ul {
          margin-top: 0.5rem;
        }
        .rules-modal-body ul {
          padding-left: 1.5rem;
        }
        .logo-container {
          display: flex;
          justify-content: center;
          margin-bottom: 0rem;
        }
        .logo-image {
          max-width: 200px;
          height: auto;
        }
      `}</style>
    </div>
  );
}

export default Home; 