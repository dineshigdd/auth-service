import jwt from 'jsonwebtoken';

export const generateToken = ( id , role , secret , time ) => {
    console.log('Generating token with secret:', secret);
    if (!secret) {
        throw new Error('Secret key is required to generate token');
    }
    if (!time) {
        throw new Error('Expiration time is required to generate token');
    }
    try{
         const token = jwt.sign({ id , role }, secret , { expiresIn: time } );
         console.log('Generated token:', token);
        return token
    }catch(err){
        console.error('Error generating token:', err);
        throw new Error('Failed to generate token');
    }
    
}