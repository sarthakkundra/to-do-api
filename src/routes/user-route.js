const express = require('express');
const multer = require('multer');
const sharp = require('sharp');
const {sendWelcomeMail, sendCancellationMail} = require('../emails/account');
const User = require('../models/user');
const auth = require('../middleware/auth');

const router = new express.Router();


//Setting path to create a new user
router.post('/users', async (req, res) =>{

    const user = new User(req.body);

    try{
        await user.save();
        sendWelcomeMail(user.email, user.name);
        const token = await user.generateToken();
        res.status(201).send({user,token});

    } catch(error) {

        res.status(400).send(error);
    }
})


//Setting path to login a user
router.post('/users/login', async (req, res)=>{

    try{

        const user = await User.findByCredentials(req.body.email, req.body.password);
        const token = await user.generateToken();

        res.send({user, token});

    } catch(error){

        res.status(400).send(error);
    }
})


//Setting path to logout from current session
router.post('/users/logout', auth, async (req, res) =>{
    
    try{

        req.user.tokens = req.user.tokens.filter((token) => token.token !== req.token);

        await req.user.save();

        res.send('Logged out successfully');

    } catch(error){

        res.status(500).send(error);

    }
})


//Setting path to logout from all sessions
router.post('/users/logoutAll', auth, async (req, res) =>{

    try{

        req.user.tokens = [];
        await req.user.save();
        res.send('Logged out of all sessions successfully');

    } catch(error){

        res.status(500).send(error);

    }
})

//Setting path to read own profile
router.get('/users/me',auth, (req, res) =>{

    res.send(req.user);
})


//Setting path to upload a profile picture
var upload = multer({

    limits: {
        size: 1000000
    },
    fileFilter(req,file,cb){
        if(!file.originalname.match(/\.(jpg|jpeg|png)$/)){
            return cb(new Error('Please upload an image under 1 MB'))
        }

        cb(null, true);
    }
})
router.post('/users/me/avatar', auth, upload.single('avatar'), async(req, res) =>{
    //req.user.avatar = req.file.buffer;
    const buffer = await sharp(req.file.buffer).resize({width:250, height:250}).png().toBuffer();
    req.user.avatar = buffer;
    await req.user.save() 
    res.send();
}, (error, req, res, next)=>{

    res.status(400).send({error: error.message});
})



//Setting path to delete a user avatar
router.delete('/users/me/avatar', auth, async(req,res) =>{
    req.user.avatar = undefined;
    await req.user.save();
    res.send();
})


// Setting path to update a user 
router.patch('/users/me', auth, async(req, res) =>{

    const availableUpdates = ['age', 'name', 'email', 'password'];
    const updates = Object.keys(req.body);

    const isValidUpdate = updates.every((update) => availableUpdates.includes(update));

    if(!isValidUpdate){
        return res.status(400).send();
    }
    
    try{

        updates.forEach((update) => req.user[update] = req.body[update]);
        await req.user.save();

       res.status(200).send(req.user);

    } catch(error){

        res.status(500).send(error);
    }
})



//Getting a user avatar by specific id
router.get('/users/:id/avatar', async (req, res)=>{

    try{

        const user = await User.findById(req.params.id);

        if(!user || !user.avatar){
            throw new Error();
        }

        res.set('Content-Type','image/png');
        res.status(200).send(user.avatar);

    } catch(error){
        res.status(404).send(error);
    }
})

// Setting path to delete a user
router.delete('/users/me', auth, async(req, res) =>{
    try{
        
       await req.user.remove();
       sendCancellationMail(req.user.email, req.user.name);
        res.send(req.user);

    } catch(error){

        res.status(500).send(error);
    }

})

module.exports = router;