import { useEffect, useState } from "react";
import { socket } from "~/socket";

export default function Admin() {
  const [room, setRoom] = useState("");
  const [type, setType] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    socket.connect()

    return () => {
        socket.disconnect()
    }
  })

  const send = () => {
    socket.emit(type, { room: room, message: JSON.parse(message) as unknown });
  };

  return (
    <div style={{display : 'flex' , flexDirection : 'column'}}>
      <label>to room:</label>
      <input
        type="text"
        value={room}
        onChange={(e) => setRoom(e.currentTarget.value)}
      />
      <label>type</label>
      <input
        type="text"
        value={type}
        onChange={(e) => setType(e.currentTarget.value)}
      />
      <label>data</label>
      <input
        type="text"
        value={message}
        onChange={(e) => setMessage(e.currentTarget.value)}
      />
      <button onClick={() => send()}>send</button>
    </div>
  );
}
