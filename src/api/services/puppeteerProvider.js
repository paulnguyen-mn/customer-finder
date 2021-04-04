/* eslint-disable no-undef */
const puppeteer = require('puppeteer');
const { retrieveDomainFromURL } = require('../utils');

exports.searchLinks = async (url) => {
  try {
    if (!url) return [];

    const browser = await puppeteer.launch({
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });
    const page = await browser.newPage();

    // Search google with query
    const domain = retrieveDomainFromURL(url);
    const q = `vn.linkedin.com + ${domain}`;
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

const getEmailsByQuery = async (q) => {
  try {
    const browser = await puppeteer.launch({
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });
    const page = await browser.newPage();

    // Search google with query
    await page.goto(`https://www.google.com/search?q=${q}`);

    // Retrieve the URLs from search result
    const EMAIL_REGEX = /[a-zA-Z0-9._-]+@[a-zA-Z0-9-]+\.(com|vn|com.vn)+/gi;
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

exports.searchEmailsByURL = async (url) => {
  if (!url) return [];

  try {
    const domain = retrieveDomainFromURL(url);
    const [list1, list2] = await Promise.all([
      getEmailsByQuery(`vn + email + @${domain}`),
      getEmailsByQuery(`vn + viec lam + @${domain}`),
    ]);

    return list1.concat(list2);
  } catch (error) {
    console.log('Failed to search google', error);
    return [];
  }
};

exports.searchCompanyProfiles = async (url) => {
  try {
    const browser = await puppeteer.launch({
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });
    const page = await browser.newPage();

    // Search google with query
    // Search google with query
    const domain = retrieveDomainFromURL(url);
    const q = `masothue + ${domain}`;
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

    const firstValidLink = result.find((x) => x.includes('masothue.com'));
    if (!firstValidLink) return [];

    // Go to page and parse
    await new Promise((resolve) => setTimeout(resolve(), Math.trunc(Math.random() * 300)));
    await page.goto(firstValidLink);

    const profile = await page.evaluate(() => {
      const table = document.querySelector('.table-taxinfo');
      const company = {};

      const selectors = [
        { key: 'name', selector: 'thead > tr > th[itemprop="name"] > span' },
        {
          key: 'englishName',
          selector: 'tbody > tr:nth-child(1) > td[itemprop="alternateName"] > span',
        },
        {
          key: 'abbrName',
          selector: 'tbody > tr:nth-child(2) > td[itemprop="alternateName"] > span',
        },
        { key: 'taxId', selector: 'tbody > tr > td[itemprop="taxID"] > span' },
        { key: 'address', selector: 'tbody > tr > td[itemprop="address"] > span' },
        { key: 'alumni', selector: 'tbody > tr[itemprop="alumni"] > td > span[itemprop="name"]' },
        { key: 'phone', selector: 'tbody > tr > td[itemprop="telephone"] > span' },
      ];

      selectors.forEach((selector) => {
        const element = table.querySelector(selector.selector);
        if (element) company[selector.key] = element.textContent;
      });

      return company;
    });

    browser.close();
    return [profile];
  } catch (error) {
    console.log('Failed to search google', error);
    return [];
  }
};
