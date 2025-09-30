"use client";

import Link from "next/link";
import UltimateTicTacToe from "../../components/ultimate-tic-tac-toe/UltimateTicTacToe";

export default function LocalMatchPage() {
  return (
    <main className="min-h-screen md:p-8 p-4 flex flex-col items-center gap-6">
      <div className="w-full max-w-5xl">
        <Link
          href="/"
          className="inline-flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium border border-neutral-300 dark:border-neutral-700 hover:bg-neutral-50 dark:hover:bg-neutral-800"
        >
          ← Início
        </Link>
      </div>
      <h1 className="text-2xl font-bold">Jogo da Velha 2.0 — Local</h1>
      <p className="text-sm text-neutral-600 dark:text-neutral-300">
        Jogue localmente neste dispositivo, alternando a vez entre X e O.
      </p>
      <UltimateTicTacToe />
    </main>
  );
}
