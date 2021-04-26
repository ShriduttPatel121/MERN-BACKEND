const uuid = require('uuid/v4');
const { validationResult } = require('express-validator');
const bcrypt  = require('bcryptjs');
const jwt = require('jsonwebtoken');

const HttpError = require('../models/http-error');
const User = require('../models/user');

const getUsers = async (req, res, next) => {
  let users;
  try {
    users = await User.find({  }, '-password')
  } catch (e) {
    return next(new HttpError('fetching users failed', 500));
  }

  res.json({ users : users.map( user => user.toObject({ getters : true}))});
};

const signup = async (req, res, next) => {

  const { name, email, password } = req.body;

  const errors = validationResult(req);
  let existingUser;
  try {
    existingUser = await User.findOne({email : email})
  } catch (e) {
    return next( new HttpError('Somthing went wrong while checikng the existing user', 500));
  }

  if (existingUser) {
    return next( new HttpError('User exists already, please login instead', 422))
  }
  if (!errors.isEmpty()) {
    return next(new HttpError('Invalid inputs passed, please check your data.', 422));
  }

  let hashedPassword;

  try {
    hashedPassword = await bcrypt.hash(password, 12);
  } catch (e) {
    return next( new HttpError('Somthing went wrong while checikng the existing user', 500));
  }

  

  const createdUser = new User({
    name,
    email,
    password: hashedPassword,
    places : [],
    /* image : 'blue_person.jpeg', */
    image : req.file.path,
  })

  try {
    await createdUser.save();
  } catch(e) {
    const error = new HttpError(
      'Creating User Failed',
      500
    );
    return next(error)
  }

  res.status(201).json({user: createdUser.toObject({getters : true})});
};

const login = async (req, res, next) => {
  const { email, password } = req.body;

  let existingUser;
  try {
    existingUser = await User.findOne({email : email})
    if (!existingUser) {
      throw new Error();
    }
  } catch (e) {
    return next( new HttpError('Somthing went wrong, please check your credentials', 401));
  }

  let isValid
  try {
    isValid = await bcrypt.compare(password, existingUser.password);
  } catch(e) {
    return next( new HttpError('Somthing went wrong, please check your credentials', 500));
  }

  if(!existingUser || !isValid) {
    return next(new HttpError('Invalid Credentials, please try again', 401));
  }

  let token;
  try {
    token = jwt.sign({
      userId: existingUser.id,
      email: existingUser.email,
    }, 
    process.env.JWT_KEY,
    { expiresIn: '1h'}
    );
  } catch(e) {
    return next( new HttpError('Somthing went wrong while checikng the existing user', 500));
  }
  
  res.json({
    message: 'Logged in!',
    userId: existingUser.id,
    email: existingUser.email,
    token: 'Bearer ' + token
  });
};

exports.getUsers = getUsers;
exports.signup = signup;
exports.login = login;
