const express = require('express');
const User = require('../models/User');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const JWT_SECRET = 'Youisafool4'

// Create a User using : POST "/api/auth/". Doesn't require login
router.post('/createuser',[
   body('name', 'Enter a valid name').isLength({ min: 3 }),
   body('email', 'Enter a valid email').isEmail(),
   body('password', 'Password must be atleast 5 characters').isLength({ min: 5 }),
] , async (req,res) =>{
   //If there are Errors and Bad requests
  const errors = validationResult(req);
  if(!errors.isEmpty()){
   return res.status(400).json({ errors: errors.array() });
  }
  
  try{
   //Check whether the user with this email exists already
      let user = await User.findOne({ email: req.body.email});
      if(user){
         return res.status(400).json({ error: "User with this email already exists"})
      }
      const salt = await bcrypt.genSalt(10);
      const secPass = await bcrypt.hash(req.body.password, salt)
   // creating new user
      user = await User.create({
      name: req.body.name,
      password: secPass,
      email: req.body.email,
   });
    const data = {
      user:{
         id: user.id
      }
    }
    const authtoken = jwt.sign(data, JWT_SECRET);

      res.json(authtoken)
   } catch (error){
      console.error(error.message);
      res.status(500).send("Internal error occured");
   }

})

// Authentication of a user: POST "/api/auth/". Doesn't require login
router.post('/login',[
   body('email', 'Enter a valid email').isEmail(),
   body('password', 'Password cannot be blank').exists(),
] , async (req,res) =>{
   const errors = validationResult(req);
   if(!errors.isEmpty()){
    return res.status(400).json({ errors: errors.array() });
   }

   const {email, password} = req.body;
   try {
      let user = await User.findOne({email});
      if(!user){
         return res.status(400).json({error: "Please try to login with right credentials"});
      }

      const passwordCompare = await bcrypt.compare(password, user.password);
      if(!passwordCompare){
         return res.status(400).json({error: "Please try to login with right credentials"});  
      }

      const data = {
         user:{
            id: user.id
         }
      }
      const authtoken = jwt.sign(data, JWT_SECRET);
      res.json({authtoken})

   } catch (error){
      console.error(error.message);
      res.status(500).send("Internal error occured");
   }

})

module.exports = router