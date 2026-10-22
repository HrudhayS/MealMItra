import { Router } from 'express';
import { foodLoopDataStore } from '../services/donationService.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

// GET /api/dashboard/stats - Real calculated statistics
router.get('/stats', (req, res) => {
  try {
    const stats = foodLoopDataStore.getDashboardStats();
    res.json({ success: true, data: stats });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/reports - Submit food safety or listing complaint
router.post('/reports', authenticate, (req, res) => {
  try {
    const { donationId, reason, details } = req.body;
    if (!donationId || !reason) {
      return res.status(400).json({ error: 'donationId and reason are required.' });
    }
    const report = foodLoopDataStore.submitReport(donationId, reason, details, req.user);
    res.status(201).json({ success: true, data: report });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

export default router;
