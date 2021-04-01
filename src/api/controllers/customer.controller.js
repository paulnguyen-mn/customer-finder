const puppeteerProvider = require('../services/puppeteerProvider');

/**
 * Load user and append to req.
 * @public
 */
exports.searchLinks = async (req, res, next) => {
  try {
    const name = req.query.q;
    const linkList = await puppeteerProvider.searchLinks(name);
    return res.json({ data: linkList });
  } catch (error) {
    return next(error);
  }
};

exports.searchEmailsByURL = async (req, res, next) => {
  try {
    const url = req.query.ref;
    const emailList = await puppeteerProvider.searchEmailsByURL(url);
    return res.json({ data: emailList });
  } catch (error) {
    return next(error);
  }
};

exports.searchLinkedInURLs = async (req, res, next) => {
  try {
    const url = req.query.q;
    const linkList = await puppeteerProvider.searchLinkedInURLs(url);
    return res.json({ data: linkList });
  } catch (error) {
    return next(error);
  }
};
