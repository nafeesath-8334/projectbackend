const mongoose = require('mongoose')
const folderSchema = new mongoose.Schema({
  folderId: {
    type: String,
    unique: true,
    required: true,
  },
   userId: {
    type: Number,
   
   
  },
  folderName: {
    type: String,
    required: true,

  },

 

    
});

const folder = mongoose.model("folderModel", folderSchema)
module.exports =folder
