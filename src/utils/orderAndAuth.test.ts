import test from 'node:test';
import assert from 'node:assert/strict';
import {
  authService,
  ADMIN_SECRET_CODE,
  DEFAULT_DEMO_PASSWORD,
  validatePasswordRules,
  validateGmailAddress,
  validatePakistaniPhone,
} from './authService';
import { orderService } from './orderService';
import { aboutService } from './aboutService';
import { getUrduPriceWords, audioVoiceEngine, formatWeight, WEIGHT_OPTIONS, TVC_MALE_MANDI_SPEECH, GIRL_MANDI_SPEECH } from './audioVoiceEngine';

test('authService initializes with default users and can authenticate with password', () => {
  const users = authService.getUsers();
  assert.ok(users.length >= 2, 'Default users exist');

  // Login as admin with correct email and password (8-20 chars)
  const adminRes = authService.login('admin@sabzimandi.pk', DEFAULT_DEMO_PASSWORD, 'admin');
  assert.equal(adminRes.success, true);
  assert.equal(adminRes.user?.role, 'admin');

  // Login as customer with correct email and password
  const custRes = authService.login('customer@sabzimandi.pk', DEFAULT_DEMO_PASSWORD, 'customer');
  assert.equal(custRes.success, true);
  assert.equal(custRes.user?.role, 'customer');

  // Login with wrong password fails
  const wrongPass = authService.login('customer@sabzimandi.pk', 'WrongPassword123', 'customer');
  assert.equal(wrongPass.success, false);
  assert.ok(wrongPass.error?.includes('Incorrect password'));
});

test('authService enforces password length rules (not less than 8 and not more than 20 characters)', () => {
  // Too short (< 8 chars)
  const shortCheck = validatePasswordRules('short7');
  assert.equal(shortCheck.valid, false);
  assert.ok(shortCheck.error?.includes('not be less than 8 characters'));

  // Too long (> 20 chars)
  const longCheck = validatePasswordRules('thisPasswordIsWayTooLongForMandi2026');
  assert.equal(longCheck.valid, false);
  assert.ok(longCheck.error?.includes('not be more than 20 characters'));

  // Exactly 8 chars (valid)
  const minValid = validatePasswordRules('Pass1234');
  assert.equal(minValid.valid, true);

  // Exactly 20 chars (valid)
  const maxValid = validatePasswordRules('12345678901234567890');
  assert.equal(maxValid.valid, true);

  // Signup with < 8 chars fails
  const failSignupShort = authService.signup({
    name: 'Short Tester',
    email: 'shortpass@gmail.com',
    password: 'short',
    phone: '0300-1111111',
    address: 'Islamabad',
    role: 'customer',
  });
  assert.equal(failSignupShort.success, false);
  assert.ok(failSignupShort.error?.includes('8 characters'));

  // Signup with > 20 chars fails
  const failSignupLong = authService.signup({
    name: 'Long Tester',
    email: 'longpass@gmail.com',
    password: 'superlongpasswordexceedingtwenty',
    phone: '0300-1111111',
    address: 'Islamabad',
    role: 'customer',
  });
  assert.equal(failSignupLong.success, false);
  assert.ok(failSignupLong.error?.includes('20 characters'));
});

test('authService validates correct Gmail addresses (@gmail.com)', () => {
  // Non-Gmail addresses fail
  const nonGmail = validateGmailAddress('buyer@yahoo.com');
  assert.equal(nonGmail.valid, false);
  assert.ok(nonGmail.error?.includes('@gmail.com'));

  // Invalid format fails
  const malformed = validateGmailAddress('te st@gmail.com');
  assert.equal(malformed.valid, false);

  // Valid Gmail succeeds
  const validGmail = validateGmailAddress('freshmandi.buyer@gmail.com');
  assert.equal(validGmail.valid, true);

  // System authorized demo accounts succeed
  assert.equal(validateGmailAddress('admin@sabzimandi.pk').valid, true);
  assert.equal(validateGmailAddress('customer@sabzimandi.pk').valid, true);
});

