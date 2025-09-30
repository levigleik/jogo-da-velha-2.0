export default function RulesShort() {
  return (
    <div className="w-full max-w-3xl rounded-xl border border-neutral-300 dark:border-neutral-700 p-5 bg-white dark:bg-neutral-900 shadow-md space-y-4">
      <h1 className="text-2xl font-bold text-center">
        Resumo do Jogo da Velha 2.0
      </h1>
      <p>
        O Jogo da Velha 2.0 é uma versão estratégica e complexa do jogo
        clássico, disputado em um grande tabuleiro <strong>3x3</strong> que
        contém nove tabuleiros menores.
      </p>

      <h2 className="text-xl font-semibold">Pontos Principais:</h2>
      <ul className="list-disc list-inside space-y-2">
        <li>
          <strong>Estrutura:</strong> São 9 jogos da velha pequenos dentro de um
          tabuleiro maior. O objetivo é vencer no tabuleiro grande.
        </li>
        <li>
          <strong>Regra Fundamental:</strong> A casa que você joga em um
          tabuleiro pequeno determina em qual tabuleiro grande o seu oponente
          deverá jogar na próxima rodada. Por exemplo, jogar na casa inferior
          esquerda de um mini-tabuleiro força seu oponente a jogar no tabuleiro
          que fica na posição inferior esquerda do tabuleiro principal.
        </li>
        <li>
          <strong>Vitória Parcial:</strong> Para conquistar um dos tabuleiros
          menores, você precisa fazer uma sequência de três símbolos (linha,
          coluna ou diagonal), como no jogo tradicional.
        </li>
        <li>
          <strong>Vitória Final:</strong> O jogo é ganho quando um jogador
          conquista três tabuleiros menores em linha, coluna ou diagonal no
          tabuleiro maior.
        </li>
        <li>
          <strong>Regra Especial:</strong> Se um jogador for enviado para um
          tabuleiro que já foi ganho ou empatado, ele ganha o direito de
          escolher jogar em qualquer outro tabuleiro que ainda esteja
          disponível.
        </li>
      </ul>
    </div>
  );
}
