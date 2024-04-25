// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/security/Pausable.sol";

contract SimulationBot is Ownable, Pausable {
    struct Wallet {
        address _address;
        uint256 _point;
    }
    mapping(address => uint256) private ids;
    Wallet[] public wallets;
    address public token;
    uint256 public totalETH;
    uint256 public gasFee;

    event UpdatedToken(address prevToken, address newToken);
    event AddedWallet(address _address, uint256 _point);
    event RemovedWallet(address _address);
    event Deposited(address from, uint256 amount);
    event Withdrawn(address to, uint256 amount);
    event Buy(address token, address[] wallets, uint256 slippage, uint256 amount);
    event Sell(address token, address[] wallets, uint256 slippage, uint256 amount);

    constructor() Ownable() {
    }

    function updateToken(address newToken) public onlyOwner {
        address prevToken = token;
        token = newToken;
        emit UpdatedToken(prevToken, newToken);
    }

    function setGasFee(uint256 _gasFee) public onlyOwner {
        gasFee = _gasFee;
    }

    function addWallet(address _address, uint256 _point) public onlyOwner {
        require(_address != address(0), "invalid wallet address");
        require(_point < 10000, "point less than 10000");
        require(ids[_address] == 0, "already registered address");

        wallets.push(Wallet(_address, _point));
        ids[_address] = wallets.length;

        emit AddedWallet(_address, _point);
    }

    function addWallets(address[] memory _addresses, uint256[] memory _points) public onlyOwner {
        require(_addresses.length == _points.length, "invalid length");

        for(uint256 i = 0 ; i < _addresses.length; i++) {
            addWallet(_addresses[i], _points[i]);
        }
    }

    function removeWallet(address _address) public onlyOwner {
        require(_address != address(0), "invalid wallet address");
        require(ids[_address] > 0, "not registered address");

        uint256 id = ids[_address];
        delete ids[_address];

        if (wallets.length > 0) {
            Wallet memory lastWallet = wallets[wallets.length - 1];
            wallets[id - 1] = lastWallet;
            ids[lastWallet._address] = id;
        }

        wallets.pop();
        emit RemovedWallet(_address);
    }

    function _random(uint256 x) internal pure returns (uint256) {
        return (16807 * x) % 2147483647;
    }

    function _randomSelectWallets(uint256 total, uint256 n) internal view returns (uint256[] memory) {
        require(total >= n, "invalid parameter");

        uint256 x = block.timestamp;
        bool[] memory flag = new bool[](total);
        uint256[] memory arr = new uint256[](n);

        for(uint256 i = 0; i < n;) {
            x = _random(x);
            uint256 id = x % total;
            if(!flag[id]) {
                flag[id] = true;
                arr[i] = id;
                i++;
            }
        }

        return arr;
    } 

    function deposit() public payable {
        uint256 amount = msg.value;
        totalETH += amount;

        emit Deposited(msg.sender, totalETH);
    }

    function withdraw(address to, uint256 amount) public onlyOwner {
        require(totalETH >= amount, "amount exceeds the contract balance");
        totalETH -= amount;
        payable(to).transfer(amount);

        emit Withdrawn(to, amount);
    }

    function buy(uint256 n, uint256 slippage, uint256 amount) public onlyOwner {
        require(wallets.length > 0, " wallets not registered");
        require(slippage >= 1 && slippage <= 100, "slippage's range from 1 to 100");
        require(totalETH >= amount, "amount exceeds the contract balance");

        totalETH -= amount;

        uint256[] memory arr = _randomSelectWallets(wallets.length, n);
        address[] memory selectedWallets = new address[](n);
        uint256 totalPoint = 0;
        for(uint256 i = 0; i < n; i ++) {
            uint256 id = arr[i];
            totalPoint += wallets[id]._point;
        }

        uint256 divideAmountPerPoint = amount * 1e12 / totalPoint;
        uint256 restAmount = amount;

        for(uint256 i = 0; i < n; i++) {
            uint256 id = arr[i];

            uint256 divideAmount;
            if(i < n - 1) divideAmount = divideAmountPerPoint * wallets[id]._point / 1e12;
            else divideAmount = restAmount;

            restAmount -= divideAmount;
            selectedWallets[i] = wallets[id]._address;

            payable(selectedWallets[i]).transfer(divideAmount);
        }

        emit Buy(token, selectedWallets, slippage, amount);
    }

    function sell(uint256 slippage, uint256 amount) public onlyOwner {
        require(wallets.length > 0, " wallets not registered");
        require(slippage >= 1 && slippage <= 100, "slippage's range from 1 to 100");

        uint256[] memory arr = _randomSelectWallets(wallets.length, wallets.length);
        IERC20 _token = IERC20(token);
        uint256 rest = amount;
        uint256 n = 0;
        for(uint256 i = 0; i < wallets.length && rest > 0; i++) {
            uint256 id = arr[i];
            uint256 balance = _token.balanceOf(wallets[id]._address);
            if(balance > 0) {
                if(rest > balance) rest -= balance;
                else rest = 0;
                n++;
            }
        }

        address[] memory selectedWallets = new address[](n);
        for(uint256 i = 0; i < n; i++) {
            uint256 id = arr[i];
            selectedWallets[i] = wallets[id]._address;
            payable(wallets[id]._address).transfer(gasFee);
        }

        emit Sell(token, selectedWallets, slippage, amount - rest);
    }

    function getTotalBalance() public view returns(uint256) {
        IERC20 _token = IERC20(token);

        uint256 total = 0;
        for(uint256 i = 0; i < wallets.length; i++) {
            uint256 balance = _token.balanceOf(wallets[i]._address);
            total += balance;
        }

        return total;
    }

    receive() external payable {
        uint256 amount = msg.value;
        totalETH += amount;

        emit Deposited(msg.sender, totalETH);       
    }
}