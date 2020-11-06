const express = require('express'),
    router = express.Router(),
    mongoose = require('mongoose'),
    User = mongoose.model("User"),
    bcrypt = require('bcryptjs'),
    jwt = require('jsonwebtoken'),
    {JWT_SECRET} = require('../config/keys'),
    requireLogin = require('../middleware/requireLogin')




router.get('/protected', requireLogin, (req, res) => {
    res.send('Hello user')
})

router.post('/signup', (req, res) => {

    // we are destructuring what we are recieving from the front end
    const {name, email, password, pic} = req.body;

    if(!name || !email || !password ){
        return res.status(422).json({error: "please fill all fields"})
    }
    User.findOne({email:email}) // find the user by email if it already exists
    .then((savedUser) => {   // savedUser contains all the information that is already typed in by the user that wants to sign up
        if(savedUser){
            return res.status(422).json({error: "user already exists with that emaail"})
        }

        bcrypt.hash(password,12)
        .then(hashedpassword => {
             
            const user = new User({
                email, 
                password: hashedpassword,
                name,
                pic
            })

            user.save()
            .then(user => {
                res.json({message: "saved successfully"})
            })
            .catch(err=>{
                console.log(err)
            })

        })
    })
    .catch (err => {
        console.log(err)
    })

})

router.post('/signin', (req, res) => {
    const {email,password} = req.body
    if(!email || !password) {
        res.status(422).json({error: "please add email or passoword"})
    }

    User.findOne({email: email})

    .then(savedUser => {
        if(!savedUser) { //if the user is not saved, yell error
            return res.status(422).json({error: "Invalid Email or password"}) 
        }
        bcrypt.compare(password, savedUser.password)
        .then(doMatch => { 
            if(doMatch){
                //res.json({message: "successfully signed in"})
                const token = jwt.sign({_id: savedUser._id}, JWT_SECRET)
                const {_id, name, email, followers, following, pic} = savedUser;
                res.json({token, user: {_id, name, email,  followers, following, pic}})


            }
            else {
                return res.status(422).json({error: "Invalid Email or Passowrd"})
            }
        })
        .catch(err => {
            console.log(err)
        })
    })
    
})
  
module.exports = router