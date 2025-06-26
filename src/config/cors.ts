import { CorsOptions } from 'cors'

const whiteList = [
    process.env.FRONTEND_URL,
    'http://localhost:5173'
].filter(Boolean);

export const corsConfig: CorsOptions = {
    origin: function (origin, callback) {
        
        if (!origin || whiteList.includes(origin)) {
            callback(null, true);
        } else {
            console.error('CORS bloqueado para el origen:', origin);
            callback(new Error('Error de CORS'));
        }
    },
    credentials: true
};