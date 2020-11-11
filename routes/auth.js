const { SENDGRID_API } = require('../config/dev')

const express = require('express'),
    router = express.Router(),
    mongoose = require('mongoose'),
    User = mongoose.model("User"),
    crypto = require('crypto')
    bcrypt = require('bcryptjs'),
    jwt = require('jsonwebtoken'),
    {JWT_SECRET} = require('../config/keys'),
    requireLogin = require('../middleware/requireLogin'),
    nodemailer = require('nodemailer'),
    sendgridTransport = require('nodemailer-sendgrid-transport'),
    {SENDGRID_API, EMAIL} = require('../config/keys')


//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

const transporter = nodemailer.createTransport(sendgridTransport({
    auth: {
        api_key: SENDGRID_API
    }
}))

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
                transporter.sendMail({
                    to: user.email,
                    from: "olabisiajoseh@gmail.com",
                    subject: "signed up success",
                    html: "<h1>Welcome to instagram clone by mukesh</h1>"
                })
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
  
router.post('/reset-password', (req, res) => {
    crypto.randomBytes(32, (err, buffer) => {
        if(err){
            console.log(err)
        }
        const token = buffer.toString("hex")
        User.findOne({email: req.body.email})
        .then(user => {
            if(!user){
                return res.status(422).json({error: "User dont exist"})
            }
            user.resetToken = token
            console.log(token)
            user.expireToken = Date.now() + 3600000
            user.save().then((result) => {
                transporter.sendMail({
                    to: user.email,
                    from: "ajoseholabisi@gmail.com",
                    subject: "password reset",
                    html: `
                        <p> You requested for password reset </p>
                        <h5> click in this <a href="http://${EMAIL}/reset/${token}">link </a> to reset password</h5>
                    `
                })
                res.json({message: "check your email"})
                console.log("this is the token:: " +token)
                console.log("this is something")
            })
        })
    })
})

router.post('/new-password', (req, res) => {
    const newPassword = req.body.password
    const sentToken = req.body.token
    User.findOne({resetToken: sentToken, expireToken: {$gt: Date.now()}})
    .then(user => {
        if(!user){
            return res.status(422).json({error: "Try again "})
        }

        bcrypt.hash(newPassword, 12).then(hashedpassword => {
            user.password = hashedpassword
            user.resetToken = undefined
            user.expireToken = undefined
            user.save()

            .then((savedUser) => {
                res.json({message: "password updated successfully"})
            })
        })
    }).catch(err => {
        console.log(err)
    })
})
module.exports = router