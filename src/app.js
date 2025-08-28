import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import cookieParser from 'cookie-parser'; 
import authRoutes from './routes/auth.js'


dotenv.config();

// Load the local .env.local file second,
// so its variables override the general ones.
dotenv.config({ path: '.env.local', override: true });


const app = express();
app.use( cors());
app.use( express.json());

//middlewares
app.use(cookieParser());
app.use('/auth',authRoutes );



app.get('/', ( req, res ) => res.send("Auth service Running"));

export default app;
