import { Request, Response } from 'express'
import User from '../models/User'
import { checkPassword, hashPassword } from '../utils/auth'
import Token from '../models/Token'
import { generateToken } from '../utils/token'
import { AuthEmail } from '../emails/AuthEmail'
import { generateJWT } from '../utils/jwt'

export class AuthController {

    static createAccount = async (req: Request, res: Response) => {
        try {
            const { password, email } = req.body

            //Prevenir duplicados
            const userExists = await User.findOne({ email })
            if (userExists) {
                const error = new Error('El usuario ya está registrado.')
                res.status(409).json({ error: error.message })
                return
            }

            //Crea un usuario
            const auth = new User(req.body)

            //Hash Password
            auth.password = await hashPassword(password)

            //Generar token
            const token = new Token()
            token.token = generateToken()
            token.user = auth.id

            //Enviar Email
            AuthEmail.sendConfirmationEmail({
                email: auth.email,
                name: auth.name,
                token: token.token
            })

            await Promise.allSettled([auth.save(), token.save()])
            res.send('Cuenta creada. Revisa tu email para confirmarla.')
        } catch (error) {
            res.status(500).json({ error: 'Hubo un error' })
        }
    }

    static confirmAccount = async (req: Request, res: Response) => {
        try {
            const { token } = req.body

            const tokenExists = await Token.findOne({ token })
            if (!tokenExists) {
                const error = new Error('Token no válido')
                res.status(404).json({ error: error.message })
                return
            }

            const user = await User.findById(tokenExists.user)
            user.confirmed = true

            await Promise.allSettled([user.save(), tokenExists.deleteOne()])
            res.send('Cuenta confirmada correctamente')

        } catch (error) {
            res.status(500).json({ error: 'Hubo un error' })
        }
    }

    static login = async (req: Request, res: Response) => {
        try {
            const { email, password } = req.body
            const user = await User.findOne({ email })

            if (!user) {
                const error = new Error('El usuario no existe.')
                res.status(404).json({ error: error.message })
                return
            }

            if (!user.confirmed) {
                const token = new Token()
                token.user = user.id
                token.token = generateToken()
                await token.save()

                //Enviar email
                AuthEmail.sendConfirmationEmail({
                    email: user.email,
                    name: user.name,
                    token: token.token
                })

                const error = new Error('El usuario no ha confirmado su cuenta. Hemos enviado otro email de confirmación.')
                res.status(401).json({ error: error.message })
                return
            }

            //Revisar password
            const isPasswordCorrect = await checkPassword(password, user.password)
            if (!isPasswordCorrect) {
                const error = new Error('Password incorrecto')
                res.status(401).json({ error: error.message })
                return
            }

            const token = generateJWT({ id: user.id })
            res.send(token)
        } catch (error) {
            res.status(500).json({ error: 'Hubo un error' })
        }
    }

    static requestConfirmationCode = async (req: Request, res: Response) => {
        try {
            const { email } = req.body

            //Verificar que el usuario exista
            const auth = await User.findOne({ email })
            if (!auth) {
                const error = new Error('El usuario no está registrado.')
                res.status(404).json({ error: error.message })
                return
            }

            if (auth.confirmed) {
                const error = new Error('El usuario ya está registrado.')
                res.status(403).json({ error: error.message })
                return
            }

            //Generar token
            const token = new Token()
            token.token = generateToken()
            token.user = auth.id

            //Enviar Email
            AuthEmail.sendConfirmationEmail({
                email: auth.email,
                name: auth.name,
                token: token.token
            })

            await Promise.allSettled([auth.save(), token.save()])
            res.send('Se envió un nuevo token a tu email.')
        } catch (error) {
            res.status(500).json({ error: 'Hubo un error' })
        }
    }

    static forgotPassword = async (req: Request, res: Response) => {
        try {
            const { email } = req.body

            //Verificar que el usuario exista
            const auth = await User.findOne({ email })
            if (!auth) {
                const error = new Error('El usuario no está registrado.')
                res.status(404).json({ error: error.message })
                return
            }

            //Generar token
            const token = new Token()
            token.token = generateToken()
            token.user = auth.id
            await token.save()

            //Enviar Email
            AuthEmail.sendPasswordResetToken({
                email: auth.email,
                name: auth.name,
                token: token.token
            })
            res.send('Revisa tu email para instrucciones.')
        } catch (error) {
            res.status(500).json({ error: 'Hubo un error' })
        }
    }

    static validateToken = async (req: Request, res: Response) => {
        try {
            const { token } = req.body

            const tokenExists = await Token.findOne({ token })
            if (!tokenExists) {
                const error = new Error('Token no válido')
                res.status(404).json({ error: error.message })
                return
            }
            res.send('Token válido. Define tu nuevo password.')

        } catch (error) {
            res.status(500).json({ error: 'Hubo un error' })
        }
    }

    static updatePasswordWithToken = async (req: Request, res: Response) => {
        try {
            const { token } = req.params
            const { password } = req.body

            const tokenExists = await Token.findOne({ token })
            if (!tokenExists) {
                const error = new Error('Token no válido')
                res.status(404).json({ error: error.message })
                return
            }

            const auth = await User.findById(tokenExists.user)
            auth.password = await hashPassword(password)

            await Promise.allSettled([auth.save(), tokenExists.deleteOne()])
            res.send('El password se modificó correctamente.')
        } catch (error) {
            res.status(500).json({ error: 'Hubo un error' })
        }
    }

    static user = async (req: Request, res: Response) => {
        res.json(req.user)
        return
    }

    static updateProfile = async (req: Request, res: Response) => {
        const { name, email } = req.body

        const userExists = await User.findOne({ email })
        if (userExists && userExists.id.toString() !== req.user.id.toString()) {
            const error = new Error('Ese email ya está registrado')
            res.status(409).json({ error: error.message })
            return
        }

        req.user.name = name
        req.user.email = email

        try {
            await req.user.save()
            res.send('Perfil actualizado correctamente')
        } catch (error) {
            res.status(500).send('Hubo un error')
        }
    }

    static updateCurrentUserPassword = async (req: Request, res: Response) => {
        const { current_password, password } = req.body

        const user = await User.findById(req.user.id)

        const isPasswordCorrect = await checkPassword(current_password, user.password)
        if (!isPasswordCorrect) {
            const error = new Error('El password actual es incorrecto')
            res.status(401).json({ error: error.message })
            return
        }

        try {
            user.password = await hashPassword(password)
            await user.save()
            res.send('El password se modificó correctamente')
        } catch (error) {
            res.status(500).send('Hubo un error')
        }
    }

    static checkPassword = async (req: Request, res: Response) => {
        const { password } = req.body

        const user = await User.findById(req.user.id)

        const isPasswordCorrect = await checkPassword(password, user.password)
        if (!isPasswordCorrect) {
            const error = new Error('El password es incorrecto')
            res.status(401).json({ error: error.message })
            return
        }
        res.send('Password correcto')
    }
}