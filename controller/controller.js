const bcrypt = require("bcryptjs")
const jwt = require('jsonwebtoken');


const crypto = require("crypto");

const user = require("../schema/userSchema");

const folder = require("../schema/folderSchema");
const bokmrk = require("../schema/bookmarkSchema");
const { Resend } = require("resend");


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
/*EDIT USER DETAILS */
exports.editUser = async (req, res) => {
    try {

        const userId = Number(req.params.userId);
        //console.log("Updating user with ID:", userId, "Request Body:", req.body);
        const imageUrl = req.file ? `/profileImages/${req.file.filename}` : null;

        // const imageUrl = `/profileImages/${req.file.filename}`;
        const existingUser = await user.findOne({ userId });

        if (!existingUser) {
            console.error("User not found:", userId);
            return res.status(404).json({ message: "User not found" });
        }

        const updateData = {
            ...(req?.file?.filename ? { Image: imageUrl } : {}),
            // ...(req?.file?.filename ? { img: imageUrl } : {}),
            FirstName: req.body.FirstName,
            LastName: req.body.LastName,
          
        };

        const updatedUser = await user.findOneAndUpdate(
            { userId },
            { $set: updateData },
            { new: true }
        );

        if (!updatedUser) {
            console.error("Database update failed for user:", userId);
            return res.status(500).json({ message: "Error updating profile" });
        }

        //console.log("Updated User:", updatedUser);
        return res.status(200).json({ message: "Profile updated successfully!", data: updatedUser });

    } catch (error) {
        console.error("Error updating user:", error);
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


/* EDIT BOOKMARK */



exports.editBokmark = async (req, res) => {
    if (!req.body) {
    return res.status(400).json({ message: "Missing request body" });
  }
  const { bokmrkId } = req.params;
  const { folderId, userId, url, title, description, thumbnail } = req.body;

  try {
    const updatedData = await bokmrk.findOneAndUpdate(
      { bokmrkId },
      { $set: { folderId, userId, url, title, description, thumbnail } },
      { new: true }
    );

    if (!updatedData) {
      return res.status(404).json({ message: "Bookmark not found" });
    }

    return res.status(200).json({
      message: "Bookmark updated successfully",
      data: updatedData,
    });
  } catch (error) {
    console.error("Error updating bookmark:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};



/* EDIT FOLDER NAME */

exports.editFolder = async (req, res) => {
  try {
    const { folderId, folderName, userId } = req.body;
    if (!userId || isNaN(Number(userId))) {
      return res.status(400).json({ message: "Invalid userId" });
    }

    console.log("Updating folder with ID:", folderId, "New name:", folderName, "User ID:", userId);

    const existingFolder = await folder.findOne({ folderId, userId });
    if (!existingFolder) {
      return res.status(404).json({ message: "Folder not found" });
    }

    const updatedFolder = await folder.findOneAndUpdate(
      { folderId, userId },
      { $set: { folderName } },
      { new: true }
    );

    return res.status(200).json({ message: "Folder updated successfully!", data: updatedFolder });
  } catch (error) {
    console.error("Error updating folder:", error);
    return res.status(500).json({ error: error.message });
  }
};
/* DELETE FOLDER */
exports.deleteFolder = async (req, res) => {
  try {
    const { folderId, userId } = req.body;

    // Delete folder if it belongs to user
    const deletedFolder = await folder.findOneAndDelete({ folderId, userId });

    if (!deletedFolder) {
      return res.status(404).json({ message: "Folder not found" });
    }

    return res.status(200).json({ message: "Folder deleted successfully!" });
  } catch (error) {
    console.error("Error deleting folder:", error);
    return res.status(500).json({ error: error.message });
  }
};


/* FORGOT PASSWORD */
exports.forgotPswd = async (req, res) => {
    try {
        const { Email } = req.body
        // console.log("email",Email)
        const usrs = await user.findOne({Email:Email})
        // console.log(usrs)
        if (!usrs) return res.status(200).send("if the user exist,emailwill be send")
        const token = crypto.randomBytes(32).toString('hex')
        const hashedToken = crypto.createHash('sha256').update(token).digest('hex')
        usrs.resetPasswordToken = hashedToken;
        usrs.resetPasswordExpires = Date.now() + 360000;
        await usrs.save()
        const resetLink = `http://localhost:5173/resetPassword/${token}`
        const resend = new Resend('re_fFuNFZVf_2xrSAEyn5E7YLCgUxZEeg7P6')
        try {
            const { data, error } = await resend.emails.send({
                from: 'onboarding@resend.dev',
                to: Email,
                subject: 'Reset Password',
                html: `<p>This is the link to reset Your Password<strong>Link:</strong>${resetLink}</p>`
            });
            // console.log("data", data)
            console.log("error", error)
        } catch (error) {
            console.error(error); // Good to log the actual error
            res.status(500).json({ error: 'Failed to send email !!' });
        }

    } catch (error) {
        console.error(error); // Good to log the actual error
        res.status(500).json({ error: 'Failed to update ad' });
    }
    return res.status(200).json({ message: "Password reset link sent" });

}
exports.resetPassword = async (req, res) => {
    const { token } = req.params; // Token from URL
    const { Password } = req.body; // New password from the request body
    console.log(Password)
    try {
        const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
        const users = await user.findOne({
            resetPasswordToken: hashedToken,
            resetPasswordExpires: { $gt: Date.now() }, // Check if token is expired
        });
        console.log(user)
        console.log(users)
        if (!users) {
            return res.status(400).json({ message: 'Invalid or expired token' });
        }

        // Hash the new password
        const hashedPassword = await bcrypt.hash(Password, 10);

        // Update user password and remove reset token
        users.Password = hashedPassword;
        users.resetPasswordToken = undefined;
        users.resetPasswordExpires = undefined;
        await users.save();

        res.status(200).json({ message: 'Password has been reset successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Something went wrong' });
    }
}


exports.deleteBokmrk = async (req, res) => {
//   const { bokmrkId } = req.params;
   const { userId,bokmrkId } = req.body; // if you need to validate user

  try {
    const deleted = await bokmrk.findOneAndDelete({ bokmrkId,userId });

    if (!deleted) {
      return res.status(404).json({ message: "Bookmark not found" });
    }

    return res.status(200).json({ message: "Bookmark deleted successfully" });
  } catch (error) {
    console.error("Error deleting bookmark:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};








