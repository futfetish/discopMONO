import React, { useState, useEffect } from "react";
import { socket } from "../../socket";
import { ConnectionState } from "./ConnectionState";
import { ConnectionManager } from "./ConnectionManager";
import { Events } from "./Events";
import { MyForm } from "./MyForm";

export default function Socket() {
  const [isConnected, setIsConnected] = useState(socket.connected);
  const [fooEvents, setFooEvents] = useState<string[]>([]);

  useEffect(() => {
    socket.connect();
    console.warn("CONNECT");
    function onConnect() {
      setIsConnected(true);
    }

    function onDisconnect() {
      setIsConnected(false);
    }

    function onFooEvent(value: string) {
      setFooEvents((previous) => [...previous, value]);
    }

    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);
    socket.on("hello", onFooEvent);

    return () => {
      console.warn("DISCONNECT");
      setFooEvents([]);
      socket.off("connect", onConnect);
      socket.off("disconnect", onDisconnect);
      socket.off("hello", onFooEvent);
      socket.disconnect();
    };
  }, []);

  return (
    <div className="App">
      <ConnectionState isConnected={isConnected} />
      <Events events={fooEvents} />
      <ConnectionManager />
      <MyForm />
    </div>
  );
}
