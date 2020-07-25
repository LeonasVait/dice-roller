import { World } from "../game/World";
import React, { useRef, useEffect } from "react";

let game: World;

export function GameScreen() {
  const canvas = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (canvas.current === null) {
      throw new Error("Canvas ref not found");
    }

    game = new World(canvas.current);
  }, []);

  return (
    <canvas
      ref={canvas}
      style={{ position: "absolute", height: "90%", width: "90%" }}
    ></canvas>
  );
}