test('authService allows new customer and admin signups with Gmail and secret code verification', () => {
  // Customer signup succeeds with valid Gmail and 8-20 char password
  const custRes = authService.signup({
    name: 'Zeeshan Tariq',
    email: 'zeeshan.tariq@gmail.com',
    password: 'ZeeshanPass123',
    phone: '0345-1234567',
    address: 'G-11, Islamabad',
    role: 'customer',
  });
  assert.equal(custRes.success, true);
  assert.equal(custRes.user?.name, 'Zeeshan Tariq');
  assert.equal(custRes.user?.role, 'customer');

  // Admin signup without secret code fails
  const failedAdminRes = authService.signup({
    name: 'Fake Admin',
    email: 'fake.admin@gmail.com',
    password: 'AdminPassword99',
    phone: '0300-0000000',
    address: 'Unknown',
    role: 'admin',
    adminSecretCode: '1234',
  });
  assert.equal(failedAdminRes.success, false);

  // Admin signup with secret code succeeds
  const successAdminRes = authService.signup({
    name: 'Malik Zahid',
    email: 'malik.zahid.admin@gmail.com',
    password: 'MandiAdminPass786',
    phone: '0312-9876543',
    address: 'Operations Room 2',
    role: 'admin',
    adminSecretCode: ADMIN_SECRET_CODE,
  });
  assert.equal(successAdminRes.success, true);
  assert.equal(successAdminRes.user?.role, 'admin');
});

test('authService allows create and login directly with Google', () => {
  // Direct Google login for customer (creates account with Google authProvider)
  const googleCust = authService.loginWithGoogle({
    name: 'Web Dev Cartoon',
    email: 'webdevcartoon@gmail.com',
    role: 'customer',
  });
  assert.equal(googleCust.success, true);
  assert.equal(googleCust.user?.authProvider, 'google');
  assert.equal(googleCust.user?.isGoogleVerified, true);
  assert.equal(googleCust.user?.role, 'customer');

  // Direct Google login for new Admin without secret code fails
  const failGoogleAdmin = authService.loginWithGoogle({
    name: 'Unverified Admin',
    email: 'unverified.admin@gmail.com',
    role: 'admin',
    adminSecretCode: 'WRONG_CODE',
  });
  assert.equal(failGoogleAdmin.success, false);
  assert.ok(failGoogleAdmin.error?.includes('Admin Secret Passcode'));

  // Direct Google login for new Admin with valid secret code succeeds
  const successGoogleAdmin = authService.loginWithGoogle({
    name: 'Authorized Google Admin',
    email: 'authorized.admin@gmail.com',
    role: 'admin',
    adminSecretCode: ADMIN_SECRET_CODE,
  });
  assert.equal(successGoogleAdmin.success, true);
  assert.equal(successGoogleAdmin.user?.role, 'admin');
  assert.equal(successGoogleAdmin.user?.authProvider, 'google');
});

test('orderService creates customer buying request with Pending status', () => {
  const newOrder = orderService.createOrder({
    customerId: 'cust_test_1',
    customerName: 'Zeeshan Tariq',
    customerPhone: '0345-1234567',
    customerAddress: 'G-11, Islamabad',
    items: [
      {
        itemId: 'veg-01',
        name: 'Kaddu (Bottle Gourd)',
        urduName: 'کدو',
        pricePerKg: 100,
        quantityKg: 2,
        image: 'https://images.unsplash.com/photo-1506917728037-b6af01a7d403',
      },
    ],
    subtotal: 200,
    deliveryFee: 50,
    totalAmount: 250,
    notes: 'Please select tender Kaddu.',
  });

  assert.ok(newOrder.id);
  assert.ok(newOrder.orderNumber.startsWith('MANDI-'));
  assert.equal(newOrder.status, 'Pending');
  assert.equal(newOrder.totalAmount, 250);

  // Admin verifies the order
  const verifiedOrder = orderService.updateOrderStatus(
    newOrder.id,
    'Verified',
    'Haji Abdul Rehman (Mandi Admin)'
  );
  assert.equal(verifiedOrder?.status, 'Verified');
  assert.ok(verifiedOrder?.verifiedAt);
  assert.equal(verifiedOrder?.verifiedBy, 'Haji Abdul Rehman (Mandi Admin)');

  // Admin delivers the order
  const deliveredOrder = orderService.updateOrderStatus(
    newOrder.id,
    'Delivered',
    'Haji Abdul Rehman (Mandi Admin)'
  );
  assert.equal(deliveredOrder?.status, 'Delivered');
  assert.ok(deliveredOrder?.deliveredAt);
});

