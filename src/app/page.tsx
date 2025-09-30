import HomeActions from "../components/HomeActions";

export default function Home() {
  return (
    <div className="font-sans grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20">
      <main className="flex flex-col gap-[32px] row-start-2 items-center w-full">
        <h1 className="text-3xl font-bold">Jogo da Velha 2.0</h1>
        <p className="text-sm text-neutral-600 dark:text-neutral-300">
          Como você deseja jogar?
        </p>
        <HomeActions />
      </main>
    </div>
  );
}
