
import { checkPaymasterAllowlist } from './paymaster-allowlist';

export const REQUIRED_CONTRACTS = {
  USDC: {
    address: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913',
    functions: [
      { name: 'approve', selector: '0x095ea7b3' },
      { name: 'transfer', selector: '0xa9059cbb' }
    ]
  },
  VAULT: {
    address: '0x4bc7a35d6e09d102087ed84445137f04540a8790',
    functions: [
      { name: 'deposit', selector: '0x6e553f65' },
      { name: 'withdraw', selector: '0xb460af94' }
    ]
  }
};

export async function verifyAllowlistStatus() {
  console.log('\n🔍 Verifying contract allowlist status...\n');
  
  const results = [];
  
  for (const [contractName, config] of Object.entries(REQUIRED_CONTRACTS)) {
    console.log(`Checking ${contractName} contract: ${config.address}`);
    
    for (const func of config.functions) {
      const result = await checkPaymasterAllowlist(config.address, func.selector);
      
      console.log(`  ${func.name} (${func.selector}): ${
        result.isAllowlisted ? '✅ Allowlisted' : '❌ Not allowlisted'
      }`);
      
      if (result.error) {
        console.log(`    Error: ${result.error}`);
      }
      
      results.push({
        contract: contractName,
        address: config.address,
        function: func.name,
        selector: func.selector,
        ...result
      });
    }
    console.log('');
  }
  
  return results;
}

export function generateAllowlistInstructions(results: any[]) {
  const notAllowlisted = results.filter(r => !r.isAllowlisted);
  
  if (notAllowlisted.length === 0) {
    return '🎉 All contracts are properly allowlisted!';
  }
  
  let instructions = '\n📋 COINBASE DEVELOPER ACCOUNT SETUP REQUIRED:\n\n';
  instructions += '1. Go to: https://portal.cdp.coinbase.com/\n';
  instructions += '2. Navigate to your project\'s Paymaster section\n';
  instructions += '3. Add these contracts to your allowlist:\n\n';
  
  const contractGroups = notAllowlisted.reduce((acc, item) => {
    if (!acc[item.contract]) {
      acc[item.contract] = { address: item.address, functions: [] };
    }
    acc[item.contract].functions.push({ name: item.function, selector: item.selector });
    return acc;
  }, {});
  
  for (const [contractName, config] of Object.entries(contractGroups)) {
    instructions += `   ${contractName} Contract:\n`;
    instructions += `   Address: ${config.address}\n`;
    instructions += `   Functions to allowlist:\n`;
    config.functions.forEach(func => {
      instructions += `     - ${func.name} (${func.selector})\n`;
    });
    instructions += '\n';
  }
  
  instructions += '4. Save your changes and wait for propagation (may take a few minutes)\n';
  instructions += '5. Re-run this verification to confirm setup\n';
  
  return instructions;
}