test('authService error messages do NOT leak the admin secret code during signup', () => {
  const failedSignup = authService.signup({
    name: 'Intruder',
    email: 'intruder@gmail.com',
    password: 'IntruderPass99',
    phone: '0300-1111111',
    address: 'HQ',
    role: 'admin',
    adminSecretCode: 'BAD_PASS',
  });
  assert.equal(failedSignup.success, false);
  assert.ok(failedSignup.error);
  assert.equal(
    failedSignup.error.includes(ADMIN_SECRET_CODE),
    false,
    'Secret code must not appear in signup error message'
  );
});

test('getUrduPriceWords converts vegetable prices to authentic street vendor Urdu words', () => {
  // Ghobi chaalis rupay kilo
  assert.equal(getUrduPriceWords(40), 'chaalis');
  // Band ghobi paintis rupay kilo
  assert.equal(getUrduPriceWords(35), 'paintis');
  // Aalo pachaas rupay kilo
  assert.equal(getUrduPriceWords(50), 'pachaas');
  // Tamatar / Bhindi saath rupay kilo
  assert.equal(getUrduPriceWords(60), 'saath');
  // Pyaz / Shimla mirch assi rupay kilo
  assert.equal(getUrduPriceWords(80), 'assi');
  // Harri Mirch aik sau bees rupay kilo
  assert.equal(getUrduPriceWords(120), 'aik sau bees');
  // Adrak teen sau chaalis rupay kilo
  assert.equal(getUrduPriceWords(340), 'teen sau chaalis');
  // Lehsan do sau assi rupay kilo
  assert.equal(getUrduPriceWords(280), 'do sau assi');
});

test('admin product operations: adding, updating and deleting products', () => {
  let products = [
    {
      id: 'veg-01',
      name: 'Kaddu (Bottle Gourd)',
      commonName: 'Kaddu',
      urduName: 'کدو',
      pricePerKg: 100,
      costPerKg: 70,
      currentStock: 35,
      minThreshold: 15,
      maxCapacity: 120,
    },
  ];

  // Admin adds new product
  const newProduct = {
    id: 'veg-gajar-101',
    name: 'Gajar (Red Sweet Carrots)',
    commonName: 'Gajar',
    urduName: 'گاجر',
    pricePerKg: 90,
    costPerKg: 65,
    currentStock: 50,
    minThreshold: 15,
    maxCapacity: 100,
  };
  products = [newProduct, ...products];
  assert.equal(products.length, 2);
  assert.equal(products[0].commonName, 'Gajar');

  // Admin edits product price & stock
  products = products.map((p) =>
    p.id === 'veg-gajar-101' ? { ...p, pricePerKg: 95, currentStock: 60 } : p
  );
  const updatedGajar = products.find((p) => p.id === 'veg-gajar-101');
  assert.equal(updatedGajar?.pricePerKg, 95);
  assert.equal(updatedGajar?.currentStock, 60);

  // Admin deletes product
  products = products.filter((p) => p.id !== 'veg-01');
  assert.equal(products.length, 1);
  assert.equal(products.some((p) => p.id === 'veg-01'), false);
});

test('orderService allows deleting delivered orders and individual items', () => {
  const testOrder = orderService.createOrder({
    customerId: 'cust_del_test',
    customerName: 'Kareem Buksh',
    customerPhone: '0300-9998877',
    customerAddress: 'Allama Iqbal Town, Lahore',
    items: [
      {
        itemId: 'veg-ghobi-01',
        name: 'Ghobi (Fresh Cauliflower)',
        urduName: 'گوبھی',
        pricePerKg: 40,
        quantityKg: 2,
        image: 'https://images.unsplash.com/photo-1568584711075-3d021a7c3ca3',
      },
      {
        itemId: 'veg-tamatar-02',
        name: 'Tamatar (Red Farm Tomatoes)',
        urduName: 'ٹماٹر',
        pricePerKg: 60,
        quantityKg: 3,
        image: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea',
      },
    ],
    subtotal: 260,
    deliveryFee: 50,
    totalAmount: 310,
    notes: 'Urgent delivery',
  });

  // Mark as Delivered
  orderService.updateOrderStatus(testOrder.id, 'Delivered', 'Admin Testing');
  let delivered = orderService.getOrders().find((o) => o.id === testOrder.id);
  assert.equal(delivered?.status, 'Delivered');

  // Admin deletes one product item from the delivered order
  const updatedOrder = orderService.deleteItemFromOrder(testOrder.id, 'veg-tamatar-02');
  assert.equal(updatedOrder?.items.length, 1);
  assert.equal(updatedOrder?.items[0].itemId, 'veg-ghobi-01');
  assert.equal(updatedOrder?.subtotal, 80); // 2kg * 40

  // Admin permanently deletes the delivered order from records
  const deleteResult = orderService.deleteOrder(testOrder.id);
  assert.equal(deleteResult, true);
  assert.equal(orderService.getOrders().some((o) => o.id === testOrder.id), false);
});

