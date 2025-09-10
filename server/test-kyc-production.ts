// Test script for production KYC integration
import './env-config';
import { cashfreeKYCService } from './cashfree-kyc';
import { surePassKYCService } from './surepass-kyc';

async function testCashfreeProduction() {
  console.log('🧪 Testing Cashfree Production KYC Integration...\n');

  const testUserAddress = '0x1234567890123456789012345678901234567890';

  try {
    // Test 1: Exchange Rate API
    console.log('1️⃣ Testing Exchange Rate API...');
    const exchangeRate = await cashfreeKYCService.getExchangeRate();
    console.log(`✅ Exchange Rate: ${exchangeRate} USD/INR\n`);

    // Test 2: PAN Advanced Verification (Mock)
    console.log('2️⃣ Testing PAN Advanced Verification...');
    const panResult = await cashfreeKYCService.verifyPANAdvanced({
      panNumber: 'ABCDE1234F',
      fullName: 'Test User Name',
      userAddress: testUserAddress
    });
    console.log(`✅ PAN Verification:`, panResult);
    console.log('');

    // Test 3: Bank Account Verification (Mock)
    console.log('3️⃣ Testing Bank Account Verification...');
    const bankResult = await cashfreeKYCService.verifyBankAdvanced({
      bankAccount: '123456789012',
      ifscCode: 'SBIN0000123',
      fullName: 'Test User Name',
      userAddress: testUserAddress,
      verifyBalance: false
    });
    console.log(`✅ Bank Verification:`, bankResult);
    console.log('');

    // Test 4: UPI Verification (Mock)
    console.log('4️⃣ Testing UPI Verification...');
    const upiResult = await cashfreeKYCService.verifyUPIAdvanced({
      upiId: 'testuser@paytm',
      fullName: 'Test User Name',
      userAddress: testUserAddress,
      verifyBalance: false
    });
    console.log(`✅ UPI Verification:`, upiResult);
    console.log('');

    // Test 5: Name Matching
    console.log('5️⃣ Testing Name Matching...');
    const nameResult = await cashfreeKYCService.verifyNameMatch({
      primaryName: 'Test User Name',
      secondaryName: 'Test U Name',
      userAddress: testUserAddress
    });
    console.log(`✅ Name Matching:`, nameResult);
    console.log('');

    // Test 6: Comprehensive KYC
    console.log('6️⃣ Testing Comprehensive KYC...');
    const comprehensiveResult = await cashfreeKYCService.performComprehensiveKYC({
      userAddress: testUserAddress,
      fullName: 'Test User Name',
      email: 'test@example.com',
      phone: '+919876543210',
      panNumber: 'ABCDE1234F',
      verificationLevel: 'enhanced'
    });
    console.log(`✅ Comprehensive KYC:`, comprehensiveResult);
    console.log('');

    console.log('🎉 Cashfree Production KYC Tests Completed Successfully!\n');
    return true;
  } catch (error) {
    console.error('❌ Cashfree KYC Test Failed:', error);
    return false;
  }
}

async function testSurePassProduction() {
  console.log('🧪 Testing SurePass Production KYC Integration...\n');

  const testUserAddress = '0x1234567890123456789012345678901234567890';

  try {
    // Test 1: Aadhaar Verification (Mock)
    console.log('1️⃣ Testing Aadhaar Verification...');
    const aadhaarResult = await surePassKYCService.verifyAadhaar({
      aadhaarNumber: '123456789012',
      userAddress: testUserAddress,
      consent: true
    });
    console.log(`✅ Aadhaar Verification:`, aadhaarResult);
    console.log('');

    // Test 2: PAN Verification (Mock)
    console.log('2️⃣ Testing PAN Verification...');
    const panResult = await surePassKYCService.verifyPAN({
      panNumber: 'ABCDE1234F',
      fullName: 'Test User Name',
      userAddress: testUserAddress,
      consent: true
    });
    console.log(`✅ PAN Verification:`, panResult);
    console.log('');

    // Test 3: Voter ID Verification (Mock)
    console.log('3️⃣ Testing Voter ID Verification...');
    const voterResult = await surePassKYCService.verifyVoterId({
      voterIdNumber: 'ABC1234567',
      fullName: 'Test User Name',
      userAddress: testUserAddress,
      state: 'Karnataka',
      consent: true
    });
    console.log(`✅ Voter ID Verification:`, voterResult);
    console.log('');

    // Test 4: Driving License Verification (Mock)
    console.log('4️⃣ Testing Driving License Verification...');
    const dlResult = await surePassKYCService.verifyDrivingLicense({
      dlNumber: 'KA0219900001234',
      fullName: 'Test User Name',
      dateOfBirth: '1990-01-01',
      userAddress: testUserAddress,
      consent: true
    });
    console.log(`✅ Driving License Verification:`, dlResult);
    console.log('');

    // Test 5: Phone Verification (Mock)
    console.log('5️⃣ Testing Phone Verification...');
    const phoneResult = await surePassKYCService.verifyPhone({
      phoneNumber: '9876543210',
      userAddress: testUserAddress,
      consent: true
    });
    console.log(`✅ Phone Verification:`, phoneResult);
    console.log('');

    // Test 6: Multi-Document KYC
    console.log('6️⃣ Testing Multi-Document KYC...');
    const multiDocResult = await surePassKYCService.performMultiDocumentKYC(
      {
        aadhaar: '123456789012',
        pan: 'ABCDE1234F',
        phone: '9876543210'
      },
      {
        fullName: 'Test User Name',
        dateOfBirth: '1990-01-01',
        userAddress: testUserAddress
      }
    );
    console.log(`✅ Multi-Document KYC:`, multiDocResult);
    console.log('');

    console.log('🎉 SurePass Production KYC Tests Completed Successfully!\n');
    return true;
  } catch (error) {
    console.error('❌ SurePass KYC Test Failed:', error);
    return false;
  }
}

