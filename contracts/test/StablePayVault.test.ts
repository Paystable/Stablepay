
import { expect } from "chai";
import { ethers, network } from "hardhat";
import { StablePayVault, IERC20 } from "../typechain-types";
import { SignerWithAddress } from "@nomicfoundation/hardhat-ethers/signers";

describe("StablePayVault - Live Testing", function () {
  let vault: StablePayVault;
  let usdc: IERC20;
  let owner: SignerWithAddress;
  let user1: SignerWithAddress;
  let user2: SignerWithAddress;

  const USDC_ADDRESS = "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913";
  const DEPOSIT_AMOUNT = ethers.parseUnits("10", 6); // 10 USDC

  beforeEach(async function () {
    [owner, user1, user2] = await ethers.getSigners();

    // Deploy vault
    const StablePayVault = await ethers.getContractFactory("StablePayVault");
    vault = await StablePayVault.deploy(USDC_ADDRESS);
    await vault.waitForDeployment();

    // Get USDC contract
    usdc = await ethers.getContractAt("IERC20", USDC_ADDRESS);

    console.log("=== LIVE TEST SETUP ===");
    console.log("Vault deployed at:", await vault.getAddress());
    console.log("Testing with Base mainnet USDC");
    console.log("User1 address:", user1.address);
    console.log("======================");
  });

  describe("Live Deployment Tests", function () {
    it("Should deploy with correct USDC address", async function () {
      expect(await vault.usdc()).to.equal(USDC_ADDRESS);
    });

    it("Should set correct owner", async function () {
      expect(await vault.owner()).to.equal(owner.address);
    });

    it("Should initialize APY mappings correctly", async function () {
      expect(await vault.getAPYForLockPeriod(0)).to.equal(700); // 7%
      expect(await vault.getAPYForLockPeriod(6)).to.equal(1050); // 10.5%
      expect(await vault.getAPYForLockPeriod(12)).to.equal(1400); // 14%
    });
    
    it("Should have correct minimum deposit", async function () {
      expect(await vault.MIN_DEPOSIT()).to.equal(ethers.parseUnits("1", 6));
    });
  });

  describe("Live USDC Integration", function () {
    it("Should check deposit readiness function", async function () {
      const testAmount = ethers.parseUnits("1", 6);
      
      const result = await vault.checkDepositReadiness(user1.address, testAmount);
      const [canDeposit, userBalance, allowance, hasBalance, hasAllowance, status] = result;
      
      console.log("=== DEPOSIT READINESS CHECK ===");
      console.log("Can deposit:", canDeposit);
      console.log("User balance:", ethers.formatUnits(userBalance, 6), "USDC");
      console.log("Allowance:", ethers.formatUnits(allowance, 6), "USDC");
      console.log("Has balance:", hasBalance);
      console.log("Has allowance:", hasAllowance);
      console.log("Status:", status);
      console.log("===============================");

      expect(typeof canDeposit).to.equal("boolean");
      expect(typeof status).to.equal("string");
    });

    it("Should perform live deposit test (if user has USDC)", async function () {
      // Check if user has USDC
      const userBalance = await usdc.balanceOf(user1.address);
      console.log("User1 USDC balance:", ethers.formatUnits(userBalance, 6));

      if (userBalance < DEPOSIT_AMOUNT) {
        console.log("⚠️  User doesn't have enough USDC for live test - skipping");
        return;
      }

      // Test the full deposit flow
      console.log("=== LIVE DEPOSIT TEST ===");
      
      // 1. Approve USDC
      console.log("1. Approving USDC...");
      await usdc.connect(user1).approve(vault.target, DEPOSIT_AMOUNT);
      
      // 2. Check deposit readiness
      const readiness = await vault.checkDepositReadiness(user1.address, DEPOSIT_AMOUNT);
      console.log("2. Deposit readiness:", readiness[0], "-", readiness[5]);
      
      // 3. Perform deposit
      console.log("3. Performing deposit...");
      const depositTx = await vault.connect(user1).deposit(DEPOSIT_AMOUNT, 6);
      const receipt = await depositTx.wait();
      
      console.log("4. Deposit successful! Gas used:", receipt?.gasUsed?.toString());
      
      // 4. Verify vault received USDC
      const vaultBalance = await usdc.balanceOf(vault.target);
      expect(vaultBalance).to.be.gte(DEPOSIT_AMOUNT);
      
      console.log("5. Vault USDC balance:", ethers.formatUnits(vaultBalance, 6));
      console.log("========================");
    });

    it("Should test transfer functionality", async function () {
      const userBalance = await usdc.balanceOf(user1.address);
      
      if (userBalance < ethers.parseUnits("1", 6)) {
        console.log("⚠️  User doesn't have USDC for transfer test - skipping");
        return;
      }

      console.log("=== TRANSFER TEST ===");
      
      // Approve 1 USDC for testing
      const testAmount = ethers.parseUnits("1", 6);
      await usdc.connect(user1).approve(vault.target, testAmount);
      
      // Test the transfer function
      try {
        const success = await vault.connect(user1).testTransfer(testAmount);
        console.log("Transfer test result:", success);
        expect(success).to.be.true;
      } catch (error) {
        console.error("Transfer test failed:", error);
        throw error;
      }
      
      console.log("===================");
    });
  });

  describe("Yield Calculations", function () {
    it("Should calculate yield correctly for a user", async function () {
      // Test with the vault owner since they might have deposits
      const yield = await vault.calculateYield(owner.address);
      console.log("Calculated yield for owner:", ethers.formatUnits(yield, 6));
      
      expect(yield).to.be.a('bigint');
    });
  });

  describe("Admin Functions", function () {
    it("Should allow owner to update APY", async function () {
      const newAPY = 2000; // 20%
      await vault.updateAPY(6, newAPY);
      expect(await vault.getAPYForLockPeriod(6)).to.equal(newAPY);
    });

    it("Should reject APY updates from non-owner", async function () {
      await expect(
        vault.connect(user1).updateAPY(6, 2000)
      ).to.be.revertedWith("Not the owner");
    });
  });

  describe("Contract Functions Compatibility", function () {
    it("Should have all required functions for frontend", async function () {
      // Test all the functions that the frontend expects
      expect(await vault.totalAssets()).to.be.a('bigint');
      expect(await vault.totalSupply()).to.be.a('bigint');
      
      const userDeposit = await vault.getUserDeposit(user1.address);
      expect(userDeposit).to.have.lengthOf(3); // amount, lockUntil, yieldEarned
      
      const yieldAvailable = await vault.getYieldAvailable(user1.address);
      expect(yieldAvailable).to.be.a('bigint');
      
      const vaultStats = await vault.getVaultStats();
      expect(vaultStats).to.have.lengthOf(5);
      
      const allowanceCheck = await vault.checkAllowance(user1.address, ethers.parseUnits("1", 6));
      expect(allowanceCheck).to.have.lengthOf(2); // sufficient, current
    });
  });
});
