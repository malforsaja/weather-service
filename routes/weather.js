const express = require('express');
const router = express.Router();
const request = require('request');
const moment = require('moment');

let appId = process.env.DEFAULT_KEY;

router.get('/test', (req, res) => {
  res.send({
    message: 'Weather is fine!'
  })
})


/** 
@route    /cities?lat={latitude}&lng={longitude}
@method   GET
@desc     List the available cities around the specified latitude/longitude within a radius of 10 kilometers Example: http://localhost:3000/cities?lat=49.48&lng=8.46
@access   Public
*/
router.get('/', (req, res) => {

  let latitude = parseFloat(req.query.lat);
  let longitude = parseFloat(req.query.lng);

  if (!latitude || !longitude) {
    return res.status(400).send({
      code: "BadRequestError",
      message: "lat/lng required"
    });
  }

  //console.log(typeof latitude);
  
  if ((latitude > 90 || latitude < -90) || (longitude > 180 || longitude < -180)) {
    return res.status(400).send({
      code: "BadRequestError",
      message: "lat/lng is not in range. Please insert other lat/lng."
    });
  }

  let url = `${process.env.BASE_OPENWEATHER_URL}/find?lat=${req.query.lat}&lon=${req.query.lng}&cnt=10&appid=${appId}`
  //console.log('url: ', url);

  request(url, (error, response, body) => {
    if (error && response.statusCode != 200) {
      throw error;
    }

    body = JSON.parse(body);
    //console.log(body);

    if (body.cod === "404" && body.message === "no results") {
      return res.status(404).send({
        code: "NotFoundError",
        message: "No result, please change the coordinates"
      });
    }
    
    let cities = body.list.map(city => {
      return {
        id: city.id,
        name: city.name
      }
    })

    res.send(cities);
  });
})


/** 
@route    /cities/{city_id}
@method   GET
@desc     Retrieve the details for a city (by city_id) Example: http://localhost:3000/cities/2873891
@access   Public
*/
router.get('/:id', (req, res) => {

  let url = `${process.env.BASE_OPENWEATHER_URL}/weather?id=${req.params.id}&appid=${appId}`;

  request(url, (error, response, body) => {

    if (error && response.statusCode != 200) {
      throw error;
    }

    body = JSON.parse(body);

    if (body.cod === "404" && body.message === "city not found") {
      return res.status(404).send({
        code: "NotFoundError",
        message: "not found"
      });
    }

    res.send({
      id: body.id,
      name: body.name,
      lat: body.coord.lat,
      lng: body.coord.lon
    });
  });
})


/** 
@route    /cities/{city_id}/weather
@method   GET
@desc     Retrieve the weather data for a city (by city_id) Example: http://localhost:8080/cities/2873891/weather
@access   Public
*/
router.get('/:id/weather', (req, res) => {

  let url = `${process.env.BASE_OPENWEATHER_URL}/weather?id=${req.params.id}&appid=${appId}`

  request(url, (error, response, body) => {

    if (error && response.statusCode != 200) {
      throw error;
    }
    body = JSON.parse(body);
    
    if (body.cod === "404" && body.message === "city not found") {
      return res.status(404).send({
        code: "NotFoundError",
        message: "not found"
      });
    }

    let responseBody = {
      type: body.weather.main,
      type_description: body.weather.description,
      sunrise: moment.unix(body.sys.sunrise),
      sunset: moment.unix(body.sys.sunset),
      temp: body.main.temp,
      temp_min: body.main.temp_min,
      temp_max: body.main.temp_max,
      pressure: body.main.pressure,
      humidity: body.main.humidity,
      clouds_percent: body.clouds.all,
      wind_speed: body.wind.speed
    }

    res.status(200).send(responseBody);
  });
})

module.exports = router;