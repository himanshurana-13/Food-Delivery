import mongoose, { connect } from "mongoose";

export const connectDB = async () => {
    await mongoose.connect('mongodb+srv://rana101himanshu:7814449594@cluster0.f3qft8o.mongodb.net/food-del').then(()=>console.log("DB CONNECTED ✅"));
}