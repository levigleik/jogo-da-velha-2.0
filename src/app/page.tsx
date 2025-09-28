import TicTacToe from "../components/tic-tac-toe/TicTacToe";

export default function Home() {
  return (
    <div className="font-sans grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20">
      <main className="flex flex-col gap-[32px] row-start-2 items-center sm:items-start">
        <h1 className="text-2xl font-bold">Tic-Tac-Toe</h1>
        <TicTacToe />
      </main>
    </div>
  );
}
