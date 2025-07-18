import { Router } from 'express'
import { body, param } from 'express-validator'
import { AuthController } from '../controllers/AuthController'
import { handleInputErrors } from '../middleware/validation'
import { authenticate } from '../middleware/auth'

const router = Router()

router.post('/create-account',
    body('name').notEmpty().withMessage('El nombre no puede ir vacío.'),
    body('password').isLength({ min: 8 }).withMessage('El password es muy corto. Mínimo 8 caracteres.'),
    body('password_confirmation').custom((value, { req }) => {
        if (value !== req.body.password) {
            throw new Error('Los Password no son iguales')
        }
        return (true)
    }),
    body('email').isEmail().withMessage('E-mail no válido.'),

    handleInputErrors,
    AuthController.createAccount
)

router.post('/confirm-account',
    body('token').notEmpty().withMessage('El token no puede ir vacío.'),

    handleInputErrors,
    AuthController.confirmAccount
)

router.post('/login',
    body('email').isEmail().withMessage('E-mail no válido.'),
    body('password').notEmpty().withMessage('El password no puede estar vacío.'),

    handleInputErrors,
    AuthController.login
)

router.post('/request-code',
    body('email').isEmail().withMessage('E-mail no válido.'),

    handleInputErrors,
    AuthController.requestConfirmationCode
)

router.post('/forgot-password',
    body('email').isEmail().withMessage('E-mail no válido.'),

    handleInputErrors,
    AuthController.forgotPassword
)

router.post('/validate-token',
    body('token').notEmpty().withMessage('El token no puede ir vacío.'),

    handleInputErrors,
    AuthController.validateToken
)

router.post('/update-password/:token',
    param('token').isNumeric().withMessage('Token no válido'),
    body('password').isLength({ min: 8 }).withMessage('El password es muy corto. Mínimo 8 caracteres.'),
    body('password_confirmation').custom((value, { req }) => {
        if (value !== req.body.password) {
            throw new Error('Los Password no son iguales')
        }
        return true
    }),
    handleInputErrors,
    AuthController.updatePasswordWithToken
)

router.get('/user',
    authenticate,
    AuthController.user
)

/** Profile */

router.put('/profile',
    authenticate,

    body('name').notEmpty().withMessage('El nombre no puede ir vacío.'),
    body('email').isEmail().withMessage('E-mail no válido.'),

    handleInputErrors,
    AuthController.updateProfile
)

router.post('/change-password',
    authenticate,

    body('current_password').notEmpty().withMessage('El password actual no puede ir vacío.'),
    body('password').isLength({ min: 8 }).withMessage('El password es muy corto. Mínimo 8 caracteres.'),
    body('password_confirmation').custom((value, { req }) => {
        if (value !== req.body.password) {
            throw new Error('Los Password no son iguales')
        }
        return true
    }),

    handleInputErrors,
    AuthController.updateCurrentUserPassword
)

router.post('/check-password',
    authenticate,

    body('password').notEmpty().withMessage('El password actual no puede ir vacío.'),

    handleInputErrors,
    AuthController.checkPassword
)

export default router