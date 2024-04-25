const ethers = require('ethers')
require("dotenv").config()
const { walletPrivateKeys } = require("./wallets");
const SimulationBotABI = require("./abis/SimulationBot.json")
const UniswapV2RouterABI = require("./abis/UniswapV2Router.json")
const ERC20ABI = require("./abis/ERC20.json")
const { BigNumber, constants: { MaxUint256, AddressZero }, utils } = require("ethers");

const provider = new ethers.providers.JsonRpcProvider(process.env.RPC_URL); 
const simulationBot = new ethers.Contract(process.env.SIMULATION_BOT_ADDRESS, SimulationBotABI, provider);
const router = new ethers.Contract(process.env.UNISWAP_V2_ROUTER_ADDRESS, UniswapV2RouterABI, provider);
const WETH = process.env.WETH_ADDRESS;
const MAXIMUM_GAS_FEE = ethers.utils.parseEther(process.env.MAXIMUM_GAS_FEE);
const MINIMUM_TRADE_AMOUNT = ethers.utils.parseEther(process.env.MINIMUM_TRADE_AMOUNT);

const walletMappingByAddress = {};
walletPrivateKeys.forEach((privateKey) => {
    const wallet = new ethers.Wallet(privateKey, provider);
    walletMappingByAddress[wallet.address] = wallet;
})

const delay = (ms) => new Promise((res) => setTimeout(res, ms));
const halfMaxUint256 = MaxUint256.div(2);

simulationBot.on("Buy", async (token, wallets, slippage, amount) => {
    console.log("======= Buy =======")
    console.log("token: ", token)
    console.log(`slippage: ${slippage.toString()}%`);
    console.log(`amount: ${utils.formatEther(amount)} ETH`);
    console.log("wallets: ", wallets);
    
    const path = [WETH, token];

    for(let i = 0; i < wallets.length; i++) {
        const wallet = walletMappingByAddress[wallets[i]];
        if (wallet === undefined) {
            console.log(`${wallets[i]} not found`);
            continue;
        }

        let ethAmount = await provider.getBalance(wallet.address);

        if(ethAmount.lt(MINIMUM_TRADE_AMOUNT)) {
            console.log(`${wallets[i]} hasn't minimum trade amount`);
            continue;
        }

        ethAmount = ethAmount.sub(MAXIMUM_GAS_FEE)
        
        await router.connect(wallet).swapExactETHForTokens(
            0,  
            path,
            wallet.address,
            MaxUint256,
            {
                value: ethAmount,
                gasLimit: 150000,
            }
        )
        console.log(`${wallet.address} swapped with ${utils.formatEther(ethAmount)} ETH`);
        await delay(2000);
    }
})

simulationBot.on("Sell", async (token, wallets, slippage, amount) => {
    const tokenContract = new ethers.Contract(token, ERC20ABI, provider);

    const decimals = await tokenContract.decimals();
    const symbol = await tokenContract.symbol();

    console.log("======= Sell =======")
    console.log("token: ", token)
    console.log(`slippage: ${slippage.toString()}%`);
    console.log(`amount: ${utils.formatUnits(amount, decimals)} ${symbol}`);
    console.log("wallets: ", wallets);
    
    const path = [token, WETH];
    

    for(let i = 0; i < wallets.length; i++) {
        const wallet = walletMappingByAddress[wallets[i]];
        if (wallet === undefined) {
            console.log(`${wallets[i]} not found`);
            continue;
        }

        const tokenBalance = await tokenContract.balanceOf(wallet.address);

        let soldAmount = tokenBalance;
        if(amount.lt(tokenBalance)) {
            soldAmount = amount;
        }
        amount = amount.sub(soldAmount)

        const approved = await tokenContract.allowance(wallet.address, router.address)

        if(approved.lt(halfMaxUint256)) {
            await tokenContract.connect(wallet).approve(router.address, MaxUint256);
        }

        await router.connect(wallet).swapExactTokensForETH(
            soldAmount,
            0,  
            path,
            process.env.SIMULATION_BOT_ADDRESS,
            MaxUint256,
            {
                gasLimit: 150000,
            }
        )
        console.log(`${wallet.address} ${utils.formatUnits(soldAmount, decimals)} ${symbol}`);
        await delay(2000);
    }
})
  