import React, { useState } from 'react';

// 生成52张牌的文件名
const suits = ['S', 'H', 'D', 'C'];
const ranks = ['A', '2', '3', '4', '5', '6', '7', '8', '9', 'T', 'J', 'Q', 'K'];
const generateDeck = () => {
  const deck = [];
  for (let r = 0; r < ranks.length; r++) {
    for (let s = 0; s < suits.length; s++) {
      deck.push(`${ranks[r]}${suits[s]}`);
    }
  }
  return deck;
};

// 随机洗牌
const shuffle = (array) => {
  const arr = array.slice();
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
};

function PokerGame() {
  // 初始化玩家和发牌
  const initPlayers = () => {
    const deck = shuffle(generateDeck());
    const players = [];
    for (let i = 0; i < 5; i++) {
      // 每人3张明牌
      const openCards = deck.splice(0, 3);
      // 2张背面牌
      const backCards = Array(2).fill('back');
      players.push({
        name: `Player ${i + 1}`,
        chips: 1000,
        cards: [...openCards, ...backCards],
        isCurrentPlayer: i === 0
      });
    }
    return players;
  };

  const [gameState, setGameState] = useState({
    players: initPlayers(),
    communityCards: [],
    pot: 0,
    currentBet: 0,
    dealer: null,
    currentPlayer: 0,
    phase: 'waiting' // waiting, preflop, flop, turn, river, showdown
  });

  return (
    <div className="poker-game">
      <div className="game-header">
        <h2 className="panel-title">Texas Hold'em</h2>
        <div className="game-info">
          <span>Pot: ${gameState.pot}</span>
          <span>Current Bet: ${gameState.currentBet}</span>
        </div>
      </div>

      {/* Community Cards */}
      <div className="community-cards">
        <h3>Community Cards</h3>
        <div className="cards-container">
          {gameState.communityCards.length === 0
            ? Array.from({ length: 5 }).map((_, index) => (
                <img
                  key={index}
                  src="image/poker/back.png"
                  alt="card back"
                  className="card"
                  style={{ width: '60px', height: '90px', marginRight: '8px', display: 'inline-block' }}
                />
              ))
            : gameState.communityCards.map((card, index) => (
                <div key={index} className="card">
                  {card}
                </div>
              ))}
        </div>
      </div>

      {/* Players Area */}
      <div className="players-area">
        {gameState.players.map((player, index) => (
          <div key={index} className={`player ${player.isCurrentPlayer ? 'active' : ''}`}>
            <div className="player-info">
              <span className="player-name">{player.name.replace('玩家', 'Player ')}</span>
              <span className="player-chips">${player.chips}</span>
            </div>
            <div className="player-cards">
              {player.cards.map((card, cardIndex) => (
                card === 'back' ? (
                  <img
                    key={cardIndex}
                    src="image/poker/back.png"
                    alt="card back"
                    className="card"
                    style={{ width: '60px', height: '90px', marginRight: '4px', display: 'inline-block' }}
                  />
                ) : (
                  <img
                    key={cardIndex}
                    src={`image/poker/${card}.png`}
                    alt={card}
                    className="card"
                    style={{ width: '60px', height: '90px', marginRight: '4px', display: 'inline-block' }}
                  />
                )
              ))}
            </div>
            <div className="player-actions">
              {player.isCurrentPlayer && (
                <>
                  <button className="action-btn fold">Fold</button>
                  <button className="action-btn check">Check</button>
                  <button className="action-btn call">Call</button>
                  <button className="action-btn raise">Raise</button>
                </>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default PokerGame; 