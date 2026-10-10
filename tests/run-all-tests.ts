/**
 * 🏛️ Veloura Living — Master Test Suite Runner
 * Executes all SRS v1.1 domain tests across Pricing, Inventory, Auth, Returns, and Invoicing.
 */

import { runPricingTests } from './pricing.test';
import { runInventoryTests } from './inventory.test';
import { runAuthSecurityTests } from './auth-security.test';
import { runPostPurchaseTests } from './post-purchase.test';
import { runOtpBrevoTestSuite } from './otp-brevo-auth.test';

async function main() {
  console.log('===========================================================');
  console.log('🏛️  VELOURA LIVING — SRS v1.1 AUTOMATED TEST SUITE RUNNER');
  console.log('===========================================================');

  let totalPassed = 0;
  let totalFailed = 0;
  const allErrors: string[] = [];

  // 1. Pricing & Tax
  const res1 = runPricingTests();
  totalPassed += res1.passed;
  totalFailed += res1.failed;
  allErrors.push(...res1.errors);

  // 2. Inventory & Stock Controls
  const res2 = runInventoryTests();
  totalPassed += res2.passed;
  totalFailed += res2.failed;
  allErrors.push(...res2.errors);

  // 3. Auth & Security
  const res3 = await runAuthSecurityTests();
  totalPassed += res3.passed;
  totalFailed += res3.failed;
  allErrors.push(...res3.errors);

  // 4. Post-Purchase & Invoicing
  const res4 = runPostPurchaseTests();
  totalPassed += res4.passed;
  totalFailed += res4.failed;
  allErrors.push(...res4.errors);

  // 5. Mandatory OTP & Brevo Transactional Email Engine
  const res5 = await runOtpBrevoTestSuite();
  totalPassed += res5.passed;
  totalFailed += res5.failed;
  allErrors.push(...res5.errors);

  console.log('\n===========================================================');
  console.log(`📊 TEST EXECUTION SUMMARY:`);
  console.log(`   ✓ Passed: ${totalPassed}`);
  console.log(`   ✗ Failed: ${totalFailed}`);
  console.log(`   🎯 Total:  ${totalPassed + totalFailed}`);
  console.log('===========================================================');

  if (totalFailed > 0) {
    console.error('\nErrors encountered:');
    allErrors.forEach((e) => console.error(` - ${e}`));
    process.exit(1);
  } else {
    console.log('🎉 ALL SRS v1.1 REQUIREMENTS & CONSTRAINTS VERIFIED 100% PASSING!\n');
    process.exit(0);
  }
}

main().catch((err) => {
  console.error('Test runner fatal error:', err);
  process.exit(1);
});
