const puppeteer = require('puppeteer');

exports.searchLinks = async (name) => {
  try {
    if (!name) return [];

    const browser = await puppeteer.launch({
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });
    const page = await browser.newPage();

    // Search google with query
    const q = encodeURIComponent(name);
    await page.goto(`https://www.google.com/search?q=${q}`);

    // Retrieve the URLs from search result
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
    console.log('Failed to search google', error);
    return [];
  }
};

exports.searchEmailsByURL = async (url) => {
  if (!url) return [];

  try {
    const browser = await puppeteer.launch({
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });
    const page = await browser.newPage();

    // Go to URL and try to see if there is an email address
    await page.goto(url);

    // Retrieve the URLs from search result
    const EMAIL_REGEX = /[a-zA-Z0-9.!#$%&'*+?^_`{|}~-]+@[a-zA-Z0-9-]+\.(com|vn|com.vn)+/gi;
    const pageContent = await page.content();
    const matchList = pageContent.matchAll(EMAIL_REGEX);
    const emailList = [...matchList].map((match) => match[0]).filter((x) => x.length < 50);

    browser.close();
    return emailList;
  } catch (error) {
    console.log('Failed to search google', error);
    return [];
  }
};

exports.searchLinkedInURLs = async (name) => {
  if (!name) return [];

  try {
    const browser = await puppeteer.launch({
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });
    const page = await browser.newPage();

    // Search google with query
    const q = encodeURIComponent(`site:linkedin.com ${name}`);
    await page.goto(`https://www.google.com/search?q=${q}`);

    // Retrieve the URLs from search result
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
    console.log('Failed to search google', error);
    return [];
  }
};

exports.searchCompanyProfiles = async (name) => {
  try {
    const browser = await puppeteer.launch({
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });
    const page = await browser.newPage();

    // Search google with query
    const q = encodeURIComponent(name);
    await page.goto(`https://masothue.com/Search/?q=${q}&type=auto&force-search=1`);

    // Retrieve the URLs from search result
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
    console.log('Failed to search google', error);
    return [];
  }
};
