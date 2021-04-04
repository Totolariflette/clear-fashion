const axios = require('axios');
const cheerio = require('cheerio');

/**
 * Parse webpage e-shop
 * @param  {String} data - html response
 * @return {Array} products
 */
const parse = data => {
    const $ = cheerio.load(data);

    return $('.product-container .right-block')
        .map((i, element) => {
            const name = $(element)
                .find('.product-name')
                .attr("title")
                .trim()
                .replace(/\s/g, ' ');
            const price = parseInt(
                $(element)
                .find('.product-price')
                .text()
                .replace(/€/g, '')
                .replace(/,/g, '.')
            );

            return {name, price};
        })
        .get();
};

/**
 * Scrape all the products for a given url page
 * @param  {[type]}  url
 * @return {Array|null}
 */
module.exports.scrape_products = async url => {
    const response = await axios(url);
    const {data, status} = response;

    if (status >= 200 && status < 300) {
        return parse(data);
    }

    console.error(status);

    return null;
};

const parse_links = data => {
  const $ = cheerio.load(data);

  return $('.cbp-hrmenu-tab')
    .map((i, element) => {
      const link = $(element)
        .find('.cbp-hrmenu-tab > a[href]')
        .attr('href')

      return link;
    })
    .get();
};

module.exports.scrape_links = async url => {
  const response = await axios(url);
  const {data, status} = response;

  if (status >= 200 && status < 300) {
    return parse_links(data);
  }

  console.error(status);

  return null;
};