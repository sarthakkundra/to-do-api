//Mongoose model for user
const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Task = require('./task');

const userSchema = new mongoose.Schema({

    name: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        unique: true,
        required: true,
        trim: true,
        validate(value){
            if(!validator.isEmail(value)){
                throw new Error('Email is invalid');
            }
        }

    },
    age: {
        type: Number,
        default: 0,
        validate(value){
            if(value < 0){
                throw new Error("Age cannot be negative");
            }
        }
    },
    password: {
        type: String,
        required: true,
        trim: true,
        minlength: 7,
        validate: (value) =>{
            if(value.toLowerCase().includes('password')){
                throw new Error('Cannot set password as password');
            }
        }
    },

    tokens: [{
        token: {
            type: String,
            required: true
        }
    }],
    avatar: {
        type: Buffer
    }

}, {
    timestamps: true
})

userSchema.virtual('tasks', {
    ref: 'Task',
    localField: '_id',
    foreignField: 'owner'
})

userSchema.methods.toJSON = function(){
    const user = this;

    const userObject = user.toObject();

    delete userObject.password;
    delete userObject.tokens;
    delete userObject.avatar;

    return userObject;
}

userSchema.methods.generateToken = async function(){

    const user = this;
    const token = jwt.sign({_id : user._id.toString()}, process.env.JWT_SECRET);

    user.tokens = user.tokens.concat({token});
    await user.save();

    return token;
}

userSchema.statics.findByCredentials = async(email, password)=>{

    const user = await User.findOne({email});

    if(!user){
        throw new Error('Unable to login');
    }

    const isValid = await bcrypt.compare(password, user.password);

    if(!isValid){
        throw new Error('Unable to login');
    }

    return user;
}

//Hashing the password when a new user is created/login
userSchema.pre('save', async function(next){

    const user = this;

    if(user.isModified('password')){

        user.password = await bcrypt.hash(user.password, 8);

    }

    next();
})


//Removing all the tasks of a user when the uer is deleted
userSchema.pre('remove', async function(next) {
    
    const user = this;
    await Task.deleteMany({ owner : user._id});
    next();


})

const User = mongoose.model('User', userSchema);

module.exports = User;