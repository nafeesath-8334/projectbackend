const bcrypt = require("bcryptjs")
const jwt = require('jsonwebtoken');


const crypto = require("crypto");

const user = require("../schema/userSchema");

const folder = require("../schema/folderSchema");
const bokmrk = require("../schema/bookmarkSchema");


require('dotenv').config()

/* USERID GENERATION*/

const generateUserId = async () => {
    try {
        const lastUser = await user.findOne().sort({ userId: -1 });
        const newUserId = lastUser ? lastUser.userId + 1 : 1000;
        return newUserId

    } catch (error) {
        console.error("Error generating userId:", error);
        throw new Error("Failed to generate userId");
    }
};

/* USER REGISTRATION*/

exports.register = async (req, res) => {
    const usr = req.body
    const { FirstName, LastName, Email, Password } = usr
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
/* USER LOGIN*/
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
/* GET USERDETAILS */
exports.getUser = async (req, res) => {
    try {
console.log("one")
        const userId = Number(req.params.userId); // Ensure it's a number
         console.log("userId", userId)

        const existingUser = await user.findOne({ userId });

        if (!existingUser) {
            return res.status(400).json({ message: "User not found" });
        }
        else if (existingUser) {
            return res.status(200).json({ message: "success", data: existingUser })

        }
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
}

/* FOLDER ID GENERATION */
const generateFolderId = async () => {
    try {
        const lastFolder = await folder.findOne().sort({ folderId: -1 });
        const lastIdNumber = lastFolder ? parseInt(lastFolder.folderId.replace("FOLDER", "")) : 0;
        const newFolderId = `FOLDER${lastIdNumber + 1}`;
        return newFolderId;
    } catch (error) {
        console.error("Error generating userId:", error);
        throw new Error("Failed to generate folderId");
    }
};


/* ADD FOLDER */
exports.addFolder = async (req, res) => {
    const { userId, folderName } = req.body
    try {
        const folderId = await generateFolderId()
        const newFolder = new folder({
            folderId,
            userId,
            folderName,
        })
        await newFolder.save()
        res.status(201).json({ message: 'folder created successfully', folder: newFolder });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}

/* GET FOLDERS BY USERID */
exports.getFolder = async (req, res) => {
    try {
        const userId = Number(req.params.userId);
        if (isNaN(userId)) {
            return res.status(400).json({ message: "Invalid userId" });
        }

        const folders = await folder.find({ userId });
        res.status(200).json({ data: folders });  // <-- Match frontend expectation
    } catch (error) {
        console.error("Error fetching folders:", error);
        res.status(500).json({ error: "Failed to fetch folders" });
    }
};


/*BOOKMARK ID GENERATION*/
const generateBokmrkId = async () => {
    try {
        const lastBokmrk = await bokmrk.findOne().sort({ bokmrkId: -1 });
        const lastIdNumber = lastBokmrk ? parseInt(lastBokmrk.bokmrkId.replace("BOKMRK", "")) : 0;
        const newBokmrkId = `BOKMRK${lastIdNumber + 1}`;
        return newBokmrkId;
    } catch (error) {
        console.error("Error generating BookmarkId:", error);
        throw new Error("Failed to generate BookmarkId");
    }
}

/* ADD BOOKMARKS */
exports.addBokmrks = async (req, res) => {
    console.log("inside controller addbookmark")
    
     const userId = Number(req.params.userId);
       const { folderId, title, url, description, thumbnail } = req.body;
    if (isNaN(userId)) {
        return res.status(400).json({ message: "Invalid userId" });
    }

    console.log("userid", userId, "folderid", folderId)
    try {
        const bokmrkId = await generateBokmrkId()
        const newBokmrk = new bokmrk({
            bokmrkId,
            title,
            url,
            description,
            thumbnail,
            userId,
            folderId,


        })
        await newBokmrk.save()
        res.status(201).json({ message: 'Bookmark created successfully', bokmrk: newBokmrk });
    }

    catch (err) {
        res.status(500).json({ error: err.message });
    }
}
/* GET BOOKMARKS */
exports.getBokmrks = async (req, res) => {
    try {
        const userId = Number(req.params.userId);
        if (isNaN(userId)) {
            return res.status(400).json({ message: "Invalid userId" });
        }

        const bokmrks = await bokmrk.find({ userId });
        res.status(200).json({ data: bokmrks });  // <-- Match frontend expectation
    } catch (error) {
        console.error("Error fetching folders:", error);
        res.status(500).json({ error: "Failed to fetch folders" });
    }
};













