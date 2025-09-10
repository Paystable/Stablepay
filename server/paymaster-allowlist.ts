
export async function checkPaymasterAllowlist(contractAddress: string, functionSelector?: string) {
  try {
    const COINBASE_PAYMASTER_RPC_URL = process.env.VITE_PAYMASTER_URL || 'https://api.developer.coinbase.com/rpc/v1/base/yHLH6AHHYTuJcz4ByF9jNN0tWQkHZhSO';
    
    // Create a realistic test user operation
    const testUserOp = {
      sender: '0x742d35Cc6639C0532fE25578A5aa671c6228c8Bb', // Test address
      nonce: '0x0',
      initCode: '0x',
      callData: generateCallData(contractAddress, functionSelector),
      callGasLimit: '0x30D40', // 200000
      verificationGasLimit: '0x61A80', // 400000
      preVerificationGas: '0x15F90', // 90000
      maxFeePerGas: '0x59682F00', // 1.5 gwei
      maxPriorityFeePerGas: '0x3B9ACA00', // 1 gwei
      paymasterAndData: '0x',
      signature: '0x' + '00'.repeat(65)
    };

    const response = await fetch(COINBASE_PAYMASTER_RPC_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.VITE_COINBASE_API_KEY || '55a219f0-5f88-4931-818a-34bd7d74eff8'}`,
      },
      body: JSON.stringify({
        jsonrpc: '2.0',
        method: 'pm_sponsorUserOperation',
        params: [
          testUserOp,
          '0x5FF137D4b0FDCD49DcA30c7CF57E578a026d2789', // EntryPoint
          {
            type: "payg"
          }
        ],
        id: 1
      })
    });

    const result = await response.json();
    console.log('Paymaster allowlist check result:', result);
    
    // Check for specific allowlist errors
    const isAllowlistError = result.error && (
      result.error.message?.includes('allowlist') ||
      result.error.message?.includes('not sponsored') ||
      result.error.message?.includes('contract not allowed') ||
      result.error.code === -32602
    );
    
    return {
      isAllowlisted: !result.error && !!result.result?.paymasterAndData,
      error: result.error?.message,
      errorCode: result.error?.code,
      needsAllowlisting: isAllowlistError,
      data: result.result,
      contractAddress,
      functionSelector
    };
  } catch (error) {
    console.error('Error checking paymaster allowlist:', error);
    return {
      isAllowlisted: false,
      error: error.message,
      needsAllowlisting: true,
      contractAddress,
      functionSelector
    };
  }
}

function generateCallData(contractAddress: string, functionSelector?: string): string {
  // Default to USDC approve function if no selector provided
  const selector = functionSelector || '0x095ea7b3'; // approve(address,uint256)
  
  if (selector === '0x095ea7b3') {
    // approve(spender, amount) - approve vault to spend USDC
    const spender = '0x4bc7a35d6e09d102087ed84445137f04540a8790'; // Your vault
    const amount = '0x' + (1000000000).toString(16).padStart(64, '0'); // 1000 USDC
    return selector + spender.slice(2).padStart(64, '0') + amount.slice(2);
  } else if (selector === '0x6e553f65') {
    // depositWithLockPeriod(uint256 amount, uint256 lockPeriodMonths)
    const amount = '0x' + (1000000000).toString(16).padStart(64, '0'); // 1000 USDC
    const lockPeriod = '0x' + (6).toString(16).padStart(64, '0'); // 6 months
    return selector + amount.slice(2) + lockPeriod.slice(2);
  } else if (selector === '0xb460af94') {
    // withdraw() - no parameters
    return selector + '0'.repeat(128);
  } else {
    return selector + '0'.repeat(128); // Generic call data
  }
}
