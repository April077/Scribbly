"use client";

import { useDraw } from "../hooks/useDraw";
import React, { useEffect, useState } from "react";
import { CompactPicker } from "react-color";
import { drawLine } from "../utils/draw";
import { io } from "socket.io-client";
import { useRecoilValue } from "recoil";
import lineWidthState from "../state/lineWidth";
import { Button } from "../components/ui/Button";

const socket = io("http://localhost:3001");

type DrawLineProps = {
  currPt: Point;
  prevPt: Point | null;
  color: string;
  lineWidth: number; // Ensure lineWidth is included
};

function Home() {
  const { canvasRef, onMouseDown, clearCanvas } = useDraw(createLine);
  const [color, setColor] = useState<string>("#000");
  const lineWidth = useRecoilValue(lineWidthState); // Get the current lineWidth from Recoil

  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;

    socket.emit("new-client");

    socket.on("get-state", () => {
      if (!canvasRef.current?.toDataURL()) return;
      socket.emit("canvas-data", canvasRef.current?.toDataURL());
    });

    socket.on("data-from-server", (state: string) => {
      const img = new Image();
      img.src = state;
      img.onload = () => {
        ctx.drawImage(img, 0, 0);
      };
    });

    socket.on("clear", () => {
      clearCanvas();
    });

    // Receive line data from the server and draw it on the canvas
    socket.on("draw-line", ({ prevPt, currPt, color, lineWidth }: DrawLineProps) => {
      drawLine({ prevPt, currPt, ctx, color, lineWidth }); // Apply the received lineWidth
    });

    return () => {
      socket.off("get-state");
      socket.off("data-from-server");
      socket.off("clear");
      socket.off("draw-line");
    };
  }, [canvasRef, clearCanvas]); // Include lineWidth if you want live changes to reflect

  function createLine({ ctx, currPt, prevPt }: Draw) {
    // Emit line data to the server including lineWidth
    socket.emit("draw-line", { prevPt, currPt, color, lineWidth });
    drawLine({ prevPt, currPt, ctx, color, lineWidth }); // Draw the line locally
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
            socket.emit("clear");
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
