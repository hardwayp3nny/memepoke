import React, { useState } from 'react';

const dealers = [
  {
    avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=dealer1',
    nickname: 'Dealer Alice',
    bet: 500
  },
  {
    avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=dealer2',
    nickname: 'Dealer Bob',
    bet: 800
  },
  {
    avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=dealer3',
    nickname: 'Dealer Carol',
    bet: 1200
  },
  {
    avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=dealer6',
    nickname: 'Dealer Frank',
    bet: 700
  }
];

const pokerSuits = ['S', 'H', 'D', 'C'];
const pokerRanks = ['A', '2', '3', '4', '5', '6', '7', '8', '9', 'T', 'J', 'Q', 'K'];
const getPokerDeck = () => {
  const deck = [];
  for (let r of pokerRanks) {
    for (let s of pokerSuits) {
      deck.push(`${r}${s}`);
    }
  }
  return deck;
};

function getRandomCards(deck, n) {
  const copy = [...deck];
  const cards = [];
  for (let i = 0; i < n; i++) {
    const idx = Math.floor(Math.random() * copy.length);
    cards.push(copy.splice(idx, 1)[0]);
  }
  return [cards, copy];
}

// 按bet降序排列
const sortedDealers = [...dealers].sort((a, b) => b.bet - a.bet);
const totalBet = dealers.reduce((sum, d) => sum + d.bet, 0);

function getCardValue(card) {
  const rank = card[0];
  if (rank === 'A') return 11;
  if (['K', 'Q', 'J', 'T'].includes(rank)) return 10;
  return parseInt(rank, 10);
}
function calcPoints(cards) {
  let total = 0, aces = 0;
  for (let c of cards) {
    let v = getCardValue(c);
    total += v;
    if (c[0] === 'A') aces++;
  }
  while (total > 21 && aces > 0) {
    total -= 10;
    aces--;
  }
  return total;
}

