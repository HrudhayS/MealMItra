import { Router } from 'express';
import { foodLoopDataStore } from '../services/donationService.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

// GET /api/system/status - Live database status and real-time count
router.get('/status', (req, res) => {
  try {
    const stats = {
      isRealTime: true,
      donationsCount: foodLoopDataStore.donations.length,
      requestsCount: foodLoopDataStore.requests.length,
      messagesCount: foodLoopDataStore.messages.length,
      reportsCount: foodLoopDataStore.reports.length,
      databaseType: 'Real-Time In-Memory & Cloud Datastore',
      timestamp: new Date().toISOString()
    };
    res.json({ success: true, data: stats });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/system/clear-data - Wipe all surplus donations and requests to test with blank slate
router.post('/clear-data', (req, res) => {
  try {
    const result = foodLoopDataStore.clearAllData();
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/system/seed-test - Add a real-time surplus batch
router.post('/seed-test', authenticate, (req, res) => {
  try {
    const newDonation = foodLoopDataStore.seedTestDonation(req.user);
    res.status(201).json({ success: true, data: newDonation, message: 'Real-time test donation published successfully.' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// POST /api/system/verify-crud - Run automated real-time CRUD and status operations test
router.post('/verify-crud', authenticate, (req, res) => {
  try {
    const testResults = foodLoopDataStore.verifyCrudOperations(req.user);
    res.json({ success: true, data: testResults });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
