import { WebSocket, WebSocketServer } from "ws";

type Point = {
  x: number;
  y: number;
};

type DataType = {
  type?: string;
  prevPt?: Point;
  currPt?: Point;
  color?: string;
  data?: any;
};

const wss = new WebSocketServer({ port: 8080 });
// const clients = new Set<WebSocket>();

wss.on("connection", (ws) => {
  console.log("client connected");
  // clients.add(ws);

  ws.on("message", (data: string) => {
    let message: DataType;
    try {
      message = JSON.parse(data);
    } catch (error) {
      console.error("Invalid JSON:", error);
      return;
    }
    console.log(message)

    switch (message.type) {
      case "draw-line":
        broadcast({
          type: "draw-line",
          prevPt: message.prevPt,
          currPt: message.currPt,
          color: message.color,
        });
        break;

      case "new-client":
        broadcast({ type: "get-state" });
        break;

      case "canvas-data":
        broadcast({ type: "data-from-server", data: message.data });
        break;

      case "clear":
        broadcast({ type: "clear" });
        break;

      default:
        console.log("Unknown message type:", message.type);
    }
  });

  function broadcast(message: DataType) {
    wss.clients.forEach((client: WebSocket) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify(message));
      }
    });
  }
  ws.on("close", () => {
    console.log("Client disconnected");
  });
});
