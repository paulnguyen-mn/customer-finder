const puppeteer = require('puppeteer');

const test = async () => {
  try {
    const browser = await puppeteer.launch({
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });
    const page = await browser.newPage();
    const q = encodeURIComponent('minh long');
    await page.goto(`https://www.google.com/search?q=${q}`);
    const result = await page.evaluate(() => {
      // eslint-disable-next-line no-undef
      const itemList = document.querySelectorAll('.g');
      const linkList = [];
      itemList.forEach((item) => {
        const link = item.querySelector('a');
        if (link) linkList.push(link.href);
      });

      return linkList.filter((x) => !!x);
    });

    browser.close();
    return result;
  } catch (error) {
    console.log('Failed to fetch', error);
    return null;
  }
};

/**
 * Load user and append to req.
 * @public
 */
exports.test = async (req, res, next) => {
  try {
    const result = await test();
    return res.json({ data: result });
  } catch (error) {
    return next(error);
  }
};
