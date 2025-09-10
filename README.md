# StablePay Platform

**FIU(Financial Intelligence Unit)-India Registered DeFi Platform for Zero-Margin Remittance and High-Yield USDC Vault**

StablePay is a sophisticated DeFi platform that combines zero-margin remittance services for the Indian diaspora with a high-yield USDC vault offering up to 14% APY through arbitrage strategies. The platform includes comprehensive KYC/AML compliance and Travel Rule compliance for international transfers.

## 🚀 Features

### Core Services
- **Zero-Margin Remittance**: Cost-effective money transfers to India
- **High-Yield USDC Vault**: Up to 14% APY with lock-in periods
- **Arbitrage Strategies**: Automated yield generation through DeFi protocols
- **Multi-Chain Support**: Base, Ethereum, and Polygon networks

### Compliance & Security
- **FIU(Financial Intelligence Unit)-India Registered**: Full regulatory compliance
- **Comprehensive KYC**: Multiple verification providers (Cashfree, SurePass)
- **Travel Rule Compliance**: International transfer regulations
- **AML Monitoring**: Real-time transaction monitoring

### Technical Features
- **Smart Contract Vault**: Secure, audited Solidity contracts
- **Real-time Analytics**: Live performance monitoring
- **Mobile-First UI**: Responsive design with PWA support
- **Multi-Wallet Support**: Coinbase Wallet, MetaMask, WalletConnect

## 🏗️ Architecture

### Frontend (React + TypeScript)
- **Framework**: React 18 with TypeScript
- **UI Library**: shadcn/ui components with Tailwind CSS
- **State Management**: TanStack Query for server state
- **Wallet Integration**: Wagmi + RainbowKit
- **Build Tool**: Vite

### Backend (Node.js + Express)
- **Runtime**: Node.js with TypeScript
- **Framework**: Express.js
- **Database**: PostgreSQL with Drizzle ORM
- **Blockchain**: Viem for Ethereum interactions
- **KYC Services**: Cashfree and SurePass integration

### Smart Contracts (Solidity)
- **Language**: Solidity ^0.8.19
- **Security**: OpenZeppelin contracts
- **Features**: ReentrancyGuard, Pausable, Ownable
- **Network**: Base (primary), Ethereum, Polygon

## 📦 Installation

### Prerequisites
- Node.js 18+ 
- npm or yarn
- PostgreSQL database
- Base network RPC access

### Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd stablepay-platform
   ```

2. **Install dependencies**
   ```bash
   npm run install:all
   ```

3. **Environment Configuration**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

4. **Database Setup**
   ```bash
   npm run db:push
   ```

5. **Smart Contract Deployment**
   ```bash
   npm run contracts:deploy
   ```

## 🚀 Development

### Start Development Server
```bash
npm run dev
```

### Build for Production
```bash
npm run build
```

### Run Tests
```bash
npm run contracts:test
```

### Clean Dependencies
```bash
npm run clean
```

## 🔧 Configuration

### Environment Variables

#### Required
- `DATABASE_URL`: PostgreSQL connection string
- `USDC_CONTRACT_ADDRESS`: USDC token contract address
- `STABLE_PAY_VAULT_ADDRESS`: Vault contract address
- `BASE_RPC_URL`: Base network RPC endpoint

#### KYC Services
- `CASHFREE_CLIENT_ID`: Cashfree KYC client ID
- `CASHFREE_CLIENT_SECRET`: Cashfree KYC client secret
- `SUREPASS_API_KEY`: SurePass API key

#### Optional
- `NODE_ENV`: Environment (development/production)
- `PORT`: Server port (default: 3000)

### Smart Contract Configuration

The vault contract supports:
- **Lock Periods**: 0-12 months
- **APY Rates**: 7%-14% based on lock period
- **Minimum Deposit**: 1 USDC
- **Maximum Lock**: 12 months

## 📊 API Endpoints

### KYC Verification
- `POST /api/kyc/comprehensive` - Comprehensive KYC verification
- `POST /api/kyc/hybrid-verification` - Multi-provider verification
- `GET /api/kyc/status/:address` - Check KYC status

### Vault Operations
- `GET /api/vault/stats` - Vault statistics
- `GET /api/vault/deposits/:address` - User deposits
- `POST /api/vault/deposit` - Create deposit

### Travel Rule
- `POST /api/travel-rule/verify` - Verify transfer compliance
- `GET /api/travel-rule/wallet-status/:address` - Check wallet status

## 🔒 Security Features

### Smart Contract Security
- **ReentrancyGuard**: Prevents reentrancy attacks
- **Pausable**: Emergency pause functionality
- **Ownable**: Owner-only administrative functions
- **Input Validation**: Comprehensive parameter validation

### Application Security
- **Rate Limiting**: API rate limiting
- **Input Sanitization**: XSS and injection prevention
- **Secure Headers**: Security headers middleware
- **Session Management**: Secure session handling

## 📱 Mobile Support

- **PWA**: Progressive Web App capabilities
- **Responsive Design**: Mobile-first approach
- **Touch Optimized**: Touch-friendly interface
- **Offline Support**: Basic offline functionality

## 🌐 Network Support

### Primary Networks
- **Base**: Main deployment network
- **Ethereum**: Secondary network
- **Polygon**: Cost-effective alternative

### Token Support
- **USDC**: Primary stablecoin
- **ETH**: Gas token
- **MATIC**: Polygon gas token

## 📈 Performance

### Optimization Features
- **Code Splitting**: Dynamic imports
- **Lazy Loading**: Component lazy loading
- **Caching**: Query result caching
- **Compression**: Gzip compression

### Monitoring
- **Real-time Analytics**: Live performance metrics
- **Error Tracking**: Comprehensive error logging
- **Performance Monitoring**: Response time tracking

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For support and questions:
- **Documentation**: Check the docs folder
- **Issues**: Create a GitHub issue
- **Email**: support@stablepay.com

## 🔮 Roadmap

### Phase 1 (Current)
- ✅ Core vault functionality
- ✅ KYC integration
- ✅ Basic UI/UX

### Phase 2 (Q2 2024)
- 🔄 Advanced analytics
- 🔄 Mobile app
- 🔄 Additional networks

### Phase 3 (Q3 2024)
- 📋 Institutional features
- 📋 Advanced compliance
- 📋 API marketplace

---

**Built with ❤️ for the Indian diaspora and DeFi community**
