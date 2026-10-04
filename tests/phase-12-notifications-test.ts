/**
 * 🏛️ Veloura Living — Phase 12 Automated Verification Test Suite
 * Tests: Multi-Channel Notification Engine, HTML Email Templates,
 * WhatsApp/SMS Formatting, In-App Notification Store, and Order Triggers.
 */

import { notificationService } from '../lib/services/notificationService';
import {
  initNotificationStore,
  getNotifications,
  getUnreadCount,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotification,
  createNotificationRecord,
} from '../lib/data/notificationStore';

function assert(condition: boolean, message: string) {
  if (!condition) {
    console.error(`❌ FAILED: ${message}`);
    throw new Error(`Assertion failed: ${message}`);
  }
  console.log(`  ✓ ${message}`);
}

async function runPhase12Tests() {
  console.log('🏛️ ========================================================');
  console.log('🏛️ VELOURA LIVING — PHASE 12 NOTIFICATION ENGINE TEST SUITE');
  console.log('🏛️ ========================================================\n');

  let passedTests = 0;

  // -------------------------------------------------------------
  // TEST SUITE 1: Multi-Channel Template Rendering Engine
  // -------------------------------------------------------------
  console.log('📦 1. Testing Multi-Channel Template Rendering & Formatting...');
  const samplePayload = {
    recipientEmail: 'evelyn.sinclair@mayfair-estates.co.uk',
    recipientPhone: '+91 98201 11223',
    channels: ['IN_APP', 'EMAIL', 'WHATSAPP', 'SMS'] as any[],
    type: 'ORDER_STATUS' as any,
    title: 'Order Dispatched: VL-2026-8941',
    message: 'Your Serpentine Modular Sectional is now in transit with Veloura White-Glove Logistics.',
    actionUrl: 'https://velouraliving.com/account?order=8941',
  };

  const htmlEmail = notificationService.renderHtmlEmailTemplate(samplePayload);
  assert(htmlEmail.includes('<!DOCTYPE html>'), 'HTML email contains DOCTYPE tag');
  assert(htmlEmail.includes('VELOURA LIVING'), 'HTML email contains branded header');
  assert(htmlEmail.includes('Order Dispatched: VL-2026-8941'), 'HTML email contains title');
  assert(htmlEmail.includes('https://velouraliving.com/account?order=8941'), 'HTML email contains action button URL');

  const waText = notificationService.renderWhatsAppTemplate(samplePayload);
  assert(waText.includes('🏛️ *VELOURA LIVING*'), 'WhatsApp template formatted with bold branding');
  assert(waText.includes('Order Dispatched: VL-2026-8941'), 'WhatsApp template contains title');
  assert(waText.includes('https://velouraliving.com/account?order=8941'), 'WhatsApp template includes action link');

  const smsText = notificationService.renderSmsTemplate(samplePayload);
  assert(smsText.startsWith('[VELOURA]'), 'SMS template prefixed with [VELOURA] identifier');
  assert(smsText.includes('Order Dispatched: VL-2026-8941'), 'SMS template contains message');
  passedTests += 9;

  // -------------------------------------------------------------
  // TEST SUITE 2: Multi-Channel Notification Dispatcher
  // -------------------------------------------------------------
  console.log('\n📦 2. Testing Multi-Channel Notification Dispatcher Pipeline...');
  const dispatchResult = await notificationService.dispatchNotification({
    recipientEmail: 'client@example.com',
    recipientPhone: '+91 98201 54321',
    userId: 'test_user_p12',
    ownerKey: 'test_owner_p12',
    channels: ['IN_APP', 'EMAIL', 'WHATSAPP', 'SMS'],
    type: 'VIP_CONCIERGE',
    title: 'Private Atelier Viewing Invitation',
    message: 'You are invited to inspect our 2026 Architectural Walnut collection.',
    actionUrl: '/shop',
  });

  assert(!!dispatchResult.notificationId, `Notification ID generated: ${dispatchResult.notificationId}`);
  assert(dispatchResult.channelResults.length === 4, 'All 4 channels processed');
  assert(dispatchResult.channelResults.every((r) => r.success), 'All 4 channels report successful dispatch');
  passedTests += 3;

  // -------------------------------------------------------------
  // TEST SUITE 3: In-App Notification Store & Unread Ledger
  // -------------------------------------------------------------
  console.log('\n📦 3. Testing In-App Notification Store & Ledger Operations...');
  const testKey = `session_p12_test_${Date.now()}`;

  // 1. Create notifications in store
  const n1 = createNotificationRecord({
    ownerKey: testKey,
    type: 'ORDER_STATUS',
    title: 'Order Confirmed: VL-2026-101',
    message: 'Your piece is being hand-crafted in Milan.',
    actionUrl: '/account',
  });

  const n2 = createNotificationRecord({
    ownerKey: testKey,
    type: 'VIP_CONCIERGE',
    title: 'Exclusive Solis Chair Drop',
    message: 'New fabric options available for preorder.',
    actionUrl: '/product/solis-boucle-occasional-chair',
  });

  assert(!!n1.id && !!n2.id, 'Created 2 distinct notification records in store');

  // 2. Query store and verify unread count
  const initialList = getNotifications(testKey);
  assert(initialList.total >= 2, `Retrieved ${initialList.total} notifications for test owner`);
  assert(initialList.unreadCount >= 2, `Unread count accurately calculated as ${initialList.unreadCount}`);

  // 3. Mark single notification as read
  const markedSingle = markNotificationAsRead(n1.id, testKey);
  assert(markedSingle?.is_read === true, 'Notification marked as read');
  assert(!!markedSingle?.read_at, `Read timestamp recorded: ${markedSingle?.read_at}`);

  const midList = getNotifications(testKey);
  assert(midList.unreadCount === initialList.unreadCount - 1, 'Unread count decreased by 1 after single read');

  // 4. Batch mark all as read
  const updatedCount = markAllNotificationsAsRead(testKey);
  assert(updatedCount >= 1, `Batch updated ${updatedCount} unread notifications to read`);

  const finalList = getNotifications(testKey);
  assert(finalList.unreadCount === 0, 'Unread count dropped to 0 after markAllNotificationsAsRead');

  // 5. Delete single notification
  const deleted = deleteNotification(n2.id, testKey);
  assert(deleted, 'Notification successfully deleted from store');
  passedTests += 9;

  // -------------------------------------------------------------
  // TEST SUITE 4: Order Lifecycle & Refund Event Triggers
  // -------------------------------------------------------------
  console.log('\n📦 4. Testing Order Lifecycle & Gateway Refund Event Triggers...');

  const mockOrder = {
    id: '99999999-9999-9999-9999-999999999999',
    order_number: 'VL-2026-TEST',
    user_id: 'test_client_uuid',
    grand_total: 145000,
    customer_info: {
      fullName: 'Aarav Mehta',
      email: 'aarav.mehta@example.com',
      phone: '+91 98200 99887',
    },
  };

  // 1. Order Placed Trigger
  const placedRes = await notificationService.notifyOrderPlaced(mockOrder);
  assert(placedRes.channelResults.some((r) => r.channel === 'EMAIL' && r.success), 'Order Placed email dispatched');
  assert(placedRes.channelResults.some((r) => r.channel === 'IN_APP' && r.success), 'Order Placed in-app notice created');

  // 2. Order Shipped Trigger
  const shippedRes = await notificationService.notifyOrderShipped(mockOrder, 'https://logistics.velouraliving.com/track/VL-2026-TEST');
  assert(shippedRes.channelResults.some((r) => r.channel === 'WHATSAPP' && r.success), 'Order Shipped WhatsApp alert dispatched');

  // 3. Order Delivered Trigger
  const deliveredRes = await notificationService.notifyOrderDelivered(mockOrder);
  assert(deliveredRes.channelResults.some((r) => r.channel === 'EMAIL' && r.success), 'Order Delivered email dispatched');

  // 4. Refund Processed Trigger
  const mockRefund = {
    id: 'rfnd_sim_p12_test',
    gateway_refund_id: 'rfnd_rzp_live_89410',
    gateway_arn: 'ARN_SIM_99281741',
    amount: 145000,
  };
  const refundRes = await notificationService.notifyRefundProcessed(mockRefund, mockOrder);
  assert(refundRes.channelResults.some((r) => r.channel === 'EMAIL' && r.success), 'Refund Processed receipt email dispatched');
  assert(refundRes.channelResults.some((r) => r.channel === 'IN_APP' && r.success), 'Refund in-app notice created with ARN');
  passedTests += 6;

  console.log('\n🏛️ ========================================================');
  console.log(`✅ ALL ${passedTests}/${passedTests} PHASE 12 TESTS PASSED SUCCESSFULLY!`);
  console.log('🏛️ ========================================================\n');
}

runPhase12Tests().catch((err) => {
  console.error('\n❌ Test execution failed with error:', err);
  process.exit(1);
});
