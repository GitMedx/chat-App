import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import Joi from "joi";

const userSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: true,
    },
    username: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
      minlength: 6,
    },
    gender: {
      type: String,
      required: true,
      enum: ["male", "female"],
    },
    profilePic: {
      type: String,
      default: "",
    },
  },
  { timestamps: true }
);

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next(); // if true then no need to hash password again
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

export const User = mongoose.model("User", userSchema);

export function signupValidator(obj) {
  const schema = Joi.object({
    fullName: Joi.string().trim().min(4).max(20).required(),
    username: Joi.string().trim().min(6).max(20).required(),
    password: Joi.string().trim().min(8).required(),
    confirmPassword: Joi.string().trim().min(8).required(),
    gender: Joi.string().trim().required(),
  });
  return schema.validate(obj);
}

export function loginValidator(obj) {
  const schema = Joi.object({
    username: Joi.string().trim().min(6).max(20).required(),
    password: Joi.string().trim().min(8).required(),
  });
  return schema.validate(obj);
}

