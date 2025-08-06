import express from 'express';
import { register, login  } from '../controllers/authController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();
router.post('/register', register );
router.post('/login', login ); 
router.get('/test', protect, (req, res) => { //a test route to check if the auth route is working
    res.json({ message: 'Auth route is working' });
});

export default router;