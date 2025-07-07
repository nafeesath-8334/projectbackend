const mongoose= require('mongoose')
const bokmrkSchema = new mongoose.Schema({
 bokmrkId: {
    type: String,
    unique: true,
    required: true,
  },
  title: {
    type: String,
    required: true,

  },
url: {
    type: String,
    required: true,

  },
  description: {
    type: String,
    required: true,

  },
  thumbnail: {
    type: String,
    required: true,

  },
  userId: {
    type: Number,
   
   
  },
  folderId: {
    type: String,
   
   
  },
})
const bokmrk=mongoose.model("bokmrkModel",bokmrkSchema)
module.exports=bokmrk