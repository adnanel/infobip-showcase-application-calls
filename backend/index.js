const express = require('express')
const app = express()
const port = 8000
const config = require('./config.json');
const https = require('./https.js')();
const uuid = require('uuid').v4;

app.use(express.json());

app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET,PUT,POST,DELETE");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});
const AUTH = 'App ' + config.INFOBIP_API_KEY;
const IDENTITY_PREFIX = 'user';
let counter = 1;


app.get('/', (req, res) => {
  res.send('Hello World!')
})

// Login, generate a token for a new frontend session
app.post('/token', (req, res) => {
  let identity = IDENTITY_PREFIX + counter;
  let body = JSON.stringify({identity: identity, applicationId: config.INFOBIP_APP_ID});
  https.post(config.INFOBIP_API_HOST, config.INFOBIP_RTC_TOKEN_PATH, body, AUTH)
      .then(tokenResponse => {
        counter++;
        let response = JSON.parse(tokenResponse);
        response.identity = identity;
        res.json(response);
      })
      .catch(err => {
        console.error(err);
        res.sendStatus(500);
      });
})

app.post('/connect', (req, res) => {
    const parentCall = req.body.call;
    const toPhoneNumber = req.body.to;
    const fromPhoneNumber = req.body.from;
    https.post(config.INFOBIP_API_HOST, config.INFOBIP_RTC_DIALOG_PATH, JSON.stringify({
        "parentCallId": parentCall,
        "childCallRequest": {
            "endpoint": {
                "type": "PHONE",
                "phoneNumber": toPhoneNumber
            },
            "from": fromPhoneNumber,
            "connectTimeout": 60
        },
        "maxDuration": 3600,
        "propagationOptions": {
            "childCallHangup": true
        }
    }), AUTH)
        .then(dialogResponse => {
            let response = JSON.parse(dialogResponse);
            res.json(response);
        })
        .catch(err => {
            console.error(err);
            res.sendStatus(500);
        });
})


app.post('/call', (req, res) => {
    const destination = req.body.destination;
    https.post(config.INFOBIP_API_HOST, config.INFOBIP_RTC_CALL_PATH, JSON.stringify({
        "from": "ShowcaseBackend",
        "endpoint": {
            "type": "WEBRTC",
            "identity": destination
        },
        "applicationId": config.INFOBIP_RTC_APPLICATION_ID
    }), AUTH)
        .then(apiResponse => {
            let response = JSON.parse(apiResponse);
            res.json(response);
        })
        .catch(err => {
            console.error(err);
            res.sendStatus(500);
        });
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})