test('MANDI_RATE_ANNOUNCEMENTS provides natural girl voice calling all vegetables with Aao bhai taza', async () => {
  const { MANDI_RATE_ANNOUNCEMENTS, GIRL_MANDI_SPEECH, audioVoiceEngine } = await import('./audioVoiceEngine');
  assert.ok(MANDI_RATE_ANNOUNCEMENTS.length >= 1, 'Provides girl voice rate announcement');
  
  // Confirms all vegetables, weights, and "mandi se laaye hain taza taza" are called in the girl voice script
  const script = GIRL_MANDI_SPEECH.roman.toLowerCase();
  assert.ok(script.includes('aao bhai taza'));
  assert.ok(script.includes('mandi se laaye hain taza taza'));
  assert.ok(script.includes('ghobi'));
  assert.ok(script.includes('tamatar'));
  assert.ok(script.includes('pyaz'));
  assert.ok(script.includes('aalo'));
  assert.ok(script.includes('bhindi'));
  assert.ok(script.includes('delivery'));
  assert.ok(script.includes('100 gram'));

  // Confirms startFiveMinuteBackgroundRateCycle starts and stops the cycle
  audioVoiceEngine.startFiveMinuteBackgroundRateCycle();
  const state = audioVoiceEngine.getBackgroundVoiceState();
  assert.equal(state.isActive, true);
  audioVoiceEngine.stopBackgroundRateCycle();
  assert.equal(audioVoiceEngine.getBackgroundVoiceState().isActive, false);
});

test('authService allows editing customer and admin details', () => {
  // Sign up a test customer
  const cust = authService.signup({
    name: 'Asim Rauf',
    email: 'asim.rauf@gmail.com',
    password: 'AsimPassword123',
    phone: '0321-1122334',
    address: 'Sector F-7, Islamabad',
    role: 'customer',
  });
  assert.equal(cust.success, true);
  const userId = cust.user!.id;

  // Edit the customer
  const updateRes = authService.updateUser(userId, {
    name: 'Asim Rauf Khan',
    phone: '0321-9988776',
    address: 'Sector F-7/2, Street 14, Islamabad',
  });
  assert.equal(updateRes.success, true);
  assert.equal(updateRes.user?.name, 'Asim Rauf Khan');
  assert.equal(updateRes.user?.phone, '0321-9988776');

  // Verify in getUsers
  const updatedInList = authService.getUsers().find((u) => u.id === userId);
  assert.equal(updatedInList?.name, 'Asim Rauf Khan');
  assert.equal(updatedInList?.address, 'Sector F-7/2, Street 14, Islamabad');
});

test('authService allows deleting customer and protects last remaining administrator', () => {
  // Create a customer to delete
  const tempCust = authService.signup({
    name: 'Temporary Buyer',
    email: 'temp.buyer@gmail.com',
    password: 'TemporaryPass123',
    phone: '0345-0011223',
    address: 'Rawalpindi',
    role: 'customer',
  });
  assert.equal(tempCust.success, true);
  const tempCustId = tempCust.user!.id;

  // Delete the customer
  const delCustRes = authService.deleteUser(tempCustId);
  assert.equal(delCustRes.success, true);
  assert.equal(authService.getUsers().some((u) => u.id === tempCustId), false);

  // Attempting to delete the ONLY admin fails safely
  const adminUsers = authService.getUsers().filter((u) => u.role === 'admin');
  if (adminUsers.length === 1) {
    const delAdminRes = authService.deleteUser(adminUsers[0].id);
    assert.equal(delAdminRes.success, false);
    assert.ok(delAdminRes.error?.includes('At least one admin'));
  }
});

