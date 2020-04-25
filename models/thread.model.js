const mongoose = require('mongoose');

mongoose.connect(process.env.DB, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useCreateIndex: true
});

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error"));
db.once("open", () => {console.log("Connected to MongoDB")});

let threadSchema = new mongoose.Schema({
  text: String,
  created_on: {
    type: Date,
    default: new Date()
  },
  bumped_on: {
    type: Date,
    default: new Date()
  },
  reported: {
    type: Boolean,
    default: false
  },
  delete_password: String,
  replies: [{
    text: String,
    created_on: Date,
    reported: Boolean,
    delete_password: String
    }]
});

module.exports = mongoose.model('Thread', threadSchema);