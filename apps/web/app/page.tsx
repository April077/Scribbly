"use client";

import { useDraw } from "../hooks/useDraw";
import React, { useEffect, useState } from "react";
import { CompactPicker } from "react-color";
import { drawLine } from "../utils/draw";
import { useRecoilValue } from "recoil";
import lineWidthState from "../state/lineWidth";
import { Button } from "../components/ui/Button";

const ws = new WebSocket("ws://localhost:8080");

function Home() {
  const { canvasRef, onMouseDown, clearCanvas } = useDraw(createLine);
  const [color, setColor] = useState<string>("#000");
  const lineWidth = useRecoilValue(lineWidthState);
  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;

    ws.onopen = () => {
      console.log("WebSocket connected");
      ws.send(JSON.stringify({ type: "new-client" }));
    };

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      switch (data.type) {
        case "get-state":
          if (!canvasRef.current?.toDataURL()) return;
          ws.send(
            JSON.stringify({
              type: "canvas-data",
              data: canvasRef.current?.toDataURL(),
            })
          );
          break;

        case "data-from-server":
          const img = new Image();
          img.src = data.data;
          img.onload = () => {
            ctx.drawImage(img, 0, 0);
          };
          break;

        case "clear":
          clearCanvas();
          break;

        case "draw-line":
          const { prevPt, currPt, color, lineWidth } = data;
          drawLine({ prevPt, currPt, ctx, color, lineWidth });
          break;

        default:
          console.log("Unknown message type:", data.type);
          break;
      }
    };

    ws.onclose = (event) => {
      console.log("WebSocket closed:", event);
    };
  }, [canvasRef, clearCanvas]);

  function createLine({ ctx, currPt, prevPt }: Draw) {
    ws.send(
      JSON.stringify({ type: "draw-line", prevPt, currPt, color, lineWidth })
    );
    drawLine({ prevPt, currPt, ctx, color, lineWidth });
  }

  const handleDownload = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const dataURL = canvas.toDataURL("image/png");
    const link = document.createElement("a");
    link.href = dataURL;
    link.download = "drawing.png";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="p-5 flex justify-center items-center gap-5 bg-white w-screen h-screen">
      <canvas
        onMouseDown={onMouseDown}
        ref={canvasRef}
        width={1000}
        height={500}
        className="border-[1px] rounded-md border-black"
      />
      <div className="flex justify-center flex-col space-y-5 items-center">
        <CompactPicker color={color} onChange={(e) => setColor(e.hex)} />
        <Button
          size={"sm"}
          variant={"outline"}
          className="px-8"
          onClick={() => {
            ws.send(JSON.stringify({ type: "clear" }));
          }}
        >
          Clear
        </Button>
        <Button size={"sm"} variant={"outline"} onClick={handleDownload}>
          Download
        </Button>
      </div>
    </div>
  );
}

export default Home;
