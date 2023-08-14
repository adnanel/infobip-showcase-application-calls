# Application call showcase

This is a simplified application which shows how to initiate and receive
application calls using Infobip SDK.

## Configuration
### Backend
To configure the backend, do the following:
- In `/backend/config.json`, fill in your API key and Application ID (found on Infobip Portal).

### Frontend
**Configuring the frontend is optional!**
This is only required if you wish to make outgoing calls from
showcase to your backend (using `callApplication`).

To configure the frontend, do the following:
- In `App.js`, set the variable `APPLICATION_ID` to your application ID

## Running
### Backend
Run the backend using `npm start`. It should be reachable on `http://localhost:8000`

### Frontend
Run the frontend using `npm start`. It should be reachable on `http://localhost:3000`

You can find example requests inside of `/requests`.

## Use cases

### Backend initiates call & connects both parties
Backend calls the user logged in showcase (using [Calls API](https://www.infobip.com/docs/api/channels/voice/calls/call-legs/create-call)), and then in another request
also calls a phone number, connecting the two created calls in a dialog (using the [Dialog API](https://www.infobip.com/docs/api/channels/voice/calls/dialog-calls/create-dialog)).


### Frontend initiates call, backend connects
Given a scenario where the end user application (e.g. a mobile app)
initiates the conversation, the backend would receive an event of a new incoming call 
and then would be able to handle it accordingly.
For example, imagine a call center environment. The flow could be implemented in the following manner:
- End-user initiates the call (frontend calls `callApplication(your_app_id)`)
- Backend receives (via hooks) that a new incoming call has arrived
- Backend performs some internal logic and decides that the call should be connected to phone number X
- Backend (via API) creates a dialog connecting these two calls

A showcase for such a backend please consult the [calls showcase](https://github.com/infobip/infobip-calls-showcase).
