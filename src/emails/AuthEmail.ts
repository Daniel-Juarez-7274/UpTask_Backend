import { transporter } from '../config/nodemailer'

interface IEmail {
    email: string
    name: string
    token: String
}

export class AuthEmail {
    static sendConfirmationEmail = async (auth: IEmail) => {
        await transporter.sendMail({
            from: 'UpTask <admin@uptask.com>',
            to: auth.email,
            subject: 'UpTask - Confirma tu cuenta',
            text: `Hola ${auth.name}, por favor, confirma tu cuenta haciendo click a continuación: 
                http://localhost:5173/confirm-account/${auth.token}`,
            html:
                `
                <div style="font-family: Arial, sans-serif; color: #333; background-color: #f4f4f4; 
                    padding: 20px; border-radius: 8px;"> 
                    <div style="max-width: 600px; margin: 0 auto; background-color: white; padding: 20px; 
                        border-radius: 8px; box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);"> 
                        <h2 style="color: #444; text-align: center;">
                            ¡Bienvenido a UpTask, ${auth.name}!
                        </h2> 
                        <p style="font-size: 16px; line-height: 1.5; color: #555;"> 
                            Has creado tu cuenta en <strong>UpTask</strong>, ¡ya casi está todo listo! 
                            Solo debes confirmar tu cuenta para poder usarla. 
                        </p> 
                        <p style="font-size: 16px; line-height: 1.5; color: #555;"> 
                            Para confirmar tu cuenta, visita el siguiente enlace: 
                        </p> 
                        <div style="text-align: center; margin: 20px 0;"> 
                            <a href="${process.env.FRONTEND_URL}/auth/confirm-account" style="display: inline-block; padding: 10px 20px; background-color: #4CAF50; 
                            color: white; text-decoration: none; font-weight: bold; border-radius: 5px;">
                                Confirmar Cuenta
                            </a> 
                        </div> 
                        <p style="font-size: 16px; line-height: 1.5; color: #555;"> 
                            También puedes ingresar el siguiente código para confirmar tu cuenta: 
                        </p> 
                        <div style="text-align: center; font-size: 18px; font-weight: bold; margin: 20px 0;"> 
                            ${auth.token}
                        </div> 
                        <p style="font-size: 16px; line-height: 1.5; color: #555;"> <strong>Nota:</strong> 
                            Este token expira en 10 minutos. 
                        </p> 
                        <p style="text-align: center; color: #999; font-size: 14px; margin-top: 20px;">
                            Si no has solicitado esta cuenta, puedes ignorar este mensaje.
                        </p> 
                    </div> 
                </div>
            `
        })
    }

    static sendPasswordResetToken = async (auth: IEmail) => {
        await transporter.sendMail({
            from: 'UpTask <admin@uptask.com>',
            to: auth.email,
            subject: 'UpTask - Reestablece tu password',
            text: `Hola ${auth.name}, has solicitado reestablecer tu password.
                Visita el siguiente enlace: http://localhost:5173/new-password`,
            html:
                `
                <div style="font-family: Arial, sans-serif; color: #333; background-color: #f4f4f4; 
                    padding: 20px; border-radius: 8px;"> 
                    <div style="max-width: 600px; margin: 0 auto; background-color: white; padding: 20px; 
                        border-radius: 8px; box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);"> 
                        <h2 style="color: #444; text-align: center;">
                            ¡Aquí tienes tu código para recuperar tu cuenta, ${auth.name}!
                        </h2> 
                        <p style="font-size: 16px; line-height: 1.5; color: #555;"> 
                            Para recuperar tu cuenta, visita el siguiente enlace: 
                        </p> 
                        <div style="text-align: center; margin: 20px 0;"> 
                            <a href="${process.env.FRONTEND_URL}/auth/new-password" style="display: inline-block; padding: 10px 20px; background-color: #4CAF50; 
                            color: white; text-decoration: none; font-weight: bold; border-radius: 5px;">
                                Reestablecer Password
                            </a> 
                        </div> 
                        <p style="font-size: 16px; line-height: 1.5; color: #555;"> 
                            E ingresa el código:
                        </p> 
                        <div style="text-align: center; font-size: 18px; font-weight: bold; margin: 20px 0;"> 
                            ${auth.token}
                        </div> 
                        <p style="font-size: 16px; line-height: 1.5; color: #555;"> <strong>Nota:</strong> 
                            Este token expira en 10 minutos. 
                        </p> 
                        <p style="text-align: center; color: #999; font-size: 14px; margin-top: 20px;">
                            Si no has solicitado esta cuenta, puedes ignorar este mensaje.
                        </p> 
                    </div> 
                </div>
            `
        })
    }
}