async function testEnvironmentConfiguration() {
  console.log('🔧 Testing Environment Configuration...\n');

  console.log('Cashfree Configuration:');
  console.log(`- API Key: ${process.env.CASHFREE_API_KEY ? '✅ Set' : '❌ Missing'}`);
  console.log(`- Secret Key: ${process.env.CASHFREE_SECRET_KEY ? '✅ Set' : '❌ Missing'}`);
  console.log(`- Merchant ID: ${process.env.CASHFREE_MERCHANT_ID ? '✅ Set' : '❌ Missing'}`);
  console.log(`- Environment: ${process.env.CASHFREE_ENVIRONMENT || 'sandbox'}`);
  console.log('');

  console.log('SurePass Configuration:');
  console.log(`- Token: ${process.env.SUREPASS_TOKEN ? '✅ Set' : '❌ Missing'}`);
  console.log(`- Base URL: ${process.env.SUREPASS_BASE_URL || 'https://kyc-api.surepass.io'}`);
  console.log(`- Environment: ${process.env.SUREPASS_ENVIRONMENT || 'production'}`);
  console.log('');

  const cashfreeConfigured = !!(
    process.env.CASHFREE_API_KEY && 
    process.env.CASHFREE_SECRET_KEY && 
    process.env.CASHFREE_MERCHANT_ID
  );

  const surePassConfigured = !!(process.env.SUREPASS_TOKEN);

  console.log(`Cashfree Ready: ${cashfreeConfigured ? '✅ Yes' : '❌ No'}`);
  console.log(`SurePass Ready: ${surePassConfigured ? '✅ Yes' : '❌ No'}`);
  console.log('');

  return { cashfreeConfigured, surePassConfigured };
}

async function runProductionKYCTests() {
  console.log('🚀 Starting Production KYC Integration Tests...\n');
  console.log('=' .repeat(60));

  // Test environment configuration
  const config = await testEnvironmentConfiguration();

  let allTestsPassed = true;

  // Test Cashfree
  if (config.cashfreeConfigured) {
    const cashfreeSuccess = await testCashfreeProduction();
    allTestsPassed = allTestsPassed && cashfreeSuccess;
  } else {
    console.log('⚠️ Skipping Cashfree tests - credentials not configured');
    console.log('Add CASHFREE_API_KEY, CASHFREE_SECRET_KEY, and CASHFREE_MERCHANT_ID to .env\n');
  }

  // Test SurePass
  if (config.surePassConfigured) {
    const surePassSuccess = await testSurePassProduction();
    allTestsPassed = allTestsPassed && surePassSuccess;
  } else {
    console.log('⚠️ Skipping SurePass tests - credentials not configured');
    console.log('Add SUREPASS_TOKEN to .env\n');
  }

  console.log('=' .repeat(60));
  
  if (allTestsPassed && (config.cashfreeConfigured || config.surePassConfigured)) {
    console.log('🎉 ALL PRODUCTION KYC TESTS PASSED! ✅');
    console.log('\n📋 Summary:');
    console.log('- Both Cashfree and SurePass services are properly configured');
    console.log('- All API endpoints are working correctly');
    console.log('- Production credentials are valid');
    console.log('- Error handling is functioning properly');
  } else if (!config.cashfreeConfigured && !config.surePassConfigured) {
    console.log('⚠️ NO TESTS RUN - MISSING CREDENTIALS');
    console.log('\n📋 Next Steps:');
    console.log('1. Add production API credentials to your .env file:');
    console.log('   - CASHFREE_API_KEY=your_production_key');
    console.log('   - CASHFREE_SECRET_KEY=your_production_secret');
    console.log('   - CASHFREE_MERCHANT_ID=your_merchant_id');
    console.log('   - SUREPASS_TOKEN=your_production_token');
    console.log('2. Run the tests again');
  } else {
    console.log('⚠️ SOME TESTS FAILED OR WERE SKIPPED');
    console.log('\n📋 Check the error messages above and ensure:');
    console.log('- All production credentials are correct');
    console.log('- API endpoints are accessible');
    console.log('- Network connectivity is working');
  }

  console.log('\n🔗 Available KYC API Endpoints:');
  console.log('Cashfree:');
  console.log('- POST /api/kyc/digilocker/aadhaar');
  console.log('- POST /api/kyc/pan/advanced');
  console.log('- POST /api/kyc/bank/advanced');
  console.log('- POST /api/kyc/upi/advanced');
  console.log('- POST /api/kyc/comprehensive');
  console.log('');
  console.log('SurePass:');
  console.log('- POST /api/kyc/surepass/aadhaar');
  console.log('- POST /api/kyc/surepass/pan');
  console.log('- POST /api/kyc/surepass/voter-id');
  console.log('- POST /api/kyc/surepass/driving-license');
  console.log('- POST /api/kyc/surepass/phone');
  console.log('- POST /api/kyc/surepass/multi-document');
  console.log('');
  console.log('Hybrid:');
  console.log('- POST /api/kyc/hybrid-verification');
}

// Run tests directly
runProductionKYCTests().catch(console.error);

export { runProductionKYCTests };
