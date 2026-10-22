import { Router } from 'express';
import { foodLoopDataStore } from '../services/donationService.js';
import { authenticate, authorizeRole } from '../middleware/auth.js';

const router = Router();

// GET /api/donations - Browse donations with search & filters
router.get('/', (req, res) => {
  try {
    const { search, category, status, storage, location } = req.query;
    const donations = foodLoopDataStore.listDonations({ search, category, status, storage, location });
    res.json({ success: true, count: donations.length, data: donations });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/donations/:id - Retrieve single donation details
router.get('/:id', (req, res) => {
  try {
    const donation = foodLoopDataStore.getDonationById(req.params.id);
    if (!donation) {
      return res.status(404).json({ error: 'Donation not found' });
    }
    res.json({ success: true, data: donation });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/donations - Create surplus food listing (Food Donors Only)
router.post('/', authenticate, authorizeRole(['donor', 'admin']), (req, res) => {
  try {
    const donation = foodLoopDataStore.createDonation(req.body, req.user);
    res.status(201).json({ success: true, data: donation });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// PUT /api/donations/:id - Update surplus food listing
router.put('/:id', authenticate, authorizeRole(['donor', 'admin']), (req, res) => {
  try {
    const updated = foodLoopDataStore.updateDonation(req.params.id, req.body, req.user);
    res.json({ success: true, data: updated });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// DELETE /api/donations/:id - Delete surplus food listing
router.delete('/:id', authenticate, authorizeRole(['donor', 'admin']), (req, res) => {
  try {
    const result = foodLoopDataStore.deleteDonation(req.params.id, req.user);
    res.json(result);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

export default router;
