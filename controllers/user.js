const User = require("../models/user.js")
const Project = require("../models/project.js")
const Task = require("../models/task.js")
const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken")
require('dotenv').config()

const registerUser = async (req, res) => {

  const { username, email, password } = req.body
  if (!username || !email || !password) {
    return res.status(400).send("Missing required fields")
  }

  const existingUser = await User.findOne({ $or: [{ username }, { email }] })
  if (existingUser) {
    return res.status(400).send("User already exists")
  }

  const salt = await bcrypt.genSalt(10)
  const hashedPassword = await bcrypt.hash(password, salt)

  const user = new User({
    username,
    email,
    password: hashedPassword,
    profile: req.body.profile,
    preferences: req.body.preferences
  })

  try {
    await user.save()
    res.send(`User with ID ${user._id} created successfully`)
  } catch (error) {
    res.status(500).send("Error registering user")
  }
}

const getUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
    res.status(200).json(user)
  } catch (error) {
    rea.status(500).json(error)
  }
}

const getAllUsers = async (req, res) => {
  const query = req.query.new
  try {
    const users = query
      ? await User.find().sort({ _id: -1 }).limit(5)
      : await User.find()
    res.status(200).json(users)
  } catch (error) {
    res.status(500).send("Error retrieving users")
  }
}

const updateUser = async (req, res) => { // No password update
  try {
    delete req.body.password // Remove password from req.body
    const user = await User.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    )
    if (!user) return res.status(404).send("User not found")
    res.send(user)
  } catch (error) {
    res.status(500).send("Error updating user")
  }
}

const changeUserPassword = async (req, res) => {
  try {
    const { id } = req.params
    const { password } = req.body
    if (!password) {
      return res.status(400).send("New password is required")
    }
    const user = await User.findById(id)
    if (!user) {
      return res.status(404).send("User not found")
    }
    const salt = await bcrypt.genSalt(10)
    const hashedPassword = await bcrypt.hash(password, salt)
    user.password = hashedPassword
    await user.save()
    // Respond with success message
    res.send("Password updated successfully")
  } catch (error) {
    console.error("Error changing password:", error)
    res.status(500).send("Error changing password")
  }
}

const deleteUser = async (req, res) => {
  try {
    const userId = req.params.id
    const user = await User.findByIdAndDelete(userId)
    if (!user) {
      return res.status(404).send("User not found")
    }
    res.send(user)
  } catch (error) {
    res.status(500).send("Error deleting user")
  }
}

const loginUser = async (req, res) => {
  try {
    // Validate input
    const { email, password } = req.body
    if (!email || !password) {
      return res.status(400).send("Missing required fields")
    }

    // Check for existing user
    const user = await User.findOne({ email })
    if (!user) {
      return res.status(400).send("User not found")
    }

    // Compare password
    const isMatch = await bcrypt.compare(password, user.password)
    if (!isMatch) {
      return res.status(400).send("Invalid password")
    }

    // Generate token
    console.log("Generating token...")
    const token = jwt.sign({ id: user._id }, process.env.SECRET_KEY, {
      expiresIn: "1h",
    })
    console.log("Token generated.")

    res.send({ token, user })
  } catch (error) {
    console.error(error)
    res.status(500).send("Internal Server Error")
  }
}

module.exports = {
  registerUser,
  getUser,
  getAllUsers,
  updateUser,
  changeUserPassword,
  deleteUser,
  loginUser,
}