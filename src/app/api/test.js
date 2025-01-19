// app/api/test.js

export default function handler(req, res) {
    console.log("MONGODB_URI:", process.env.MONGODB_URI);
    res.status(200).json({ message: 'Check the server console logs!' });
  }
  