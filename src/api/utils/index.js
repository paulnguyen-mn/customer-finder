/* eslint-disable import/prefer-default-export */
exports.retrieveDomainFromURL = (url) => {
  if (!url) return '';

  return url.replace('https://www.', '').replace('https://', '').replace('http://', '');
};
