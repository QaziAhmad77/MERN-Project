const Users = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");
module.exports = {
  signUp: async (req, res) => {
    try {
      let success = false;
      const { name, email, password } = req.body;
      if (!name || !email || !password) {
        throw { success, status: 409, message: "Require fields cannot be empty" };
      }
      const salt = await bcrypt.genSalt(12);
      const hashedPass = await bcrypt.hash(password, salt);
      const userFound = await Users.findOne({ email });
      if (userFound) {
        throw { success, status: 409, message: "Email already exist" };
      }
      const user = await Users.create({
        name,
        email,
        password: hashedPass,
      });
      const token = jwt.sign(
        {
          user,
        },
        process.env.JWT_SECRET
      );
      success = true;
      res.status(200).send({ success, token });
    } catch (err) {
      console.log(err);
      return res.status(err.status || 500).send(err.message || "Something went wrong");
    }
  },
  logIn: async (req, res) => {
    try {
      let success = false;
      const { email, password } = req.body;
      if (!email || !password) {
        throw { success, status: 400, message: "Required fields cannot be empty" };
      }
      const user = await Users.findOne({ email });
      if (!user) {
        success = false;
        throw { success, status: 404, message: "User not found" };
      }
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        success = false;
        throw { success, status: 409, message: "Password is incorrect" };
      }
      const token = jwt.sign(
        {
          user,
        },
        process.env.JWT_SECRET
      );
      success = true;
      res.status(200).send({ success, token });
    } catch (err) {
      console.log(err.message);
      return res.status(err.status || 500).send(err.message || "Something went wrong");
    }
  },
  getUser: async (req, res) => {
    try {
      const { user } = req.user;
      let data = await Users.findById(user._id).select("-password");
      res.status(200).send({ data });
    } catch (err) {
      console.log(err);
      return res.status(err.status || 500).send(err.message || "Something went wrong");
    }
  },
  deleteAllUsers: async (req, res) => {
    try {
      await Users.deleteMany();
      res.status(200).json("All users has been deleted");
    } catch (err) {
      console.log(err.message);
      return res.status(err.status || 500).send(err.message || "Something went wrong");
    }
  },
};
