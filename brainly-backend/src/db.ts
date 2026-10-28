import mongoose, { Schema, model } from "mongoose";

mongoose.connect("mongodb://127.0.0.1:27017/second-brain")
    .then(() => console.log("Connected to MongoDB"))
    .catch((err) => console.error("MongoDB connection error:", err));


const UserSchema = new Schema({
    firstName: { type: String },
    lastName: { type: String },
    email: { type: String, unique: true, sparse: true },
    username: { type: String, sparse: true },
    password: { type: String, required: true }
});

export const UserModel = model("User", UserSchema);


const UserContent = new Schema({
    title: { type: String, required: true },
    link: { type: String, required: true },
    type: { type: String, default: "Link" },
    tags: [{ type: String }],
    userId: { type: mongoose.Types.ObjectId, ref: 'User', required: true }
});
export const ContentModel = model("Content", UserContent);

const LinkSchema = new Schema({
    hash: { type: String, required: true },
    userId: { type: mongoose.Types.ObjectId, ref: 'User', required: true, unique: true }
})
export const LinkModel = model("Link", LinkSchema)
