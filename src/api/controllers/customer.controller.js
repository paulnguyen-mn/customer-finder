const puppeteerProvider = require('../services/puppeteerProvider');
const puppeteerClusterProvider = require('../services/puppeteerClusterProvider');

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
    const companyDetails = await puppeteerClusterProvider.searchCompanyDetails(url);

    return res.json({
      data: companyDetails,
    });
  } catch (error) {
    return next(error);
  }
};
