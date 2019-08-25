const chai = require('chai');
const expect = chai.expect;

const app = require('../app')

//chai-http used to send async requests to our app
const http = require('chai-http');
chai.use(http);

describe('Weather api routes', () => {

  it('Should exists the app', () => {
    expect(app).to.be.a('function');
  })

  it('it should list the available cities around the specified latitude/longitude', (done) => {
    chai.request(app).get('/cities')
      .query({ lat: 49.48, lng: 8.46 })
      .then(res => {
        expect(res).to.have.status(200);
        expect(res.body).to.be.an('array');
        expect(res.body[0].id).to.be.equal(2873891);
        expect(res.body[0].name).to.be.equal("Mannheim");
        let response = res.body;
        response.forEach(city => {
          //console.log('res: ', city);
          expect(city.id).to.be.a('number');
          expect(city.name).to.be.a('string');
        });
        done();
      }).catch(err => {
        console.log(err.message);
      });
  })

  it('it should retrieve the details for a city', (done) => {

    chai.request(app).get('/cities/519188')
      .then(res => {
        expect(res).to.have.status(200);
        expect(res.body).to.be.an('object');
        expect(res.body).to.haveOwnProperty('id');
        expect(res.body).to.haveOwnProperty('name');
        expect(res.body).to.haveOwnProperty('lat');
        expect(res.body).to.haveOwnProperty('lng');

        // check if values are correct
        expect(res.body.id).to.be.equal(519188);
        expect(res.body.name).to.be.equal("Novinki");
        expect(res.body.lat).to.be.equal(55.68);
        expect(res.body.lng).to.be.equal(37.67);
        done();
      }).catch(err => {
        console.log(err.message);
      });
  })

  it('it should retrieve the weather data for a city', (done) => {
    //send a GET request to /
    chai.request(app).get('/cities/2873891/weather').then(res => {

      //validate response has a message
      expect(res).to.have.status(200);
      expect(res.body).to.be.an('object')

      expect(res.body).to.haveOwnProperty('sunrise');
      expect(res.body).to.haveOwnProperty('sunset');
      expect(res.body).to.haveOwnProperty('temp');
      expect(res.body).to.haveOwnProperty('temp_min');
      expect(res.body).to.haveOwnProperty('temp_max');
      expect(res.body).to.haveOwnProperty('pressure');
      expect(res.body).to.haveOwnProperty('humidity');
      expect(res.body).to.haveOwnProperty('clouds_percent');
      expect(res.body).to.haveOwnProperty('wind_speed');
      done();
    }).catch(err => {
      console.log(err);
    });
  })
})


describe('Weather api routes - validation cases', () => {

  it('it should return "lat/lng required" message and status 400 when lat and lng is missing', (done) => {
    chai.request(app).get('/cities')
      .then(res => {
        expect(res).to.have.status(400);
        expect(res.body.code).to.be.equal('BadRequestError');
        expect(res.body.message).to.be.equal('lat/lng required');
        done();
      }).catch(err => {
        console.log(err.message);
      });
  })

  it('it should return "lat/lng is not in range..." and status 400 when lat or lng is above/below limits', (done) => {
    chai.request(app).get('/cities')
      .query({ lat: 93, lng: 200 })
      .then(res => {
        expect(res).to.have.status(400);
        expect(res.body.code).to.be.equal('BadRequestError');
        expect(res.body.message).to.be.equal('lat/lng is not in range. Please insert other lat/lng.');
        done();
      }).catch(err => {
        console.log(err.message);
      });
  })

  it('it should return bad request and status 400 when lat or lng is missing', (done) => {
    chai.request(app).get('/cities')
      .query({ lat: 49.48 })
      .then(res => {
        expect(res).to.have.status(400);
        expect(res.body.code).to.be.equal('BadRequestError');
        expect(res.body.message).to.be.equal('lat/lng required');
        done();
      }).catch(err => {
        console.log(err.message);
      });
  })

  it('it should return "not found" message and 404 status code', (done) => {
    //send a GET request to /
    chai.request(app).get('/cities/2')
      .then(res => {
        expect(res).to.have.status(404);
        expect(res.body.code).to.be.equal('NotFoundError');
        expect(res.body.message).to.be.equal('not found');
        done();
      }).catch(err => {
        console.log(err.message);
      });
  })

  it('it should return "not found" message and 404 status code', (done) => {
    //send a GET request to /
    chai.request(app).get('/cities/3/weather').then(res => {
      //check response has a message
      expect(res).to.have.status(404);
      expect(res.body.code).to.be.equal('NotFoundError');
      expect(res.body.message).to.be.equal('not found');
      done();
    }).catch(err => {
      console.log(err);
    });
  })

  after((done) => {
    //stop server
    console.log('All tests completed, stopping server....')
    process.exit();
    done();
  });
});