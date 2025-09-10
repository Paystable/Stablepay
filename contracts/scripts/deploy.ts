import { ethers } from "hardhat";

async function main() {
  console.log("Deploying StablePayVault...");

  // Base mainnet USDC address
  const USDC_ADDRESS = "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913";

  const StablePayVault = await ethers.getContractFactory("StablePayVault");
  const vault = await StablePayVault.deploy(USDC_ADDRESS);

  await vault.waitForDeployment();

  const vaultAddress = await vault.getAddress();
  console.log("StablePayVault deployed to:", vaultAddress);

  // Verify initial configuration
  console.log("Verifying deployment...");
  console.log("USDC Address:", await vault.usdc());
  console.log("Min Deposit:", await vault.MIN_DEPOSIT());
  console.log("Owner:", await vault.owner());
  console.log("0-month APY:", await vault.getAPYForLockPeriod(0));
  console.log("6-month APY:", await vault.getAPYForLockPeriod(6));
  console.log("12-month APY:", await vault.getAPYForLockPeriod(12));
  
  // Test deposit readiness function
  const testAmount = ethers.parseUnits("1", 6);
  const readiness = await vault.checkDepositReadiness(await vault.owner(), testAmount);
  console.log("Deposit readiness test:", readiness[5]); // status message

  console.log("\nDeployment Summary:");
  console.log("- Contract: StablePayVault");
  console.log("- Network: Base");
  console.log("- Address:", vaultAddress);
  console.log("- USDC:", USDC_ADDRESS);
  console.log("- Min Deposit: 1 USDC");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});