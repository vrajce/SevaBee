import user from "../models/user.model.js";
import registered from "../models/register.model.js";
import bcrypt from "bcrypt";

// export const register = async (req,res)=>{
//     try {
//         const {username , email , password , img , country, desc , isSeller} = req.body;
//         const checkExistingUser = await user.findOne({ $or : [{email},{username}]});

//         if(checkExistingUser){
//             return res.status(400).json({message : "User already exists"});
//         }

//         const salt = await bcrypt.genSalt(10);
//         const hashedPassword = await bcrypt.hash(password, salt);
        
//         const newUser = new user({
//             username,email,password:hashedPassword,country,desc,isSeller,img,
//         });
        
//         await newUser.save();
        
//         res.status(201).json({ message: "User created successfully", user: newUser });
//     }
//     catch(err){
//         res.status(500).json({message : "something went wrong", error: err.message });
//     }


// }

export const register = async (req, res) => {
    try {
        const { username, mobileNumber } = req.body;

        // Check if username exists in User schema
        const existingUser = await user.findOne({ username });
        if (existingUser) {
            return res.status(400).json({ message: "User already exists" });
        }

        // Check if user is already registered
        const existingRegister = await registered.findOne({ username });
        if (existingRegister) {
            return res.status(400).json({ message: "User is already registered" });
        }

        // Create new Register entry
        const newRegister = new registered({
            username,
            mobileNumber
        });

        await newRegister.save();

        res.status(201).json({ message: "User registered successfully", register: newRegister });
    } catch (err) {
        res.status(500).json({ message: "Something went wrong", error: err.message });
    }
};

export const logout = async (req,res)=>{
    try {
        const {id} = req.params;
        const deletedUser = await user.findByIdAndDelete(id);
        if(!deletedUser){
            return res.status(404).json({message : "User not found"});
        }
        res.status(200).json({ message: "User deleted successfully" });
    } catch (err) {
        res.status(500).json({message : "something went wrong", error: err.message });
    }
}

export const login = async(req,res)=>{
    try {
        
    } catch (error) {
        res.status(500).json({message : "something wwent wrong" , error : err.message})
    }
}