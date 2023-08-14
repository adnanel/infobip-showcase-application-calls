import './App.css';
import {createRef, useEffect, useRef, useState} from "react";
import {ApplicationCallOptions, createInfobipRtc, ApplicationCall} from "infobip-rtc";

const BACKEND_URL = "http://localhost:8000";
const APPLICATION_ID = "APP";

function App() {
  const [identity, setIdentity] = useState();
  const [infobipRtc, setInfobipRtc] = useState();
  const [currentCall, setCurrentCall] = useState();
  const remoteAudio = useRef();

  let status;
  let canCall = identity && !currentCall;

  if (currentCall) {
    status = `In a call!`;
    canCall = false;
  } else if (identity) {
      status = `Logged in as ${identity}. Waiting for calls...`;
      canCall = true;
  } else {
      status = "Logging in...";
      canCall = false;
  }


  useEffect(() => {
      fetch(`${BACKEND_URL}/token`, {method: "POST"})
          .then(res => res.json())
          .then(data => {
              const infobipRtc = createInfobipRtc(data.token);
              infobipRtc.on("connected", (event) => {
                  setIdentity(event.identity);
              });
              infobipRtc.on("disconnected", event => {
                  setIdentity(null);
                  setCurrentCall(null);
                  setInfobipRtc(null);
              });
              infobipRtc.on("incoming-application-call", event => {
                const call = event.incomingCall;
                setupCall(call);
                call.accept(ApplicationCallOptions.builder().setAudio(true).build());
              });
              infobipRtc.connect();
              setInfobipRtc(infobipRtc);
          });

      return () => {
          currentCall?.hangup();
          infobipRtc?.disconnect();
      };
  }, []);


  const hangupCall = () => {
      currentCall.hangup();
      setCurrentCall(null);
  }

  const initiateCall = () => {
      /** @type ApplicationCall */
      const call = infobipRtc.callApplication(APPLICATION_ID, ApplicationCallOptions.builder().setAudio(true).build());
      setupCall(call);
  };

  const setupCall = (call) => {
      console.log(remoteAudio);
      call.on("established", event => {
          remoteAudio.current.srcObject = event.stream;
      });
      call.on("error", event => {
          console.error(event);
      });
      call.on("hangup", event => {
          console.log(event);
          setCurrentCall(null);
      });
      setCurrentCall(call);
  }

  return (
    <div className="App">
      <header className="App-header">
        <p>
          {status}
        </p>

          {canCall && <div>
                  <button onClick={initiateCall} disabled={!canCall}>Initiate call</button>
              </div>
          }
          {currentCall && <div>
              <button onClick={hangupCall}>Hangup</button>
          </div>}
      </header>

       <audio ref={remoteAudio} autoPlay={true}></audio>
    </div>
  );
}

export default App;
