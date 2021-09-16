const request = require('request');

class OpenWeather {
  constructor(appId) {
    this.appId = appId;
  }

  findCities(lat, lng, callback) {
    let url = `${process.env.BASE_OPENWEATHER_URL}/find?lat=${lat}&lon=${lng}&cnt=10&appid=${this.appId}`

    request.get(url, (error, response, data) => {
      if (error && response.statusCode != 200) {
        throw error;
      }

      callback(error, data)
    })
  }

  cityDetails(cityId) {
    return new Promise((resolve, reject) => {
      let url = `${process.env.BASE_OPENWEATHER_URL}/weather?id=${cityId}&appid=${this.appId}`;
      request.get(url, (error, response, data) => {
        if (error && response.statusCode != 200) {
          reject(error);
        }

        resolve(data);
      })
    });
  }

  cityWeather(cityId) {
    return new Promise((resolve, reject) => {
      let url = `${process.env.BASE_OPENWEATHER_URL}/weather?id=${cityId}&appid=${this.appId}`;

      request.get(url, (error, response, data) => {
        if (error && response.statusCode != 200) {
          reject(error);
        }

        resolve(data);
      })
    });
  }
}

module.exports = OpenWeather;