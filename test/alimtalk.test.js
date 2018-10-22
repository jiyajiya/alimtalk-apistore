const clientId = process.env.CLIENT_ID;
const authKey = process.env.AUTH_KEY;
if (!clientId || !authKey) {
  console.log(
    '!! enter CLIENT_ID and AUTH_KEY values\n',
    '(use "CLIENT_ID=<apistore\'s id> AUTH_KEY=<auth key> npm test" to test)\n',
    '(use "NOCK_OFF=true CLIENT_ID=<apistore\'s id> AUTH_KEY=<auth key> npm test" to test what will request the apistore\'s server)'
  );
  return;
}

const { expect } = require('chai');
const nock = require('nock');
const { alimtalk, sendnumber } = require('../index.js')(clientId, authKey);

const sleep = duration => {
  return new Promise(resolve => {
    setTimeout(function() {
      resolve();
    }, duration);
  });
};

describe('## about alimtalk.js', () => {
  before('Build up apistore api mock', () => {
    nock('http://api.apistore.co.kr/kko')
      .post(`/1/msg/${clientId}`)
      .reply(200, {
        result_message: 'Success',
        result_code: '200',
        cmid: '0000000000000000000000',
      })
      .get(url => {
        return url.indexOf(`/1/report/${clientId}?cmid=`) >= 0;
      })
      .reply(200, {
        STATUS: '3',
        phone: '0200000000',
        sentdate: '0000-00-00 00:00:00.0',
        msg_rslt: '00',
        callback: '01000000000',
        CMID: '0000000000000000000000',
        RSLT: '0',
      })
      .get(`/1/template/list/${clientId}`)
      .reply(200, {
        result_code: '200',
        result_message: 'success',
        templateList: [],
      });
  });

  after('Clean up mock', () => {
    nock.cleanAll();
  });

  let cmid = '';
  describe.skip('# when send a alimtalk', () => {
    it('should be received cmid', async () => {
      const sender = '';
      const receiver = '';
      const msg = '';
      const templateCode = '';
      const options = {};

      const res = await alimtalk.send(
        sender,
        receiver,
        msg,
        templateCode,
        options
      );
      cmid = res.cmid;

      expect(res.result_code).to.equal('200');
      expect(res.cmid).to.match(/^\d+$/);
    });
  });

  describe("# when check the alimtalk's sended", () => {
    it('should be received STATUS with one of 1,2,3,4 values', async () => {
      if (process.env.NOCK_OFF) {
        // If called immediately after send, null value is returned.
        // Sleep time depends on apistore's server state.
        await sleep(6000);
      }

      const res = await alimtalk.send_result(cmid);
      expect(res.STATUS).to.be.oneOf(['1', '2', '3', '4']);
    });
  });

  describe('# when viewing the template list', () => {
    it('should be received result_code of 200 value', async () => {
      const res = await alimtalk.template_list();
      expect(res.result_code).to.equal('200');
    });
  });
});

describe('## about alimtalk.sendnumber.js', () => {
  before('Build up apistore api mock', () => {
    nock('http://api.apistore.co.kr/kko')
      .get(`/2/sendnumber/list/${clientId}`)
      .reply(200, {
        result_code: '200',
        numberList: [],
      })
      .get(url => {
        return url.indexOf(`/2/sendnumber/list/${clientId}?sendnumber=`) >= 0;
      })
      .reply(200, {
        result_code: '200',
        numberList: [],
      })
      .post(`/2/sendnumber/save/${clientId}`)
      .reply(200, {
        result_code: '200',
        sendnumber: '',
      });
  });

  after('Clean up mock', () => {
    nock.cleanAll();
  });

  describe("# when viewing the sender's approved phone numbers", () => {
    it('should be an array', async () => {
      const res = await sendnumber.list();
      expect(res.result_code).to.equal('200');
      expect(res.numberList).to.be.a('array');
    });

    it('should be received result_code with one of 200,300 values', async () => {
      const phone = '020000000';

      const res = await sendnumber.search(phone);
      expect(res.result_code).to.be.oneOf(['200', '300']);
    });
  });

  describe.skip("# when approve the sender's phone number", () => {
    it('should be sent a pincode to a phone number', async () => {
      const phone = '020000000';
      const options = {
        comment: 'call center',
        pintype: 'VMS',
      };

      const res = await sendnumber.request_pincode(phone, options);
      expect(res.result_code).to.equal('200');
    });

    it('should be approved the phone number', async () => {
      const phone = '020000000';
      const pincode = '00';
      const options = {
        comment: 'call center',
        pintype: 'VMS',
      };

      const res = await sendnumber.approve(phone, pincode, options);
      expect(res.result_code).to.equal('200');
    });
  });
});
