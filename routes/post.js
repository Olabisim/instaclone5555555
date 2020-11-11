const express = require('express'),
    router = express.Router(),
    mongoose = require('mongoose'),
    requireLogin = require('../middleware/requireLogin'),
    Post = mongoose.model("Post");


router.get('/allpost', requireLogin, (req, res) =>  {
    Post.find()
    .populate("postedBy", "_id name")
    .populate("comments.postedBy", "_id name")  // we are populating the postedby inside the comment with _id and name
    .sort('-createdAt')

    .then(posts => {
        res.json({posts})
    })

    .catch(err => {
        console.log(err);
    })
    
})

//post created by the user whom i follow
router.get('/getsubpost', requireLogin, (req, res) =>  {

    //if postedby in following then only return the post
    Post.find({postedBy: {$in: req.user.following}})
    .populate("postedBy", "_id name")
    .populate("comments.postedBy", "_id name")  // we are populating the postedby inside the comment with _id and name
    .sort('-createdAt')
    
    .then(posts => {
        res.json({posts})
    })

    .catch(err => {
        console.log(err);
    })
    
})


router.post('/createpost', requireLogin, (req, res) => {


    const {title, body, pic} = req.body
    console.log(title, body, pic)
    if(!title || !body || !pic){
        res.status(422).json({ error: "Please add all fields" })
    }
    console.log("this is the req")
    console.log(req)
    req.user.password = undefined;

    const post = new Post ({
        title,
        body,
        photo: pic,
        postedBy : req.user

    })

    post.save().then(result => {
        res.json({post: result})
    })
    .catch(err => {
        console.log(err)
    })


})


//getting post of a particular user
router.get('/mypost', requireLogin, (req, res) => {
    Post.find({postedBy: req.user._id})
    .populate("postedBy", "_id name")
    .then(mypost => {
        res.json({mypost})
    })
    .catch(err => {
        console.log(err) 
    })
})


router.put('/like', requireLogin, (req, res) => {

    Post.findByIdAndUpdate(req.body.postId, {

        $push: {likes: req.user._id} //we are pushing to the likes array to the user that is already logged in 

    }, {

        new: true //because we want a new record from mongodb

    }).exec((err, result) => {

        if (err) {
            return res.status(422).json({error: err})
        }

        else {
            res.json(result)
        }

    })

})



router.put('/unlike', requireLogin, (req, res) => {

    Post.findByIdAndUpdate(req.body.postId, {

        $pull: {likes: req.user._id} //we are pulling to the likes array to the user that is already logged in i.e pulling the user from the likes array

    }, {

        new: true //because we want a new record from mongodb

    }).exec((err, result) => {

        if (err) {
            return res.status(422).json({error: err})
        }

        else {
            res.json(result)
        }

    })

})




router.put('/comment', requireLogin, (req, res) => {

    const comment = {
        text: req.body.text,
        postedBy: req.user._id
    }

    Post.findByIdAndUpdate(req.body.postId, {

        $push: {comments: comment} //we are pushing to the comments array to the user that is already logged in 

    }, {

        new: true //because we want a new record from mongodb

    })
    .populate("comments.postedBy", "_id name")
    .populate("postedBy", "_id name")
    
    
    .exec((err, result) => {

        if (err) {
            return res.status(422).json({error: err})
        }

        else {
            res.json(result)
        }

    })

})


router.delete("/deletepost/:postId", requireLogin, (req, res) => {

    Post.findOne({_id: req.params.postId})
    .populate("postedBy", "_id")

    .exec((err, post) => {

        if(err || !post) {
            return res.status(422).json({error: err})
        }

        if(post.postedBy._id.toString() === req.user._id.toString()) { // req.user._id means the user that is already logged in
            
            post.remove()

            .then(result => {
                res.json(result)
            })

            .catch(err => {
                console.log(err)
            })

        }

    })


})



router.delete("/deletecomment/:postId/:commentId", requireLogin, (req, res) => {
    //the key here is getting the req.params.post (not the postId) because the post contains the postid and commentid like something that has it all about the post 
    //how can we pass something that has something 
    Post.findOne({_id: req.params.postId})
    .populate("comments.postedBy", "_id")

    .exec((err, post) => {
        console.log("this is the post" + post)

        if(err || !post) { 
            return res.status(422).json({error: err})
        }

        if(post.postedBy._id.toString() === req.user._id.toString()) { // req.user._id means the user that is already logged in
            //the only problem i have right now is how i can put that req.params.commentId to delete the comment but if i can also find multiple ids maybe it can work
            post.remove()

            .then(result => {
                res.json(result)
            })

            .catch(err => {
                console.log(err)
            })

        }

        
        console.log("this is the post::::::" + post + "this is the post.commnet:::::" + post.comments)


    })


})




module.exports = router
