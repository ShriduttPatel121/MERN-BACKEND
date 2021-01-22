const axios = require('axios');

const HttpError = require('../models/http-error');

const API_KEY = 'AIzaSyA4WFhxWQoWj_oGM6CCsBcT8sdPfLx28jE';

async function getCoordsForAddress(address) {
  return {
    lat: 43.0962,
    lng: 79.0377
  };
  // const response = await axios.get(
  //   `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(
  //     address
  //   )}&key=${API_KEY}`
  // );

  // const data = response.data;

  // if (!data || data.status === 'ZERO_RESULTS') {
  //   const error = new HttpError(
  //     'Could not find location for the specified address.',
  //     422
  //   );
  //   throw error;
  // }
  
  // const coordinates = data.results[0].geometry.location;

  // return coordinates;
}

module.exports = getCoordsForAddress;
