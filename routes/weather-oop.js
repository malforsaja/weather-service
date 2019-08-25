const express = require('express');
const router = express.Router();
const moment = require('moment');
const OpenWeather = require('../controller/openWeather');


let openWeather = new OpenWeather(process.env.DEFAULT_KEY);

router.get('/', (req, res) => {
  console.log("ok");
  let latitude = parseFloat(req.query.lat);
  let longitude = parseFloat(req.query.lng);

  if (!latitude || !longitude) {
    return res.status(400).send({
      code: "BadRequestError",
      message: "lat/lng required"
    });
  }

  if ((latitude > 90 || latitude < -90) || (longitude > 180 || longitude < -180)) {
    return res.status(400).send({
      code: "BadRequestError",
      message: "lat/lng is not in range. Please insert other lat/lng."
    });
  }

  openWeather.findCities(latitude, longitude, (error, data) => {
    if (error) {
      console.log('err: ', error);
      throw error
    }

    let body = JSON.parse(data);
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
  })
})


router.get('/:id', async (req, res) => {

  try {
    let data = await openWeather.cityDetails(req.params.id);
    let body = JSON.parse(data);
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
  } catch (error) {
    throw error;
  }
})


router.get('/:id/weather', (req, res) => {

  openWeather.cityWeather(req.params.id)
    .then((data) => {
      let body = JSON.parse(data);
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
    })
    .catch((error) => {
      throw error;
    })
})

module.exports = router;