# Ethereum-Smartcontract-Bot
This is a bot to simulate the buying and selling of certain token with multi wallets.
The bot consists both smart contract and service.
## Smart contract
Smart contract has main functions - "deposit", "withdraw", "buy" and "sell"
### Installation
```sh
# Clone the repo
    git clone https://github.com/Wilson-inclaims/ethereum-smartcontract-bot.git
# Cd  contract
    cd contract
# Install all dependencies
    npm install
```
### Compile contract
```sh
npx hardhat compile
```
### Test contract
```sh
npx hardhat test
```
### Deploy contract
```sh
npx hardhat run scripts/deploy.js --network networkname
```
### Deployed address
Ethereum mainnet: [0xd69b16ACEF4bd0aCB7E57D4dF0F1AC84D377E96b](https://etherscan.io/address/0xd69b16ACEF4bd0aCB7E57D4dF0F1AC84D377E96b)
Sepolia testnet: [0x16d3bA44ef9dD2b3546b0bbdc4734788D3FCbcAA](https://sepolia.etherscan.io/address/0x16d3bA44ef9dD2b3546b0bbdc4734788D3FCbcAA)
### Modifiers
##### onlyOwner
    Executes only by Owner
### Functions
##### Mutable
    transferOwnership(address newAdmin) - transfer the ownership to newAdmin [onlyOwner]
    addWallet(address _address, uint256 _point) - add the wallet with point[1 - 10000] [onlyOwner]
    addWallets(address[] _addresses, uint256[] _points) -add the wallet list [onlyOwner]
    deposit() payable - deposit the fund to contract
    withdraw(address to, uint256 amount) - withdraw the fund from contract [onlyOwner]
    updateToken(address newToken) - update the token address for trading [onlyOwner]
    setGasFee(uint256 _gasFee) -set the trading gas fee [onlyOwner]
    buy(uint256 n, uint256 slippage, uint256 amount) - emit the event to buy the tokens with n wallets [onlyOwner]
    sell(uint256 slippage, uint256 amount) - emit the event to sell the tokens [onlyOwner]
##### View
    owner() - returns the owner of contract (address)
    token() - returns the token address (address)
    gasFee() - returns the trading gas fee (uint256)
    wallets(uint256) - returns the client wallet (address, uint256)
    getTotalBalance() - returns the amount of total bought tokens (uint256)
    totalETH - returns the amount of ETH (uint256)

## Service
Service performs the buy and sell actions with client wallets.
### Installation
```sh
# Clone the repo
    git clone https://github.com/Wilson-inclaims/ethereum-smartcontract-bot.git
# Cd  contract
    cd service
# Install all dependencies
    npm install
```
### Set .env file
```sh
RPC_URL = 
SIMULATION_BOT_ADDRESS = 
UNISWAP_V2_ROUTER_ADDRESS = 
WETH_ADDRESS = 
MAXIMUM_GAS_FEE = 
MINIMUM_TRADE_AMOUNT = 
```
### Set the client wallets
set the private key of client wallets in wallets.js
```sh
const walletPrivateKeys = [
    /// here
]
```
### Run
```sh
npm start
```