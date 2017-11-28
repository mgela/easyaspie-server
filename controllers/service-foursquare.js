// imports
const fetch = require('node-fetch');
const GeneralService = require('./service-general');

// class definition
class FoursquareService extends GeneralService {
  // the map method tries to match a google places ID with a foursquare ID
  map(googleData) {
    return new Promise((resolve) => {
      // build name query param
      const nameQuery = googleData.name
        .split(' ')
        .map(el => `&query=${encodeURI(el)}`)
        .join('');
      // build api URL
      const googleLat = googleData.geometry.location.lat;
      const googleLng = googleData.geometry.location.lng;
      const apiSlug = 'https://api.foursquare.com/v2/venues/search?ll=';
      const clientSecret = process.env.FOURSQUARE_CLIENT_SECRET;
      const clientId = process.env.FOURSQUARE_CLIENT_ID;
      const url = `${apiSlug}${googleLat},${googleLng}${nameQuery}&radius=100&client_id=${
        clientId
      }&client_secret=${clientSecret}&v=20171124`;
      // try searching foursquare
      try {
        fetch(url, { method: 'GET' })
          .then(data => data.json())
          .then((data) => {
            if (data.meta.code === 200 && data.response.venues.length > 0) {
              resolve(data.response.venues[0].id);
            }
            resolve('NA');
          });
      } catch (err) {
        // eslint-disable-next-line
        console.error(err);
        resolve('NA');
      }
    });
  }

  // the fetch method tries to fetch data for a given foursquare ID
  fetch(id) {
    const url = `https://api.foursquare.com/v2/venues/${id}?client_id=${
      process.env.FOURSQUARE_CLIENT_ID
    }&client_secret=${process.env.FOURSQUARE_CLIENT_SECRET}&v=20171124`;
    try {
      return fetch(url, {
        method: 'GET',
      })
        .then(data => data.json())
        .then(data => data.response.venue);
    } catch (err) {
      // eslint-disable-next-line
      console.error(err);
      return {};
    }
  }

  // the extract method extracts the important information form the foursquare data
  extract(data) {
    const categories = data.categories.map(category => category.shortName);
    // extract common data
    const summary = super.summaryStructure(
      'foursquare',
      data.name || null,
      data.rating || null,
      data.price ? data.price.tier : null,
      data.stats ? data.stats.tipCount : null,
      data.bestPhoto
        ? `${data.bestPhoto.prefix}${data.bestPhoto.width}x${data.bestPhoto.height}${
          data.bestPhoto.suffix
        }`
        : null,
      categories || null,
    );
    return summary;
  }
}

module.exports = FoursquareService;
