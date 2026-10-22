import { Router } from 'express';
import { foodLoopDataStore } from '../services/donationService.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

// GET /api/organizations - List eligible organizations
router.get('/', (req, res) => {
  try {
    const orgs = foodLoopDataStore.getOrganizations();
    res.json({ success: true, count: orgs.length, data: orgs });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/organizations - Register new organization profile
router.post('/', authenticate, (req, res) => {
  try {
    const org = foodLoopDataStore.createOrganization(req.body);
    res.status(201).json({ success: true, data: org });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

export default router;
