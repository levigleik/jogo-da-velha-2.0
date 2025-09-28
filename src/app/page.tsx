import UltimateTicTacToe from "../components/ultimate-tic-tac-toe/UltimateTicTacToe";

export default function Home() {
  return (
    <div className="font-sans grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20">
      <main className="flex flex-col gap-[32px] row-start-2 items-center sm:items-start">
        <h2 className="text-2xl font-bold mt-8">Jogo da Velha 2.0</h2>
        <UltimateTicTacToe />
      </main>
    </div>
  );
}
