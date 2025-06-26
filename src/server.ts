import express from 'express'
import dotenv from 'dotenv'
import cors from 'cors'
import morgan from 'morgan'
import { corsConfig } from './config/cors'
import { connectDB } from './config/db'
import authRoutes from './routes/authRoutes'
import projectRoutes from './routes/projectRoutes'

//Carga las variables de entorno definidas en el archivo .env al objeto process.env
dotenv.config()

//Conexión a la base de datos
connectDB()

//Inicializa la aplicación de Express
const app = express()

//Implementando cors
app.use(cors(corsConfig))

//Logging
app.use(morgan('dev'))

//Middleware para leer y procesar datos de formularios
app.use(express.json())

//Define las rutas de la API
app.use('/api/auth', authRoutes)
app.use('/api/projects', projectRoutes)

export default app