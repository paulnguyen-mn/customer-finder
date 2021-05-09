const puppeteerProvider = require('../services/puppeteerProvider');

/**
 * Load user and append to req.
 * @public
 */
exports.searchLinks = async (req, res, next) => {
  try {
    const { url } = req.query;
    const linkList = await puppeteerProvider.searchLinks(url);
    return res.json({ data: linkList });
  } catch (error) {
    return next(error);
  }
};

exports.searchProfiles = async (req, res, next) => {
  try {
    const { url } = req.query;
    const profiles = await puppeteerProvider.searchCompanyProfiles(url);
    return res.json({ data: profiles });
  } catch (error) {
    return next(error);
  }
};

exports.searchEmailsByURL = async (req, res, next) => {
  try {
    const { url } = req.query;
    const emailList = await puppeteerProvider.searchEmailsByURL(url);
    return res.json({ data: emailList });
  } catch (error) {
    return next(error);
  }
};

exports.getDetailsByURL = async (req, res, next) => {
  try {
    const { url } = req.query;
    const [emails, links] = await Promise.all([
      // puppeteerProvider.searchCompanyProfiles(url),
      puppeteerProvider.searchEmailsByURL(url),
      puppeteerProvider.searchLinks(url),
    ]);

    return res.json({
      data: {
        emails,
        links,
      },
    });
  } catch (error) {
    return next(error);
  }
};
