// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/Pausable.sol";

contract StablePayVault is ReentrancyGuard, Ownable, Pausable {
    IERC20 public immutable usdc;
    
    uint256 public constant MIN_DEPOSIT = 1e6; // 1 USDC (6 decimals)
    uint256 public constant MAX_LOCK_PERIOD = 12; // Maximum 12 months
    uint256 public totalAssets;
    uint256 public totalSupply;
    
    struct Deposit {
        uint256 amount;
        uint256 timestamp;
        uint256 lockMonths;
        uint256 yieldEarned;
        bool isActive;
    }

    mapping(address => Deposit[]) public userDeposits;
    mapping(address => uint256) public userTotalDeposited;
    mapping(address => uint256) public balanceOf;
    mapping(address => uint256) public yieldBalance;
    mapping(uint256 => uint256) public apyForLockPeriod;
    mapping(address => bool) public isInvestor;

    event USDCDeposited(address indexed user, uint256 amount, uint256 lockMonths, uint256 timestamp);
    event TransferSuccess(address indexed from, address indexed to, uint256 amount);
    event TransferFailed(address indexed from, address indexed to, uint256 amount, string reason);
    event Withdraw(address indexed caller, address indexed receiver, address indexed owner, uint256 assets, uint256 shares);
    event YieldClaimed(address indexed user, uint256 amount);
    event Deposit(address indexed caller, address indexed owner, uint256 assets, uint256 shares, uint256 lockUntil);
    event DepositWithLock(address indexed caller, address indexed owner, uint256 assets, uint256 shares, uint256 lockUntil, uint256 lockPeriodMonths, uint256 apy);
    event APYUpdated(uint256 indexed lockPeriod, uint256 newAPY);
    event EmergencyWithdraw(address indexed owner, uint256 amount);

    constructor(address _usdc) {
        require(_usdc != address(0), "Invalid USDC address");
        usdc = IERC20(_usdc);
        _transferOwnership(msg.sender);
        
        // Initialize APY mappings (basis points: 700 = 7%)
        apyForLockPeriod[0] = 700;   // No lock: 7%
        apyForLockPeriod[1] = 800;   // 1 month: 8%
        apyForLockPeriod[2] = 850;   // 2 months: 8.5%
        apyForLockPeriod[3] = 900;   // 3 months: 9%
        apyForLockPeriod[4] = 950;   // 4 months: 9.5%
        apyForLockPeriod[5] = 1000;  // 5 months: 10%
        apyForLockPeriod[6] = 1050;  // 6 months: 10.5%
        apyForLockPeriod[7] = 1100;  // 7 months: 11%
        apyForLockPeriod[8] = 1150;  // 8 months: 11.5%
        apyForLockPeriod[9] = 1200;  // 9 months: 12%
        apyForLockPeriod[10] = 1250; // 10 months: 12.5%
        apyForLockPeriod[11] = 1300; // 11 months: 13%
        apyForLockPeriod[12] = 1400; // 12 months: 14%
    }

    function deposit(uint256 amount, uint256 lockMonths) external nonReentrant whenNotPaused {
        require(amount >= MIN_DEPOSIT, "Minimum deposit is 1 USDC");
        require(lockMonths <= MAX_LOCK_PERIOD, "Lock period exceeds max allowed");

        // Check user balance
        uint256 userBalance = usdc.balanceOf(msg.sender);
        require(userBalance >= amount, "Insufficient USDC balance");

        // Check allowance
        uint256 allowance = usdc.allowance(msg.sender, address(this));
        require(allowance >= amount, "Please approve USDC first");

        // Record balances before transfer
        uint256 vaultBalanceBefore = usdc.balanceOf(address(this));

        // Perform transfer
        bool success = usdc.transferFrom(msg.sender, address(this), amount);

        if (!success) {
            emit TransferFailed(msg.sender, address(this), amount, "transferFrom failed");
            revert("USDC transfer failed");
        }

        // Verify transfer worked
        uint256 vaultBalanceAfter = usdc.balanceOf(address(this));
        if (vaultBalanceAfter < vaultBalanceBefore + amount) {
            emit TransferFailed(msg.sender, address(this), amount, "Balance verification failed");
            revert("Transfer verification failed");
        }

        // Record the deposit
        userDeposits[msg.sender].push(Deposit({
            amount: amount,
            timestamp: block.timestamp,
            lockMonths: lockMonths,
            yieldEarned: 0,
            isActive: true
        }));

        userTotalDeposited[msg.sender] += amount;
        totalAssets += amount;
        totalSupply += amount;
        balanceOf[msg.sender] += amount;
        
        // Track unique investors
        if (!isInvestor[msg.sender]) {
            isInvestor[msg.sender] = true;
        }

        emit TransferSuccess(msg.sender, address(this), amount);
        emit USDCDeposited(msg.sender, amount, lockMonths, block.timestamp);
    }

    function getDepositBalance(address user) external view returns (uint256) {
        return userTotalDeposited[user];
    }

    function getUserDeposits(address user) external view returns (Deposit[] memory) {
        return userDeposits[user];
    }

    function getLatestDeposit(address user) external view returns (
        uint256 amount,
        uint256 lockMonths,
        uint256 depositTime,
        uint256 unlockTime,
        bool hasDeposit
    ) {
        Deposit[] memory deposits = userDeposits[user];

        if (deposits.length == 0) {
            return (0, 0, 0, 0, false);
        }

        Deposit memory latest = deposits[deposits.length - 1];
        amount = latest.amount;
        lockMonths = latest.lockMonths;
        depositTime = latest.timestamp;
        unlockTime = latest.timestamp + (latest.lockMonths * 30 days);
        hasDeposit = true;
    }

    function checkDepositReadiness(address user, uint256 amount) external view returns (
        bool canDeposit,
        uint256 userBalance,
        uint256 allowance,
        bool hasBalance,
        bool hasAllowance,
        string memory status
    ) {
        userBalance = usdc.balanceOf(user);
        allowance = usdc.allowance(user, address(this));
        hasBalance = userBalance >= amount;
        hasAllowance = allowance >= amount;

        canDeposit = hasBalance && hasAllowance && amount >= MIN_DEPOSIT;

        if (amount < MIN_DEPOSIT) {
            status = "Amount below minimum deposit";
        } else if (!hasBalance) {
            status = "Insufficient USDC balance";
        } else if (!hasAllowance) {
            status = "Insufficient USDC allowance";
        } else {
            status = "Ready for deposit";
        }
    }

    function getTotalVaultBalance() external view returns (uint256) {
        return usdc.balanceOf(address(this));
    }

    // Frontend compatibility functions
    function getUserDeposit(address user) external view returns (
        uint256 amount,
        uint256 lockUntil,
        uint256 yieldEarned
    ) {
        if (userDeposits[user].length == 0) {
            return (0, 0, 0);
        }
        
        Deposit memory latest = userDeposits[user][userDeposits[user].length - 1];
        amount = latest.amount;
        lockUntil = latest.timestamp + (latest.lockMonths * 30 days);
        yieldEarned = calculateYield(user);
    }
    
    function getYieldAvailable(address user) external view returns (uint256) {
        return calculateYield(user);
    }
    
    function getAPYForLockPeriod(uint256 lockPeriodMonths) external view returns (uint256) {
        return apyForLockPeriod[lockPeriodMonths];
    }
    
    function calculateYield(address user) public view returns (uint256) {
        if (userDeposits[user].length == 0) {
            return 0;
        }
        
        uint256 totalYield = 0;
        for (uint i = 0; i < userDeposits[user].length; i++) {
            Deposit memory userDeposit = userDeposits[user][i];
            uint256 timeElapsed = block.timestamp - userDeposit.timestamp;
            uint256 apy = apyForLockPeriod[userDeposit.lockMonths];
            
            // Calculate yield: (principal * apy * timeElapsed) / (10000 * 365 days)
            uint256 yieldAmount = (userDeposit.amount * apy * timeElapsed) / (10000 * 365 days);
            totalYield += yieldAmount;
        }
        
        return totalYield;
    }
    
    function depositWithLockPeriod(uint256 assets, address receiver, uint256 lockPeriodMonths) external nonReentrant whenNotPaused returns (uint256) {
        require(receiver == msg.sender, "Can only deposit for yourself");
        require(assets >= MIN_DEPOSIT, "Minimum deposit is 1 USDC");
        require(lockPeriodMonths <= MAX_LOCK_PERIOD, "Lock period exceeds max allowed");
        
        // Check user balance and allowance
        uint256 userBalance = usdc.balanceOf(msg.sender);
        require(userBalance >= assets, "Insufficient USDC balance");
        
        uint256 allowance = usdc.allowance(msg.sender, address(this));
        require(allowance >= assets, "Please approve USDC first");
        
        // Perform transfer
        bool success = usdc.transferFrom(msg.sender, address(this), assets);
        require(success, "USDC transfer failed");
        
        // Record the deposit
        userDeposits[msg.sender].push(Deposit({
            amount: assets,
            timestamp: block.timestamp,
            lockMonths: lockPeriodMonths,
            yieldEarned: 0,
            isActive: true
        }));
        
        userTotalDeposited[msg.sender] += assets;
        totalAssets += assets;
        totalSupply += assets;
        balanceOf[receiver] += assets;
        
        // Track unique investors
        if (!isInvestor[msg.sender]) {
            isInvestor[msg.sender] = true;
        }
        
        uint256 lockUntil = block.timestamp + (lockPeriodMonths * 30 days);
        uint256 apy = apyForLockPeriod[lockPeriodMonths];
        
        emit DepositWithLock(msg.sender, receiver, assets, assets, lockUntil, lockPeriodMonths, apy);
        emit Deposit(msg.sender, receiver, assets, assets, lockUntil);
        emit USDCDeposited(msg.sender, assets, lockPeriodMonths, block.timestamp);
        
        return assets; // Return shares (1:1 ratio)
    }
    
    function withdraw(uint256 assets, address receiver, address owner) external nonReentrant whenNotPaused returns (uint256) {
        require(msg.sender == owner, "Not authorized");
        require(balanceOf[owner] >= assets, "Insufficient balance");
        require(assets > 0, "Amount must be greater than 0");
        
        // Check if funds are locked
        if (userDeposits[owner].length > 0) {
            Deposit memory latest = userDeposits[owner][userDeposits[owner].length - 1];
            if (latest.isActive) {
                uint256 lockUntil = latest.timestamp + (latest.lockMonths * 30 days);
                require(block.timestamp >= lockUntil, "Funds are still locked");
            }
        }
        
        // Update state
        totalAssets -= assets;
        totalSupply -= assets;
        balanceOf[owner] -= assets;
        userTotalDeposited[owner] -= assets;
        
        // Transfer USDC
        bool success = usdc.transfer(receiver, assets);
        require(success, "Transfer failed");
        
        emit Withdraw(msg.sender, receiver, owner, assets, assets);
        
        return assets; // Return shares (1:1 ratio)
    }
    
    function claimYield() external nonReentrant whenNotPaused returns (uint256) {
        uint256 availableYield = calculateYield(msg.sender);
        require(availableYield > 0, "No yield available");
        
        // Reset yield tracking (simplified)
        yieldBalance[msg.sender] = 0;
        
        // In a real implementation, yield would come from external sources
        // For demo purposes, we'll mint from reserves or handle differently
        
        emit YieldClaimed(msg.sender, availableYield);
        
        return availableYield;
    }
    
    function updateAPY(uint256 lockPeriodMonths, uint256 newAPY) external onlyOwner {
        require(lockPeriodMonths <= MAX_LOCK_PERIOD, "Invalid lock period");
        require(newAPY <= 2000, "APY cannot exceed 20%"); // Safety limit
        apyForLockPeriod[lockPeriodMonths] = newAPY;
        emit APYUpdated(lockPeriodMonths, newAPY);
    }
    
    function pause() external onlyOwner {
        _pause();
    }
    
    function unpause() external onlyOwner {
        _unpause();
    }
    
    function getVaultStats() external view returns (
        uint256 _totalAssets,
        uint256 _totalSupply,
        uint256 _totalInvestors,
        uint256 _averageAPY,
        uint256 _contractBalance
    ) {
        _totalAssets = totalAssets;
        _totalSupply = totalSupply;
        _totalInvestors = totalSupply > 0 ? 1 : 0; // Simplified for now
        _averageAPY = 1200; // 12% average
        _contractBalance = usdc.balanceOf(address(this));
    }
    
    function getTotalInvestors() external view returns (uint256) {
        // This would need to be tracked properly in a real implementation
        return totalSupply > 0 ? 1 : 0;
    }
    
    function checkAllowance(address user, uint256 amount) external view returns (
        bool sufficient,
        uint256 current
    ) {
        current = usdc.allowance(user, address(this));
        sufficient = current >= amount;
    }
    
    function testTransfer(uint256 amount) external returns (bool) {
        require(usdc.allowance(msg.sender, address(this)) >= amount, "Insufficient allowance");
        return usdc.transferFrom(msg.sender, address(this), amount);
    }

    // Emergency withdraw for owner
    function emergencyWithdraw(uint256 amount) external onlyOwner {
        require(amount <= usdc.balanceOf(address(this)), "Insufficient contract balance");
        bool success = usdc.transfer(owner(), amount);
        require(success, "Emergency withdraw failed");
        emit EmergencyWithdraw(owner(), amount);
    }
    
    // Function to get user's active deposits
    function getActiveDeposits(address user) external view returns (Deposit[] memory) {
        Deposit[] memory allDeposits = userDeposits[user];
        uint256 activeCount = 0;
        
        // Count active deposits
        for (uint256 i = 0; i < allDeposits.length; i++) {
            if (allDeposits[i].isActive) {
                activeCount++;
            }
        }
        
        // Create array of active deposits
        Deposit[] memory activeDeposits = new Deposit[](activeCount);
        uint256 index = 0;
        
        for (uint256 i = 0; i < allDeposits.length; i++) {
            if (allDeposits[i].isActive) {
                activeDeposits[index] = allDeposits[i];
                index++;
            }
        }
        
        return activeDeposits;
    }
}