test('authService allows password change with strict 8-20 character validation', () => {
  // Sign up a user
  const user = authService.signup({
    name: 'Qasim Tariq',
    email: 'qasim.tariq@gmail.com',
    password: 'InitialPassword1',
    phone: '0300-1234567',
    address: 'Rawalpindi',
    role: 'customer',
  });
  assert.equal(user.success, true);
  const userId = user.user!.id;

  // Try updating with password < 8 characters
  const shortRes = authService.updateUser(userId, {
    password: 'short',
  });
  assert.equal(shortRes.success, false);
  assert.ok(shortRes.error?.includes('8 characters'));

  // Try updating with password > 20 characters
  const longRes = authService.updateUser(userId, {
    password: 'thisIsMoreThanTwentyCharactersLongPassword',
  });
  assert.equal(longRes.success, false);
  assert.ok(longRes.error?.includes('20 characters'));

  // Update with valid 8-20 character password
  const validRes = authService.updateUser(userId, {
    password: 'NewSecurePass2026',
  });
  assert.equal(validRes.success, true);
  assert.equal(validRes.user?.password, 'NewSecurePass2026');

  // Verify old password fails login
  const oldLogin = authService.login('qasim.tariq@gmail.com', 'InitialPassword1', 'customer');
  assert.equal(oldLogin.success, false);

  // Verify new password succeeds login
  const newLogin = authService.login('qasim.tariq@gmail.com', 'NewSecurePass2026', 'customer');
  assert.equal(newLogin.success, true);
});

test('authService anti-hacker rate limiter triggers lockout after 5 failed login attempts', () => {
  const targetEmail = 'fatimazahra@gmail.com';

  // Perform 4 failed logins
  for (let i = 0; i < 4; i++) {
    const res = authService.login(targetEmail, 'WrongPassword1', 'customer');
    assert.equal(res.success, false);
    assert.ok(res.error?.includes('attempt'));
  }

  // 5th failed attempt triggers lockout
  const fifthAttempt = authService.login(targetEmail, 'WrongPassword1', 'customer');
  assert.equal(fifthAttempt.success, false);
  assert.ok(fifthAttempt.error?.includes('Hacker-Shield Lockout') || fifthAttempt.error?.includes('5 failed attempts'));

  // Check isAccountLocked returns true
  const lockStatus = authService.isAccountLocked(targetEmail);
  assert.equal(lockStatus.locked, true);
  assert.ok(lockStatus.remainingSeconds && lockStatus.remainingSeconds > 0);

  // 6th attempt is blocked immediately by rate limiter
  const sixthAttempt = authService.login(targetEmail, 'WrongPassword1', 'customer');
  assert.equal(sixthAttempt.success, false);
  assert.ok(sixthAttempt.error?.includes('Hacker-Shield Activated'));
});

test('audioVoiceEngine supports natural girl voice, Aao bhai taza announcement, and weight options', () => {
  // Check girl voice speech script
  assert.ok(GIRL_MANDI_SPEECH.roman.includes('Adrak ghano') || GIRL_MANDI_SPEECH.roman.includes('Tamatar ghano'));
  assert.ok(GIRL_MANDI_SPEECH.roman.includes('mandi se laaye hain'));
  assert.ok(GIRL_MANDI_SPEECH.urdu.includes('ادرک گھنو') || GIRL_MANDI_SPEECH.urdu.includes('ٹماٹر گھنو'));
  assert.ok(GIRL_MANDI_SPEECH.urdu.includes('آلو گھنو') || GIRL_MANDI_SPEECH.urdu.includes('سبزیاں'));

  // Check Weight Options (100g, 250g, 500g, 1kg, 1.5kg, 2kg, 5kg, and custom)
  assert.equal(WEIGHT_OPTIONS.length, 8);
  const ids = WEIGHT_OPTIONS.map((w) => w.id);
  assert.deepEqual(ids, ['100g', '250g', '500g', '1kg', '1.5kg', '2kg', '5kg', 'custom']);

  // Check formatWeight utility
  assert.equal(formatWeight(0.1), '100g');
  assert.equal(formatWeight(0.25), '250g');
  assert.equal(formatWeight(0.5), '500g');
  assert.equal(formatWeight(1), '1 kg');
  assert.equal(formatWeight(1.5), '1.5 kg');
  assert.equal(formatWeight(2), '2 kg');
  assert.equal(formatWeight(5), '5 kg');
  assert.equal(formatWeight(10), '10 kg');

  // Verify voice engine start / stop methods
  assert.equal(typeof audioVoiceEngine.playElevenLabsMandiOverview, 'function');
  assert.equal(typeof audioVoiceEngine.stopSpeaking, 'function');
  assert.equal(typeof audioVoiceEngine.speakItem, 'function');
  assert.equal(typeof audioVoiceEngine.findGirlVoice, 'function');
  assert.equal(typeof audioVoiceEngine.speakGirlVoice, 'function');
});

