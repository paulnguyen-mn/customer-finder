/* eslint-disable no-undef */
const { uniq } = require('lodash');
const { Cluster } = require('puppeteer-cluster');
const { retrieveDomainFromURL } = require('../utils');

exports.searchCompanyDetails = async (url) => {
  // Create a cluster with 2 workers
  const cluster = await Cluster.launch({
    concurrency: Cluster.CONCURRENCY_CONTEXT,
    maxConcurrency: 2,
    puppeteerOptions: {
      args: ['--no-sandbox'],
    },
  });

  // Event handler to be called in case of problems
  cluster.on('taskerror', (err, data) => {
    console.log(`Error crawling ${data}: ${err.message}`);
  });

  // Final result object
  const details = {
    profile: {},
    emails: [],
    links: [],
    moreProfileUrls: [],
  };
  const domain = retrieveDomainFromURL(url);

  // TASK: search email by google query
  const searchEmails = async ({ page, data: q }) => {
    await page.goto(`https://www.google.com/search?q=${q}`, { waitUntil: 'domcontentloaded' });

    const validEmailList = await page.evaluate(() => {
      // Retrieve the URLs from search result
      const EMAIL_REGEX = /[a-zA-Z._-]+@[a-zA-Z0-9-]+\.(com|vn|com.vn)+/gi;
      // eslint-disable-next-line no-undef
      const itemList = document.querySelectorAll('.g');
      let emailList = [];

      itemList.forEach((item) => {
        const matchList = item.textContent.matchAll(EMAIL_REGEX);
        const list = [...matchList].map((match) => match[0]).filter((x) => x.length < 50);
        emailList = emailList.concat(list);
      });

      return emailList.filter((x) => !!x);
    });

    details.emails = details.emails.concat(validEmailList);
  };

  // TASK: search emails from the website content
  const getEmailsFromURL = async ({ page, data }) => {
    const taskUrl = data;
    await page.goto(taskUrl, { waitUntil: 'domcontentloaded' });

    // Retrieve the URLs from search result
    const EMAIL_REGEX = /[a-zA-Z._-]+@[a-zA-Z0-9-]+\.(com|vn|com.vn)+/gi;
    const pageContent = await page.content();
    const matchList = pageContent.matchAll(EMAIL_REGEX);
    const emailList = [...matchList].map((match) => match[0]).filter((x) => x.length < 50);

    // Filter the valid emails and append the result list
    const validEmailList = emailList.filter((x) => !!x);
    console.log('getEmailsFromURL', validEmailList);
    details.emails = details.emails.concat(validEmailList);
  };

  // TASK: search linkedin links by url
  const searchLinks = async ({ page, data: q }) => {
    await page.goto(`https://www.google.com/search?q=${q}`, { waitUntil: 'domcontentloaded' });

    const validLinks = await page.evaluate(() => {
      // eslint-disable-next-line no-undef
      const itemList = document.querySelectorAll('.g');
      const linkList = [];
      itemList.forEach((item) => {
        const link = item.querySelector('a');
        if (link) linkList.push(link.href);
      });

      return linkList.filter((x) => !!x);
    });

    console.log('Search links', validLinks);
    details.links = details.links.concat(validLinks);
  };

  // TASK: crawl data on company profile site
  const searchProfile = async ({ page, data: q }) => {
    await page.goto(`https://www.google.com/search?q=${q}`, { waitUntil: 'domcontentloaded' });

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
    if (!firstValidLink) return;

    // Save all profile URLs
    const allValidLinks = result.filter((x) => x.includes('masothue.com'));
    details.moreProfileUrls = allValidLinks;

    // Visit the first valid link
    await new Promise((resolve) => setTimeout(resolve(), Math.trunc(Math.random() * 200)));
    console.log('Go to', firstValidLink);
    await page.goto(firstValidLink);
    console.log('Go to successfully', firstValidLink);

    // Retrieve details of the first URL
    const profile = await page.evaluate(() => {
      const table = document.querySelector('.table-taxinfo');
      if (!table) return {};

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

    console.log('Fetch data profile', profile);
    details.profile = profile;
  };

  // Queue list of tasks for emails
  cluster.queue(`@${domain}`, searchEmails);
  cluster.queue(`tuyển dụng + "@${domain}"`, searchEmails);
  cluster.queue(`hr + "@${domain}"`, searchEmails);
  cluster.queue(url, getEmailsFromURL);

  // for LinkedIn URLs
  cluster.queue(`vn.linkedin.com + ${domain}`, searchLinks);

  // for company profile
  cluster.queue(`masothue + ${domain}`, searchProfile);

  // Closing cluster before returning data
  await cluster.idle();
  await cluster.close();

  // Unique the search results
  details.emails = uniq(details.emails);

  return details;
};
