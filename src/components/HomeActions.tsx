"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback } from "react";

export default function HomeActions() {
  const router = useRouter();

  const createOnlineRoom = useCallback(() => {
    const id =
      typeof crypto !== "undefined" && "randomUUID" in crypto
        ? crypto.randomUUID()
        : Math.random().toString(36).slice(2, 10);
    router.push(`/play/${id}`);
  }, [router]);

  return (
    <section className="w-full max-w-3xl">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="text-center rounded-xl border border-neutral-300 dark:border-neutral-700 p-5 bg-white dark:bg-neutral-900">
          <h2 className="text-lg font-semibold mb-2">Partida local</h2>
          <p className="text-sm text-neutral-600 dark:text-neutral-300 mb-4">
            Jogue no mesmo dispositivo, alternando os turnos.
          </p>
          <Link
            href="/local"
            className="inline-flex items-center justify-center rounded-md px-3 py-2 text-sm font-medium border border-neutral-300 dark:border-neutral-700 hover:bg-neutral-50 dark:hover:bg-neutral-800"
          >
            Jogar localmente
          </Link>
        </div>

        <div className="text-center rounded-xl border border-neutral-300 dark:border-neutral-700 p-5 bg-white dark:bg-neutral-900">
          <h2 className="text-lg font-semibold mb-2">Partida online</h2>
          <p className="text-sm text-neutral-600 dark:text-neutral-300 mb-4">
            Crie um link e compartilhe com um amigo. A partida começa quando ele
            entrar.
          </p>
          <button
            type="button"
            onClick={createOnlineRoom}
            className="inline-flex items-center justify-center rounded-md px-3 py-2 text-sm font-medium bg-emerald-600 text-white hover:bg-emerald-700"
          >
            Criar sala online
          </button>
        </div>
      </div>
    </section>
  );
}
