const uuid = require('uuid/v4');
const { validationResult } = require('express-validator');

const HttpError = require('../models/http-error');
const getCoordsForAddress = require('../util/location');
const Place = require('../models/place');

let DUMMY_PLACES = [
  {
    id: 'p1',
    title: 'Empire State Building',
    description: 'One of the most famous sky scrapers in the world!',
    location: {
      lat: 40.7484474,
      lng: -73.9871516
    },
    address: '20 W 34th St, New York, NY 10001',
    creator: 'u1'
  }
];

const getPlaceById = async (req, res, next) => {
  const placeId = req.params.pid; // { pid: 'p1' }
  let place;
  try {
    place = await Place.findById(placeId);
  } catch (err) {
    const error = new HttpError('Somthing went wrong, could not find place', 500);
    return next(error);
  }

  if (!place) { 
    const error = new HttpError('Could not find a place for the provided id.', 404);
    return next(error);
  }

  res.json({ place : place.toObject({ getters : true}) }); // => { place } => { place: place }
};

// function getPlaceById() { ... }
// const getPlaceById = function() { ... }

const getPlacesByUserId = async (req, res, next) => {
  const userId = req.params.uid;
  let places;
  try {
    places = await Place.find({ creator : userId});
    console.log(places)
  } catch (e) {
    return next(new HttpError('Somthing went wrong, could not find place for this user', 500));
  }

  if (!places || places.length === 0) {
    return next(
      new HttpError('Could not find places for the provided user id.', 404)
    );
  }

  res.json({ places : places.map((p) =>  p.toObject({ getters : true}))});
};

const createPlace = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(
      new HttpError('Invalid inputs passed, please check your data.', 422)
    );
  }

  const { title, description, address, creator } = req.body;

  let coordinates;
  try {
    coordinates = getCoordsForAddress(address);
  } catch (error) {
    return next(error);
  }

  // const title = req.body.title;
  const createdPlace = new Place({
    title,
    description,
    address,
    location: coordinates,
    image : 'https://www.google.com/imgres?imgurl=https%3A%2F%2Fupload.wikimedia.org%2Fwikipedia%2Fcommons%2Fthumb%2Fa%2Fab%2F3Falls_Niagara.jpg%2F1200px-3Falls_Niagara.jpg&imgrefurl=https%3A%2F%2Fen.wikipedia.org%2Fwiki%2FNiagara_Falls&tbnid=CzLio1Pz9X5OHM&vet=12ahUKEwiElJWtpa_uAhUDFHIKHWEJDPgQMygCegUIARDPAQ..i&docid=u7kki-lWvlzJOM&w=1200&h=798&q=Niagara%20falls&ved=2ahUKEwiElJWtpa_uAhUDFHIKHWEJDPgQMygCegUIARDPAQ',
    creator
  });

  try {
    await createdPlace.save();
    res.status(201).json({ place: createdPlace });
  } catch(e) {
    const error = new HttpError(
      'Creating Place Failed',
      500
    );
    return next(error)
  }

};

const updatePlace = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new HttpError('Invalid inputs passed, please check your data.', 422);
  }

  const { title, description } = req.body;
  const placeId = req.params.pid;

  let place ; 
  try {
    place = await Place.findById(placeId);
  } catch (error) {
    return next( new HttpError('somthing went wrong, could not update the place', 500));
  }

  place.title = title;
  place.description = description;

  try {
    await place.save();
  } catch (error) {
    return next(new HttpError('could not save updated place', 500));
  }

  res.status(200).json({ place: place.toObject({getters : true}) });
};

const deletePlace = async (req, res, next) => {
  const placeId = req.params.pid;
  
  try {
    await Place.deleteOne({_id : placeId});  
  } catch (error) {
    console.log(error.message);
    return next(new HttpError('Somthing went wrong while deleting the place.', 500))
  }
  res.status(200).json({ message: 'Deleted place.' });
};

exports.getPlaceById = getPlaceById;
exports.getPlacesByUserId = getPlacesByUserId;
exports.createPlace = createPlace;
exports.updatePlace = updatePlace;
exports.deletePlace = deletePlace;
