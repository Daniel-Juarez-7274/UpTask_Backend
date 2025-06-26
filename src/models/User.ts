import mongoose, { Schema, Document } from 'mongoose'

export interface IUser extends Document {
    email: string
    password: string
    name: string
    confirmed: boolean
}

const userSchema: Schema = new Schema({
    email: {
        type: String,
        requiered: true,
        lowercase: true,
        unique: true
    },
    password: {
        type: String,
        requiered: true
    },
    name: {
        type: String,
        requiered: true
    },
    confirmed: {
        type: Boolean,
        default: false
    }
})

const User = mongoose.model<IUser>('User', userSchema)

export default User