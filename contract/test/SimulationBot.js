const { expect } = require("chai");
const { ethers } = require("hardhat");
const { BigNumber, constants: { MaxUint256, AddressZero }, utils } = require("ethers");

const expandTo18Decimals = (n) => {
    return BigNumber.from(n).mul(BigNumber.from(10).pow(18))
}

const delay = (ms) => new Promise((res) => setTimeout(res, ms));

describe("SimulationBot Test", function() {

    const decimals = 18;
    let simulationBot, factory, router, WETH, pair, mockToken;
    let owner, wallet1, wallet2, wallet3;

    async function tokenBuy(wallet, ethAmount) {
        const path = [WETH.address, mockToken.address]
        await router.connect(wallet).swapExactETHForTokens(
            0, 
            path,
            wallet.address,
            MaxUint256,
            {
                value: ethAmount,
                gasLimit: 9999999
            }
        )
    }

    async function getETHBalance(walletAddress) {
        return await ethers.provider.getBalance(walletAddress);
    }
    

    it("initialize", async () => {
        [owner, feeToSetter, wallet1, wallet2, wallet3] = await ethers.getSigners();

        // SimulationBot initialize
        const SimulationBot = await ethers.getContractFactory("SimulationBot");
        simulationBot = await SimulationBot.deploy();
        await simulationBot.deployed();

        simulationBot.on("Buy", async (token, wallets, slippage, amount) => {
            console.log(token, wallets, slippage, amount);
            for(let i = 0; i < wallets.length; i++) {
                const ethBalance = await getETHBalance(wallets[i]);
                console.log(ethBalance)
            }
            // const tokenBalance1 = await mockToken.balanceOf(wallet1.address)
            // const ethAmount = ethers.utils.parseEther("0.2");
            // // await tokenBuy(wallet1, ethAmount)

            // const ethBalance1_1 = await getETHBalance(wallet1.address);
            // const tokenBalance1_1 = await mockToken.balanceOf(wallet1.address)
            
            // console.log(ethBalance1, ethBalance1_1)
            // console.log(tokenBalance1, tokenBalance1_1)
        })

        // UniswapV2 initialize
        const UniswapV2Factory = await ethers.getContractFactory("UniswapV2Factory");
        factory = await UniswapV2Factory.deploy(feeToSetter.address);

        const _WETH = await ethers.getContractFactory("WETH");
        WETH = await _WETH.deploy();

        const UniswapV2Router = await ethers.getContractFactory("UniswapV2Router02");
        router = await UniswapV2Router.deploy(factory.address, WETH.address)

        const MockToken = await ethers.getContractFactory("MockERC20");
        mockToken = await MockToken.deploy("token", "token");

        await mockToken.mint(expandTo18Decimals(10000))
        await factory.createPair(WETH.address, mockToken.address)
        const pairAddress = await factory.getPair(WETH.address, mockToken.address)
        pair = await ethers.getContractAt("contracts/mocks/UniswapV2Factory.sol:IUniswapV2Pair", pairAddress);
    })

    it("add liquidity", async () => {
        const ethAmount = expandTo18Decimals(50)
        const tokenAmount = expandTo18Decimals(50)

        await mockToken.approve(router.address, MaxUint256)
       
        await router.addLiquidityETH(
            mockToken.address,
            tokenAmount,
            0,
            0,
            owner.address,
            MaxUint256,
            {
                value: ethAmount,
                gasLimit: 9999999
            }
        )
    })

    it("update token", async () => {
        await simulationBot.updateToken(mockToken.address)
    })

    it("add wallets", async () => {
        await simulationBot.addWallet(wallet1.address, 200);
        await simulationBot.addWallet(wallet2.address, 400);
        await simulationBot.addWallet(wallet3.address, 400);
    })

    it("deposit fund", async () => {
        const amount = ethers.utils.parseEther("5");
        await simulationBot.deposit({value: amount});
    })

    it("buy", async () => {
        const amount = ethers.utils.parseEther("2");

        await simulationBot.buy(2, 5, amount);
        await delay(8000)
    })

    it("buy", async () => {
        const amount = ethers.utils.parseEther("1");

        await simulationBot.buy(3, 10, amount);
        await delay(8000)
    })
})