import mongoose, { Schema, model } from "mongoose";

mongoose.connect("mongodb://127.0.0.1:27017/second-brain")
    .then(() => console.log("Connected to MongoDB"))
    .catch((err) => console.error("MongoDB connection error:", err));


const UserSchema = new Schema({
    username: { type: String, unique: true },
    password: { type: String }
});

export const UserModel = model("User", UserSchema);


const UserContent = new Schema({
    title: String,
    link: String,
    tags: [{type: mongoose.Types.ObjectId, ref: 'Tag'}],
    userId: {type: mongoose.Types.ObjectId, ref: 'User', required: true}
})
export const ContentModel = model("Content", UserContent)
