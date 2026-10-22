import { Router } from 'express';
import { foodLoopDataStore } from '../services/donationService.js';
import { authenticate, authorizeRole } from '../middleware/auth.js';

const router = Router();

// GET /api/requests - List authorized donation requests
router.get('/', authenticate, (req, res) => {
  try {
    const requests = foodLoopDataStore.listRequests(req.user);
    res.json({ success: true, count: requests.length, data: requests });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/requests/:id - Retrieve single request
router.get('/:id', authenticate, (req, res) => {
  try {
    const request = foodLoopDataStore.getRequestById(req.params.id);
    if (!request) return res.status(404).json({ error: 'Request not found' });
    res.json({ success: true, data: request });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/requests - Submit a donation request (Recipient Organizations Only)
router.post('/', authenticate, authorizeRole(['recipient', 'admin']), (req, res) => {
  try {
    const newRequest = foodLoopDataStore.createRequest(req.body, req.user);
    res.status(201).json({ success: true, data: newRequest });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// PATCH /api/requests/:id/status - Accept, decline, cancel, or complete a request
router.patch('/:id/status', authenticate, (req, res) => {
  try {
    const { status, notes } = req.body;
    if (!status) {
      return res.status(400).json({ error: 'Status field is required.' });
    }
    const updated = foodLoopDataStore.updateRequestStatus(req.params.id, status, req.user, notes);
    res.json({ success: true, data: updated });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// PATCH /api/requests/:id/assign-volunteer - Assign volunteer to assist delivery
router.patch('/:id/assign-volunteer', authenticate, (req, res) => {
  try {
    const volunteerUser = req.user || { uid: 'usr_volunteer_alex', displayName: 'Volunteer Runner' };
    const updated = foodLoopDataStore.assignVolunteer(req.params.id, volunteerUser);
    res.json({ success: true, data: updated });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// GET /api/requests/:id/messages - Retrieve conversation history for a request
router.get('/:id/messages', authenticate, (req, res) => {
  try {
    const messages = foodLoopDataStore.getMessagesForRequest(req.params.id);
    res.json({ success: true, data: messages });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/requests/:id/messages - Send a message in a request conversation thread
router.post('/:id/messages', authenticate, (req, res) => {
  try {
    const { text } = req.body;
    const message = foodLoopDataStore.addMessage(req.params.id, text, req.user);
    res.status(201).json({ success: true, data: message });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

export default router;
