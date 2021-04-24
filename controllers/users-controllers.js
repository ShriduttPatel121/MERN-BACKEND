const uuid = require('uuid/v4');
const { validationResult } = require('express-validator');

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

  const createdUser = new User({
    name,
    email,
    password,
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
  } catch (e) {
    return next( new HttpError('Somthing went wrong while checikng the existing user', 500));
  }

  if(!existingUser || existingUser.password !== password) {
    return next(new HttpError('Invalid Credentials, please try again', 401));
  }

  res.json({message: 'Logged in!', user : existingUser.toObject({getters : true})});
};

exports.getUsers = getUsers;
exports.signup = signup;
exports.login = login;
