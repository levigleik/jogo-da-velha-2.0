"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import RulesShort from "@/components/RulesShort";
import UltimateTicTacToe from "../../components/ultimate-tic-tac-toe/UltimateTicTacToe";

export default function LocalMatchPage() {
  const [confirmOpen, setConfirmOpen] = useState(false);

  // Fechar modal com ESC
  useEffect(() => {
    if (!confirmOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setConfirmOpen(false);
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [confirmOpen]);

  return (
    <main className="min-h-screen md:p-8 p-4 flex flex-col items-center gap-6">
      <div className="w-full max-w-5xl flex justify-between items-center">
        <Link
          href="/"
          className="inline-flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium border border-neutral-300 dark:border-neutral-700 hover:bg-neutral-50 dark:hover:bg-neutral-800"
        >
          ← Início
        </Link>
        <button
          type="button"
          onClick={() => setConfirmOpen(true)}
          className="rounded-md px-3 py-2 text-sm font-medium border cursor-pointer border-neutral-300 dark:border-neutral-700 hover:bg-neutral-50 dark:hover:bg-neutral-800"
        >
          ❔ Regras
        </button>
      </div>
      <h1 className="text-2xl font-bold">Jogo da Velha 2.0 — Local</h1>
      <p className="text-sm text-neutral-600 dark:text-neutral-300">
        Jogue localmente neste dispositivo, alternando a vez entre X e O.
      </p>
      <UltimateTicTacToe />
      {confirmOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setConfirmOpen(false)}
            aria-hidden="true"
          />
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="rules-title"
            className="relative z-10 w-full max-w-xl rounded-lg shadow-lg p-4 max-h-[90vh] overflow-y-auto scrollbar-hidden"
          >
            <RulesShort />
          </div>
        </div>
      )}
    </main>
  );
}
