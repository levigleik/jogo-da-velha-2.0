"use client";
import { DotLottieReact } from "@lottiefiles/dotlottie-react";

export default function LottieTicTacToe() {
  return (
    <DotLottieReact
      className="md:w-[380px] w-full h-full"
      src="/lotties/tic-tac-toe.lottie"
      loop
      autoplay
    />
  );
}