test('validatePakistaniPhone enforces strict 11-digit Pakistani mobile numbers starting with 03', () => {
  // Valid numbers
  const valid1 = validatePakistaniPhone('03001234567');
  assert.equal(valid1.valid, true);
  assert.equal(valid1.normalized, '03001234567');

  const valid2 = validatePakistaniPhone('0321-9876543');
  assert.equal(valid2.valid, true);
  assert.equal(valid2.normalized, '03219876543');

  const valid3 = validatePakistaniPhone('+923335551234');
  assert.equal(valid3.valid, true);
  assert.equal(valid3.normalized, '03335551234');

  const valid4 = validatePakistaniPhone('923451122334');
  assert.equal(valid4.valid, true);
  assert.equal(valid4.normalized, '03451122334');

  // Invalid numbers
  assert.equal(validatePakistaniPhone('').valid, false);
  assert.equal(validatePakistaniPhone('0300123456').valid, false); // 10 digits
  assert.equal(validatePakistaniPhone('030012345678').valid, false); // 12 digits
  assert.equal(validatePakistaniPhone('04231234567').valid, false); // Not starting with 03
  assert.equal(validatePakistaniPhone('0300abcd123').valid, false); // Non-digit characters
});

test('authService allows updating admin secret code and strictly validates signup with the updated code', () => {
  // Update admin secret code
  const newSecret = 'SUPERMANDI2026';
  const updateRes = authService.updateAdminSecretCode(newSecret);
  assert.equal(updateRes.success, true);
  assert.equal(authService.getAdminSecretCode(), newSecret);

  // Verifying old secret code fails
  assert.equal(authService.verifyAdminSecretCode('WRONGCODE123'), false);
  assert.equal(authService.verifyAdminSecretCode(newSecret), true);

  // Signup with new secret code succeeds
  const adminSignup = authService.signup({
    name: 'New Authorized Admin',
    email: 'newadmin2026@gmail.com',
    password: 'SecureAdminPass1',
    phone: '03019876543',
    address: 'Central Sabzi Mandi Hub Office #8',
    role: 'admin',
    adminSecretCode: newSecret,
  });
  assert.equal(adminSignup.success, true);
  assert.equal(adminSignup.user?.role, 'admin');

  // Signup with wrong secret code fails
  const failedAdmin = authService.signup({
    name: 'Unauthorized User',
    email: 'fakeadmin@gmail.com',
    password: 'SecureAdminPass1',
    phone: '03019876544',
    address: 'City',
    role: 'admin',
    adminSecretCode: 'INCORRECT_CODE',
  });
  assert.equal(failedAdmin.success, false);
});

test('aboutService provides default data and allows authorized updates and resets', () => {
  const currentData = aboutService.getData();
  assert.ok(currentData.title);
  assert.ok(currentData.titleUrdu);
  assert.ok(currentData.phone);
  assert.ok(currentData.operatingHours);

  // Update about data
  const updateRes = aboutService.updateData(
    {
      title: 'Central Sabzi Mandi Punjab (Updated)',
      phone: '03007860110',
    },
    'Haji Abdul Rehman (Admin)'
  );
  assert.equal(updateRes.success, true);
  assert.equal(aboutService.getData().title, 'Central Sabzi Mandi Punjab (Updated)');

  // Reset to verified defaults
  const resetData = aboutService.resetToDefault('Admin');
  assert.equal(resetData.title, 'Central Sabzi Mandi Punjab');
});
