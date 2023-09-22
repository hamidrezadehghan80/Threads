import mongoose from "mongoose";

let is_connected = false;

export const connectToDB = async () => {
    mongoose.set('strictQuery', true);

    if (!process.env.MONGODB_URL) return console.log("MONGODB_URL not found!");
    if (is_connected) return console.log("Already connected to MongoDB");
    
    try {
        await mongoose.connect(process.env.MONGODB_URL);
        is_connected = true;
        console.log("Connected to MongoDB");
    }catch (e) {
        console.log(e)
    }

}



