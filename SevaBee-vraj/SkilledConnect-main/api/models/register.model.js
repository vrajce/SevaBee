import mongoose from 'mongoose';
const { Schema } = mongoose;

const registerSchema = new Schema({
    username: {
        type: String,
        required: true,
        unique: true,
    },
    mobileNumber: {
        type: String,
        required: true,
        unique: true
    }
}, {
    timestamps: true
});

export default mongoose.model("Register", registerSchema);