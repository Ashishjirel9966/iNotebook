const express = require('express');
const User = require('../models/User');
const router = express.Router();

// Create a User using : POST "/api/auth/". Doesn't require auth
router.post('/',(req,res) =>{
   console.log(req.body);
   const { name, email,password } = req.body;
   const user = new User({ name, email,password });
   user.save();
   res.send(req.body);
})

module.exports = router