import express from 'express';
import { register, login , getCurrentUser  } from '../controllers/authController.js';
import { protect } from '../middleware/authMiddleware.js';
import { cookieWithJwt } from '../middleware/cookieWithJwt.js';

const router = express.Router();
router.post('/register', register );
router.post('/login', login ); 
router.get('/me', cookieWithJwt, getCurrentUser); // Route to get the current user's details, protected by the auth middleware


router.get('/test', protect, (req, res) => { //a test route to check if the auth route is working
    res.json({ message: 'Auth route is working' });
});

export default router;