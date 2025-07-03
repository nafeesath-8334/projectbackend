const bcrypt = require("bcryptjs")
const jwt = require('jsonwebtoken');


const crypto = require("crypto");
const { log } = require("console");
const user = require("../schema/userSchema");


require('dotenv').config()


const generateUserId = async () => {
    try {
        const lastUser = await user.findOne().sort({ userId: -1 });
        const newUserId = lastUser ? lastUser.userId + 1 :1000;
        return newUserId

    } catch (error) {
        console.error("Error generating userId:", error);
        throw new Error("Failed to generate userId");
    }
};


exports.register = async (req, res) => {
    const usr = req.body
    const { FirstName, LastName, Email, Password} = usr
     console.log(usr)
    try {
        const existingUser = await user.findOne({ Email: Email })

         console.log("existinguser", existingUser)

        if (existingUser) {
            return res.status(406).json("Account already exist ")
        }
        const newUserId = await generateUserId();
        const hashedPassword = await bcrypt.hash(Password, 10)
        const newUser = new user({
            userId: newUserId,
            FirstName,
            LastName,
            Email,
            Password: hashedPassword,
        })

        // Save to database
        await newUser.save()
        // res.status(200).json(newUser)
        res.status(201).json({ message: "User registered successfully", userModel: newUser })

    } catch (error) {
        res.status(401).json(error)

    }




}
/* LOGIN*/
exports.login = async (req, res) => {
    const users = req.body
    const { Password, Email } = users
    try {
        const existingUser = await user.findOne({ Email: Email })
         console.log(existingUser)

        if (!existingUser) {
            return res.status(400).json("user not found")

        }
        const isMatch = await bcrypt.compare(Password, existingUser.Password);
        if (!isMatch) {
            return res.status(401).json({ message: "Invalid email or password" });
        }
        const secretKey = process.env.JWT_SECRET;
        const token = jwt.sign({ Email: existingUser.Email }, secretKey, { expiresIn: '1h' });
        return res.status(200).json({ userDetails: existingUser, token })


    } catch (error) {
        return res.status(500).json({ error: error.message })

    }






}




















