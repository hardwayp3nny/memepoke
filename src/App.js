import React, { useMemo } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ConnectionProvider, WalletProvider } from '@solana/wallet-adapter-react';
import { WalletAdapterNetwork } from '@solana/wallet-adapter-base';
import { PhantomWalletAdapter } from '@solana/wallet-adapter-wallets';
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui';
import { clusterApiUrl } from '@solana/web3.js';

// 导入钱包适配器样式
import '@solana/wallet-adapter-react-ui/styles.css';

// 导入组件
import Blackjack from './components/Blackjack';
import Layout from './components/Layout';
import Home from './components/Home';
import './styles/main.css';

function App() {
  // 可以根据需要选择网络
  const network = WalletAdapterNetwork.Devnet;
  const endpoint = clusterApiUrl(network);

  // 初始化钱包适配器，只使用Phantom
  const wallets = useMemo(
    () => [new PhantomWalletAdapter()],
    []
  );

  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={wallets} autoConnect>
        <WalletModalProvider>
          <Router>
            <Layout>
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/blackjack" element={<Blackjack />} />
              </Routes>
            </Layout>
          </Router>
        </WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
}

export default App; 