function Blackjack() {
  const [showBetInput, setShowBetInput] = useState(false);
  const [bet, setBet] = useState('');
  const [playerCards, setPlayerCards] = useState([]);
  const [dealerCards, setDealerCards] = useState([]);
  const [deck, setDeck] = useState(getPokerDeck());
  const [gameStarted, setGameStarted] = useState(false);
  const [playerChips, setPlayerChips] = useState(0);
  const [tableChips, setTableChips] = useState([]);
  const [hasBet, setHasBet] = useState(false);
  const [centerTip, setCenterTip] = useState('');
  const [centerTipPulse, setCenterTipPulse] = useState(false);
  const [playerTurn, setPlayerTurn] = useState(false);
  const [gameResult, setGameResult] = useState('');
  const [playerStand, setPlayerStand] = useState(false);
  const [betEntry, setBetEntry] = useState(false);
  const [isDoubleMode, setIsDoubleMode] = useState(false);
  const [leftHandCards, setLeftHandCards] = useState([]);
  const [rightHandCards, setRightHandCards] = useState([]);
  const [leftHandStand, setLeftHandStand] = useState(false);
  const [rightHandStand, setRightHandStand] = useState(false);
  const [leftHandTurn, setLeftHandTurn] = useState(false);
  const [rightHandTurn, setRightHandTurn] = useState(false);
  const [dealerTotalBet, setDealerTotalBet] = useState(totalBet);
  const [showDepositModal, setShowDepositModal] = useState(false);
  const [dealerName, setDealerName] = useState('');
  const [dealerBet, setDealerBet] = useState('');
  const [dealerList, setDealerList] = useState(dealers);
  const [isWalletConnected, setIsWalletConnected] = useState(false);
  const [walletAddress, setWalletAddress] = useState('');

  // 连接钱包函数
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

  // 断开钱包连接函数
  const disconnectWallet = async () => {
    try {
      await window.solana.disconnect();
      setWalletAddress('');
      setIsWalletConnected(false);
    } catch (error) {
      console.error('断开钱包连接失败:', error);
    }
  };

  // 结算函数
  const handleSettlement = (result, isDoubleMode = false, handSide = '') => {
    // 计算当前桌上的筹码总额
    const currentBet = tableChips.reduce((sum, chip) => sum + chip.value, 0);
    const singleBet = currentBet / 2; // double模式下的单局赌注
    
    if (isDoubleMode) {
      if (result === 'win') {
        // 玩家获胜：从庄家金库拿取等额筹码，并返还桌上的筹码
        setPlayerChips(prev => prev + singleBet * 2); // 赢得庄家的筹码 + 返还自己的筹码
        setDealerTotalBet(prev => prev - singleBet); // 庄家金库减少
      } else if (result === 'lose') {
        // 庄家获胜：桌上的筹码划转到庄家金库
        setDealerTotalBet(prev => prev + singleBet); // 庄家金库增加
      } else if (result === 'push') {
        // 平局：返还桌上的筹码
        setPlayerChips(prev => prev + singleBet);
      }

      // 当两个子局都结束时，清空桌上的筹码
      if ((handSide === 'left' && !rightHandTurn) || (handSide === 'right' && !leftHandTurn)) {
        setTableChips([]);
      }
    } else {
      if (result === 'win') {
        // 玩家获胜：从庄家金库拿取等额筹码，并返还桌上的筹码
        setPlayerChips(prev => prev + currentBet * 2); // 赢得庄家的筹码 + 返还自己的筹码
        setDealerTotalBet(prev => prev - currentBet); // 庄家金库减少
        setTableChips([]); // 清空桌上的筹码
      } else if (result === 'lose') {
        // 庄家获胜：桌上的筹码划转到庄家金库
        setDealerTotalBet(prev => prev + currentBet); // 庄家金库增加
        setTableChips([]); // 清空桌上的筹码
      } else if (result === 'push') {
        // 平局：返还桌上的筹码
        setPlayerChips(prev => prev + currentBet);
        setTableChips([]); // 清空桌上的筹码
      }
    }
  };

  // 判断比赛结果
  const checkGameResult = (pCards, dCards, isInitialDeal = false, isStand = false, isDoubleMode = false, handSide = '') => {
    const playerPoint = calcPoints(pCards);
    const dealerPoint = isInitialDeal ? calcPoints([dCards[0]]) : calcPoints(dCards);

    // Double模式下的结果判定
    if (isDoubleMode) {
      if (playerPoint === 21 && dealerPoint === 21) {
        setGameResult(`${handSide}手牌平局！双方都是21点`);
        setCenterTip(`${handSide} Push! Both 21`);
        handleSettlement('push', true, handSide);
        if (handSide === 'left') {
          setLeftHandTurn(false);
        } else {
          setRightHandTurn(false);
        }
        return true;
      } else if (playerPoint === 21) {
        setGameResult(`${handSide}手牌Blackjack获胜！`);
        setCenterTip(`${handSide} Blackjack!`);
        handleSettlement('win', true, handSide);
        if (handSide === 'left') {
          setLeftHandTurn(false);
        } else {
          setRightHandTurn(false);
        }
        return true;
      } else if (dealerPoint === 21) {
        setGameResult(`${handSide}手牌庄家Blackjack获胜！`);
        setCenterTip(`${handSide} Dealer Blackjack!`);
        handleSettlement('lose', true, handSide);
        if (handSide === 'left') {
          setLeftHandTurn(false);
        } else {
          setRightHandTurn(false);
        }
        return true;
      } else if (playerPoint > 21) {
        setGameResult(`${handSide}手牌爆点，庄家获胜！`);
        setCenterTip(`${handSide} Bust! Dealer wins!`);
        handleSettlement('lose', true, handSide);
        if (handSide === 'left') {
          setLeftHandTurn(false);
        } else {
          setRightHandTurn(false);
        }
        return true;
      }

      // Double模式下的开牌结果判定
      if (isStand) {
        if (dealerPoint > 21) {
          setGameResult(`${handSide}手牌庄家爆点，玩家获胜！`);
          setCenterTip(`${handSide} Dealer bust! Player wins!`);
          handleSettlement('win', true, handSide);
        } else if (playerPoint > dealerPoint) {
          setGameResult(`${handSide}手牌玩家获胜！`);
          setCenterTip(`${handSide} Player wins!`);
          handleSettlement('win', true, handSide);
        } else if (playerPoint < dealerPoint) {
          setGameResult(`${handSide}手牌庄家获胜！`);
          setCenterTip(`${handSide} Dealer wins!`);
          handleSettlement('lose', true, handSide);
        } else {
          setGameResult(`${handSide}手牌平局！`);
          setCenterTip(`${handSide} Push!`);
          handleSettlement('push', true, handSide);
        }
        if (handSide === 'left') {
          setLeftHandTurn(false);
        } else {
          setRightHandTurn(false);
        }
        return true;
      }
      return false;
    }

    // 首次发牌时的特殊判断
    if (isInitialDeal) {
      if (playerPoint === 21 && dealerPoint === 21) {
        setGameResult('平局！双方都是21点');
        setCenterTip('Push! Both 21');
        handleSettlement('push');
        setPlayerTurn(false);
        setHasBet(false);
        return true;
      } else if (playerPoint === 21) {
        setGameResult('玩家Blackjack获胜！');
        setCenterTip('Player Blackjack!');
        handleSettlement('win');
        setPlayerTurn(false);
        setHasBet(false);
        return true;
      } else if (dealerPoint === 21) {
        setGameResult('庄家Blackjack获胜！');
        setCenterTip('Dealer Blackjack!');
        handleSettlement('lose');
        setPlayerTurn(false);
        setHasBet(false);
        return true;
      }
      return false;
    }

    // 开牌后的判断
    if (isStand) {
      if (dealerPoint > 21) {
        setGameResult('庄家爆点，玩家获胜！');
        setCenterTip('Dealer bust! Player wins!');
        handleSettlement('win');
      } else if (playerPoint > dealerPoint) {
        setGameResult('玩家获胜！');
        setCenterTip('Player wins!');
        handleSettlement('win');
      } else if (playerPoint < dealerPoint) {
        setGameResult('庄家获胜！');
        setCenterTip('Dealer wins!');
        handleSettlement('lose');
      } else {
        setGameResult('平局！');
        setCenterTip('Push!');
        handleSettlement('push');
      }
      setPlayerTurn(false);
      setHasBet(false);
      return true;
    }

    // 加牌后的判断
    if (playerPoint > 21 && dealerPoint > 21) {
      setGameResult('双方都爆点，平局！');
      setCenterTip('Both bust! Push!');
      handleSettlement('push');
      setPlayerTurn(false);
      setHasBet(false);
      return true;
    } else if (playerPoint > 21) {
      setGameResult('玩家爆点，庄家获胜！');
      setCenterTip('Player bust! Dealer wins!');
      handleSettlement('lose');
      setPlayerTurn(false);
      setHasBet(false);
      return true;
    } else if (dealerPoint > 21) {
      setGameResult('庄家爆点，玩家获胜！');
      setCenterTip('Dealer bust! Player wins!');
      handleSettlement('win');
      setPlayerTurn(false);
      setHasBet(false);
      return true;
    }
    return false;
  };

  // 进入游戏，显示下注提示
  const handleStart = () => {
    setShowBetInput(true);
    setHasBet(false);
    setCenterTip('place a bet');
    setCenterTipPulse(false);
    setPlayerCards([]);
    setDealerCards([]);
    setTableChips([]);
  };

  // 处理筹码点击
  const handleChipClick = (value, e) => {
    if (isDoubleMode) {
      if (!leftHandTurn && !rightHandTurn) {
        setPlayerTurn(false);
        setPlayerStand(false);
      }
    }
    // 如果玩家正在回合中，不允许下注
    if (playerTurn) return;
    
    if (playerChips >= value) {
      // 只在新一轮第一次下注时清空牌桌和结果
      if ((!playerTurn && !betEntry) || (isDoubleMode && !leftHandTurn && !rightHandTurn)) {
        setPlayerCards([]);
        setDealerCards([]);
        setGameResult('');
        setCenterTip('');
        setPlayerStand(false);
        setTableChips([]);
        setBetEntry(true);
        setIsDoubleMode(false);
        setLeftHandCards([]);
        setRightHandCards([]);
        setLeftHandStand(false);
        setRightHandStand(false);
        setLeftHandTurn(false);
        setRightHandTurn(false);
      }
      setPlayerChips(prev => prev - value);
      // 动画：获取点击位置和blackjack-table尺寸，计算起点和终点
      const chipSize = 30;
      const chipRadius = chipSize / 2;
      const chipRect = e.currentTarget.getBoundingClientRect();
      const chipCenter = {
        x: chipRect.left + chipRect.width / 2,
        y: chipRect.top + chipRect.height / 2
      };
      const tableEl = document.querySelector('.blackjack-table');
      const tableRect = tableEl.getBoundingClientRect();
      // 以table中央为原点，设定一个中央区域（60%宽高）
      const areaW = tableRect.width * 0.2;
      const areaH = tableRect.height * 0.2;
      const minX = -areaW / 2 + chipRadius;
      const maxX = areaW / 2 - chipRadius;
      const minY = -areaH / 2 + chipRadius;
      const maxY = areaH / 2 - chipRadius;
      // 随机终点（以table中心为原点）
      const centerX = Math.random() * (maxX - minX) + minX;
      const centerY = Math.random() * (maxY - minY) + minY;
      // 动画起点（相对于table中心）
      const startX = chipCenter.x - (tableRect.left + tableRect.width / 2);
      const startY = chipCenter.y - (tableRect.top + tableRect.height / 2);
      setTableChips(prev => [...prev, {
        id: Date.now(),
        value,
        position: { x: centerX, y: centerY },
        animation: { startX, startY, targetX: centerX, targetY: centerY }
      }]);
      setHasBet(true);
      setCenterTip('');
      setCenterTipPulse(false);
    }
  };

  // 发牌逻辑
  const handleDeal = () => {
    // 只有在未发牌且未下注时才需要下注
    if (!hasBet && playerCards.length === 0 && !playerTurn) {
      setCenterTip('Please place a bet!');
      setCenterTipPulse(false);
      setTimeout(() => setCenterTipPulse(true), 10);
      return;
    }
    // 首次发牌
    if (playerCards.length === 0 && hasBet && !playerTurn) {
      let d = getPokerDeck();
      let [pCards, d1] = getRandomCards(d, 2);
      let [dlCards, d2] = getRandomCards(d1, 2);
      setPlayerCards(pCards);
      setDealerCards(dlCards);
      setDeck(d2);
      setHasBet(true); // 本局下注后一直为true，直到本局结束
      setPlayerTurn(true);
      setPlayerStand(false);
      setGameResult('');
      setBetEntry(false);
      
      setTimeout(() => {
        checkGameResult(pCards, dlCards, true);
      }, 100);
    } else if (playerTurn && !playerStand) {
      // 玩家加牌
      if (deck.length < 1) return;
      let [playerCard, newDeck] = getRandomCards(deck, 1);
      const newPlayerCards = [...playerCards, ...playerCard];
      setPlayerCards(newPlayerCards);
      setDeck(newDeck);
      
      checkGameResult(newPlayerCards, dealerCards);
    }
  };

  // 玩家开牌（stand）
  const handleOpen = () => {
    if (!playerTurn || playerStand) return;
    setPlayerStand(true);
    // 庄家补牌到17点及以上
    let dCards = [...dealerCards];
    let d = [...deck];
    while (calcPoints(dCards) < 17 && d.length > 0) {
      let [newCard, newDeck] = getRandomCards(d, 1);
      dCards.push(newCard[0]);
      d = newDeck;
    }
    setDealerCards(dCards);
    setDeck(d);
    
    // 使用统一的比赛结果检测函数
    checkGameResult(playerCards, dCards, false, true);
  };

  // 处理加倍
  const handleDoubleDown = () => {
    // 判断是否可以加倍
    if (playerCards.length !== 2 || !playerTurn || getCardValue(playerCards[0]) !== getCardValue(playerCards[1])) return;
    
    // 扣除加倍的筹码
    setPlayerChips(prev => prev - tableChips[0].value);
    
    // 添加新的筹码到牌桌
    const lastChip = tableChips[tableChips.length - 1];
    setTableChips(prev => [...prev, {
      ...lastChip,
      id: Date.now(),
      position: {
        x: lastChip.position.x + 10,
        y: lastChip.position.y + 10
      }
    }]);

    // 进入double模式
    setIsDoubleMode(true);
    
    // 为两手牌各发一张牌
    if (deck.length < 2) return;
    let [leftCard, d1] = getRandomCards(deck, 1);
    let [rightCard, d2] = getRandomCards(d1, 1);
    
    // 设置左右手牌，包含原始牌和新发的牌
    setLeftHandCards([playerCards[0], ...leftCard]);
    setRightHandCards([playerCards[1], ...rightCard]);
    setPlayerCards([]);
    setDeck(d2);
    
    // 检查两手牌的结果
    setLeftHandTurn(true);
    setRightHandTurn(true);
    checkGameResult([playerCards[0], ...leftCard], dealerCards, false, false, true, 'left');
    checkGameResult([playerCards[1], ...rightCard], dealerCards, false, false, true, 'right');
  };

  // 处理左手牌的操作
  const handleLeftHandDeal = () => {
    if (!leftHandTurn || leftHandStand) return;
    if (deck.length < 1) return;
    let [newCard, newDeck] = getRandomCards(deck, 1);
    const newLeftCards = [...leftHandCards, ...newCard];
    setLeftHandCards(newLeftCards);
    setDeck(newDeck);
    checkGameResult(newLeftCards, dealerCards, false, false, true, 'left');
  };

  const handleLeftHandOpen = () => {
    if (!leftHandTurn || leftHandStand) return;
    setLeftHandStand(true);
    setLeftHandTurn(false);
    // 庄家补牌到17点及以上
    let dCards = [...dealerCards];
    let d = [...deck];
    while (calcPoints(dCards) < 17 && d.length > 0) {
      let [newCard, newDeck] = getRandomCards(d, 1);
      dCards.push(newCard[0]);
      d = newDeck;
    }
    setDealerCards(dCards);
    setDeck(d);
    checkGameResult(leftHandCards, dCards, false, true, true, 'left');
  };

  // 处理右手牌的操作
  const handleRightHandDeal = () => {
    if (!rightHandTurn || rightHandStand) return;
    if (deck.length < 1) return;
    let [newCard, newDeck] = getRandomCards(deck, 1);
    const newRightCards = [...rightHandCards, ...newCard];
    setRightHandCards(newRightCards);
    setDeck(newDeck);
    checkGameResult(newRightCards, dealerCards, false, false, true, 'right');
  };

  const handleRightHandOpen = () => {
    if (!rightHandTurn || rightHandStand) return;
    setRightHandStand(true);
    setRightHandTurn(false);
    // 庄家补牌到17点及以上
    let dCards = [...dealerCards];
    let d = [...deck];
    while (calcPoints(dCards) < 17 && d.length > 0) {
      let [newCard, newDeck] = getRandomCards(d, 1);
      dCards.push(newCard[0]);
      d = newDeck;
    }
    setDealerCards(dCards);
    setDeck(d);
    checkGameResult(rightHandCards, dCards, false, true, true, 'right');
  };

  const handleBetConfirm = () => {
    if (!isWalletConnected) {
      setCenterTip('Please connect wallet first!');
      setCenterTipPulse(true);
      setTimeout(() => setCenterTipPulse(false), 2000);
      return;
    }
    setPlayerChips(2500); // 设置玩家初始筹码为2500
    setGameStarted(true);
    setShowBetInput(false);
    setHasBet(false);
    setCenterTip('place a bet');
    setCenterTipPulse(false);
    setPlayerCards([]);
    setDealerCards([]);
    setTableChips([]);
  };

  // 处理入金
  const handleDeposit = () => {
    const betNum = parseInt(dealerBet, 10);
    if (isNaN(betNum) || betNum <= 0 || !dealerName.trim()) return;

    const newDealer = {
      avatar: `https://api.dicebear.com/7.x/bottts/svg?seed=${dealerName}`,
      nickname: dealerName,
      bet: betNum
    };

    setDealerList(prev => [...prev, newDealer]);
    setDealerTotalBet(prev => prev + betNum);
    setShowDepositModal(false);
    setDealerName('');
    setDealerBet('');
  };

  return (
    <>
      <div className={`blackjack-root ${gameStarted ? 'game-started' : ''}`}>
        <div className={`blackjack-main ${gameStarted ? 'game-started' : ''}`}>
          <div className="blackjack-robot-img-wrap">
            <img
              src={gameStarted ? "/image/robot_start.png" : "/image/robot.png"}
              alt="robot"
              className="blackjack-robot-img"
            />
          </div>
          <div className={`blackjack-panel ${gameStarted ? 'game-started' : ''}`}>
            <div className={`blackjack-table ${gameStarted ? 'game-started' : ''}`}>
              {gameStarted ? (
                <>
                  {/* 中央提示 */}
                  {centerTip && (
                    <div className={`bj-center-tip${centerTipPulse ? ' pulse' : ''}`}>{centerTip}</div>
                  )}
                  {tableChips.map(chip => (
                        <img
                          key={chip.id}
                          src={`/image/bets/${chip.value}.png`}
                          alt={`${chip.value} chips`}
                          className="bj-table-chip"
                          style={{
                            '--start-x': `${chip.animation.startX}px`,
                            '--start-y': `${chip.animation.startY}px`,
                            '--target-x': `${chip.animation.targetX}px`,
                            '--target-y': `${chip.animation.targetY}px`,
                            position: 'absolute',
                            left: '50%',
                            top: '50%'
                          }}
                        />
                      ))}
                  <div className="bj-table-cards">
                    <div className="bj-bet-row bj-bet-row-dealer">
                      <span className="bj-bet-chip bj-bet-chip-dealer">Chips: ${dealerTotalBet}</span>
                    </div>
                    <div className="bj-table-row bj-table-row-dealer">
                      <div className="bj-cards">
                        {dealerCards.length > 0 && (
                          <>
                            {/* 庄家底牌：开牌或爆点时亮出，否则背面 */}
                            { (playerStand || !playerTurn || leftHandStand || rightHandStand)
                              ? <img src={`/image/poker/${dealerCards[0]}.png`} alt={dealerCards[0]} className="bj-card-img" />
                              : <img src="/image/poker/back.png" alt="back" className="bj-card-img" />
                            }
                            {/* 第二张为明牌，后续为明牌 */}
                            {dealerCards.slice(1).map((card, idx) => (
                              <img key={idx} src={`/image/poker/${card}.png`} alt={card} className="bj-card-img" />
                            ))}
                          </>
                        )}
                      </div>
                    </div>
                    
                    <div className="bj-table-row bj-table-row-player">
                      <div className="bj-cards">
                        {playerCards.map(card => (
                          <img key={card} src={`/image/poker/${card}.png`} alt={card} className="bj-card-img" />
                        ))}
                      </div>
                    </div>
                    <div className="bj-bet-row bj-table-row-player">
                      <span className="bj-bet-chip bj-bet-chip-player">Chips: ${playerChips}</span>
                    </div>
                  </div>
                </>
              ) : (
                <div className="bj-table-wait">Click Start to play Blackjack!</div>
              )}
            </div>
            <div className="blackjack-toolbar">
              {!gameStarted ? (
                <button className="blackjack-start-btn" onClick={handleStart}>Start</button>
              ) : (
                <>
                  <div className="bj-chip-toolbar">
                    {[5, 10, 25, 100].map(val => (
                      <div key={val} className="bj-chip-icon" data-value={val} onClick={e => handleChipClick(val, e)}>
                        <img src={`/image/bets/${val}.png`} alt={`${val} chips`} className="bj-chip-img" />
                      </div>
                    ))}
                  </div>
                  {!isDoubleMode ? (
                    <>
                      <button className="blackjack-finish-btn" onClick={handleDeal} disabled={!playerTurn && playerCards.length > 0}>
                        {betEntry ? 'Deal' : 'Hint'}
                      </button>
                      <button className="blackjack-finish-btn" onClick={handleOpen} disabled={!playerTurn || playerStand}>Open</button>
                      <button 
                        className="blackjack-finish-btn" 
                        onClick={handleDoubleDown} 
                        disabled={playerCards.length !== 2 || !playerTurn || getCardValue(playerCards[0]) !== getCardValue(playerCards[1])}
                        style={{ 
                          backgroundColor: playerCards.length === 2 && playerTurn && getCardValue(playerCards[0]) === getCardValue(playerCards[1]) ? '#f59e0b' : '#6b7280',
                          cursor: playerCards.length === 2 && playerTurn && getCardValue(playerCards[0]) === getCardValue(playerCards[1]) ? 'pointer' : 'not-allowed',
                          opacity: playerCards.length === 2 && playerTurn && getCardValue(playerCards[0]) === getCardValue(playerCards[1]) ? 1 : 0.6
                        }}
                      >
                        Double
                      </button>
                      <button 
                        className="blackjack-finish-btn" 
                        onClick={() => setGameStarted(false)}
                        disabled={tableChips.length > 0}
                        style={{ 
                          backgroundColor: tableChips.length === 0 ? '#ef4444' : '#6b7280',
                          cursor: tableChips.length === 0 ? 'pointer' : 'not-allowed',
                          opacity: tableChips.length === 0 ? 1 : 0.6
                        }}
                      >
                        Quit
                      </button>
                    </>
                  ) : (
                    <div className="bj-double-mode">
                      <div className="bj-double-hand bj-left-hand">
                        <div className="bj-cards">
                          {leftHandCards.map(card => (
                            <img key={card} src={`/image/poker/${card}.png`} alt={card} className="bj-card-img" />
                          ))}
                        </div>
                        <div className="bj-hand-buttons">
                          <button className="bj-hand-btn" onClick={handleLeftHandDeal} disabled={!leftHandTurn || leftHandStand}>Hint</button>
                          <button className="bj-hand-btn" onClick={handleLeftHandOpen} disabled={!leftHandTurn || leftHandStand}>Open</button>
                        </div>
                      </div>
                      <div className="bj-double-hand bj-right-hand">
                        <div className="bj-cards">
                          {rightHandCards.map(card => (
                            <img key={card} src={`/image/poker/${card}.png`} alt={card} className="bj-card-img" />
                          ))}
                        </div>
                        <div className="bj-hand-buttons">
                          <button className="bj-hand-btn" onClick={handleRightHandDeal} disabled={!rightHandTurn || rightHandStand}>Hint</button>
                          <button className="bj-hand-btn" onClick={handleRightHandOpen} disabled={!rightHandTurn || rightHandStand}>Open</button>
                        </div>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
            {/* 下注输入弹窗 */}
            {showBetInput && (
              <div className="bj-bet-modal-mask" onClick={() => setShowBetInput(false)}>
                <div className="bj-bet-modal" onClick={e => e.stopPropagation()}>
                  <div className="bj-bet-title">Connect Wallet to Start</div>
                  <div className="bj-bet-wallet-section">
                    {isWalletConnected ? (
                      <div className="bj-bet-wallet-info">
                        <span className="bj-bet-wallet-address">{`${walletAddress.slice(0, 4)}...${walletAddress.slice(-4)}`}</span>
                        <button className="bj-bet-wallet-btn disconnect" onClick={disconnectWallet}>
                          Disconnect
                        </button>
                      </div>
                    ) : (
                      <button className="bj-bet-wallet-btn connect" onClick={connectWallet}>
                        Connect Wallet
                      </button>
                    )}
                  </div>
                  <button className="bj-bet-confirm" onClick={handleBetConfirm} disabled={!isWalletConnected} style={{ backgroundColor: !isWalletConnected ? '#6b7280' : '#4ade80' }}>Confirm</button>
                </div>
              </div>
            )}
          </div>
        </div>
        {/* 右侧：summary和panel纵向排列 */}
        <div className={`blackjack-right ${gameStarted ? 'slide-out' : ''}`}>
          <div className="blackjack-dealer-summary">
            <span>Total Dealers: <b>{dealerList.length}</b></span>
            <span>Total Bets: <b>${dealerTotalBet}</b></span>
          </div>
          <div className="blackjack-dealer-panel">
            <div className="blackjack-dealer-content">
              <div className="blackjack-dealer-header">
                <span className="blackjack-dealer-title">TOP 5 DEALER</span>
              </div>
              {[...dealerList].sort((a, b) => b.bet - a.bet).slice(0, 5).map((dealer, idx) => (
                <div key={idx} className="blackjack-dealer-item">
                  <img src={dealer.avatar} alt={dealer.nickname} className="blackjack-dealer-avatar" />
                  <div className="blackjack-dealer-info">
                    <div className="blackjack-dealer-nickname">{dealer.nickname}</div>
                    <div className="blackjack-dealer-bet">Bet: ${dealer.bet}</div>
                  </div>
                </div>
              ))}
            </div>
            <div className="blackjack-dealer-buttons">
              <button className="blackjack-dealer-btn" onClick={() => setShowDepositModal(true)}>Deposit</button>
              <button className="blackjack-dealer-btn secondary">Withdraw</button>
            </div>
          </div>
        </div>
        <div className={`blackjack-right ${gameStarted ? 'slide-out' : ''}`}>
          <div className="blackjack-dealer-summary blackjack-existing-games">
            <span>Number: <b>{dealerTotalBet}</b></span>
          </div>
          <div className="blackjack-dealer-panel">
            <div className="blackjack-dealer-content">
              <div className="blackjack-dealer-header">
                <span className="blackjack-dealer-title">EXISTING GAMES</span>
              </div>
              
            </div>
          </div>
        </div>
      </div>
      {/* 入金弹窗 */}
      {showDepositModal && (
        <div className="bj-bet-modal-mask" onClick={() => setShowDepositModal(false)}>
          <div className="bj-bet-modal" onClick={e => e.stopPropagation()}>
            <div className="bj-bet-title">Become a Dealer</div>
            <div className="bj-dealer-input-row">
              <input
                className="bj-bet-input"
                type="text"
                value={dealerName}
                onChange={e => setDealerName(e.target.value)}
                placeholder="YOUR NICKNAME"
                style={{ marginRight: '1rem', width: '50%' }}
              />
              <input
                className="bj-bet-input"
                type="number"
                min="1"
                value={dealerBet}
                onChange={e => setDealerBet(e.target.value)}
                placeholder="BET AMOUNT"
                style={{ width: '50%' }}
              />
            </div>
            <button className="bj-bet-confirm" onClick={async () => {
              if (!isWalletConnected) {
                await connectWallet();
              }
              handleDeposit();
            }}>INJECT</button>
          </div>
        </div>
      )}
    </>
  );
}

export default Blackjack; 