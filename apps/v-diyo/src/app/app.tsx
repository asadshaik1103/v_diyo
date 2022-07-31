// eslint-disable-next-line @typescript-eslint/no-unused-vars
import styles from './app.module.scss';
import NxWelcome from './nx-welcome';

import { useState, useRef, useEffect } from 'react';

import Peer from "simple-peer";
import { io, Socket } from "socket.io-client";

// TODO set url from environment variable
// const socket = connect("http://localhost:3333/");
// const socket: Socket<any> = io("http://localhost:3333/");
const socket: Socket<any> = io("https://v-diyo.herokuapp.com/");


// MUI imports
import { TextField, Button, IconButton } from "@mui/material";
import LocalPhoneIcon from '@mui/icons-material/LocalPhone';
import AssignmentIcon from '@mui/icons-material/Assignment';

import { CopyToClipboard } from "react-copy-to-clipboard"
export function App() {
  const [me, setMe] = useState('');
  const [stream, setStream] = useState(new MediaStream());
  const [receivingCall, setReceivingCall] = useState(false);
  const [caller, setCaller] = useState(null);
  const [callerSignal, setCallerSignal] = useState('');
  const [callAccepted, setCallAccepted] = useState(false);
  const [idToCall, setIdToCall] = useState('');
  const [callEnded, setCallEnded] = useState(false);
  const [name, setName] = useState('');

  const myVideo: any = useRef(); // TODO change type accordingly
  const userVideo: any = useRef(); // TODO change type accordingly
  const connectionRef: any = useRef(); // TODO change type accordingly

  useEffect(() => {
    navigator.mediaDevices.getUserMedia({ video: true, audio: true }).then((stream: MediaStream) => {
      if (stream !== undefined && stream !== null && myVideo.current) {
        setStream(stream);
        myVideo.current.srcObject = stream; 
      }
    });

    socket.on("me", (id: string) => {
        setMe(id);
    });

    socket.on("callUser", (data: any) => {
      console.log("callUser");
      setReceivingCall(true);
      setCaller(data.from);
      setName(data.name);
      setCallerSignal(data.signal);
    });

    socket.on("error", (error: any) => {
      console.error("socket error: ", error);
    });
  }, []);


  const callUser = (id: string) => {
    const peer = new Peer({
      initiator: true,
      trickle: false,
      stream: stream,
    });

    peer.on("signal", (data) => {
      socket.emit("callUser", { userToCall: id, signal: data, from: me, name: name });
    });

    peer.on("stream", (stream) => {
      if (userVideo.current) {
        userVideo.current.srcObject = stream;
      }
    });

    socket.on("callAccepted", (signal: any) => {
      setCallAccepted(true);
      peer.signal(signal);
    });

    connectionRef.current = peer;
  }

  const answerCall = () => {
    setCallAccepted(true);
    const peer = new Peer({
      initiator: false,
      trickle: false,
      stream: stream,
    });

    peer.on("signal", (data) => {
      socket.emit("answerCall", { signal: data, to: caller });
    });

    peer.on("stream", (stream) => {
      if (userVideo.current) {
        userVideo.current.srcObject = stream;
      }
    });

    peer.signal(callerSignal);
    connectionRef.current = peer;
  }

  const leaveCall = () => {
    setCallEnded(true);
    connectionRef.current.destroy();
  }
  return (
    <>
      {/* <NxWelcome title="v-diyo" /> */}
      {/* <div /> */}
      <h1 style={{ textAlign: "center", color: '#fff' }}>V_Diyo</h1>
		<div className="container">
			<div className="video-container">
				<div className="video">
					{stream &&  <video playsInline muted ref={myVideo} autoPlay style={{ width: "300px" }} />}
				</div>
				<div className="video">
					{callAccepted && !callEnded ?
					<video playsInline ref={userVideo} autoPlay style={{ width: "300px"}} />:
					null}
				</div>
			</div>
			<div className="myId">
				<TextField
					id="filled-basic"
					label="Name"
					variant="filled"
					value={name}
					onChange={(e) => setName(e.target.value)}
					style={{ marginBottom: "20px" }}
				/>
        {/* style={{ marginBottom: "2rem" }} */}
				<CopyToClipboard text={me}>
					<Button variant="contained" color="primary" startIcon={<AssignmentIcon fontSize="large" />}>
						Copy ID
					</Button>
				</CopyToClipboard>

				<TextField
					id="filled-basic"
					label="ID to call"
					variant="filled"
					value={idToCall}
					onChange={(e) => setIdToCall(e.target.value)}
				/>
				<div className="call-button">
					{callAccepted && !callEnded ? (
						<Button variant="contained" color="secondary" onClick={leaveCall}>
							End Call
						</Button>
					) : (
						<IconButton color="primary" aria-label="call" onClick={() => callUser(idToCall)}>
							<LocalPhoneIcon fontSize="large" />
						</IconButton>
					)}
					{idToCall}
				</div>
			</div>
			<div>
				{receivingCall && !callAccepted ? (
						<div className="caller">
						<h1 >{name} is calling...</h1>
						<Button variant="contained" color="primary" onClick={answerCall}>
							Answer
						</Button>
					</div>
				) : null}
			</div>
		</div>
    </>
  );
}

export default App;
