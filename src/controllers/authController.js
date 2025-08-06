import bcrypt from 'bcrypt';
import prisma from '@prisma/client';
import { generateToken } from '../utils/generateToken.js';

const db = new prisma.PrismaClient();

export const register = async( req , res ) => {
    const { username , email, password } = req.body;
   
    // if( !username || !email || !password ){
    //     return res.status( 400 ).json({ error: "All fields are required" });
    // }else{
    //     const existingUser = await db.user.findUnique({
    //         where: { email }
    //     });

    //     if( existingUser ){
    //         return res.status( 400 ).json({ error: "User already exists" });
    //     }
    // }

    try{
        const salt = await bcrypt.genSalt(10);
        const hashpassword = await bcrypt.hash( password,  salt );
        const user = await db.user.create({
            data: { username, email , password: hashpassword },
        });

        res.json({ token: generateToken( user.id , user.role )})
    }catch( err ){
        res.status( 400 ).json({ error: err.message });
        }
};

export const login = async( req , res ) => {
    const { email, password } = req.body;   

    try{
        const user = await db.user.findUnique({
            where: { email }
        });

        if( !user ){
            return res.status( 400 ).json({ error: "User not found" });
        }

        const isMatch = await bcrypt.compare( password, user.password );
        if( !isMatch ){
            return res.status( 400 ).json({ error: "Invalid credentials" });
        }

        res.json({ token: generateToken( user.id , user.role )});
    }catch( err ){
        res.status( 400 ).json({ error: err.message });
    }
}