const querystring = require('querystring');

function factory(clientId, api) {
  /**
   * Approved sendnumber's list
   */
  async function list() {
    const url = `/2/sendnumber/list/${clientId}`;

    const res = await api.get(url);
    return res.data;
  }

  /**
   * Search for approved sendnumber
   *
   * @param {string} sendnumber Phone number for search
   */
  async function search(sendnumber) {
    const url = `/2/sendnumber/list/${clientId}?sendnumber=${sendnumber}`;

    const res = await api.get(url);
    return res.data;
  }

  /**
   * Request a pincode to approve
   *
   * @param {string} sendnumber Phone number to approve
   * @param {object} [options={}] Optional data
   * @param {string} [options.comment] Comment of the sendnumber
   * @param {string} [options.pintype] Pincode type to request (SMS, VMS)
   */
  async function request_pincode(sendnumber, options = {}) {
    const url = `/2/sendnumber/save/${clientId}`;
    const data = {
      sendnumber,
      comment: options.comment || '',
      pintype: options.pintype || 'SMS',
    };

    const res = await api.post(url, querystring.stringify(data));
    return res.data;
  }

  /**
   * Approve the sendnumber
   *
   * @param {string} sendnumber Phone number to approve
   * @param {string} pincode Received pincode after request_pincode
   * @param {object} [options={}] Optional data
   * @param {string} [options.comment] Comment of the sendnumber
   * @param {string} [options.pintype] Pincode type to request (SMS, VMS)
   */
  async function approve(sendnumber, pincode, options = {}) {
    const url = `/2/sendnumber/save/${clientId}`;
    const data = {
      sendnumber,
      pincode,
      comment: options.comment || '',
      pintype: options.pintype || 'SMS',
    };

    const res = await api.post(url, querystring.stringify(data));
    return res.data;
  }

  return {
    search,
    list,
    request_pincode,
    approve,
  };
}

module.exports = factory;
