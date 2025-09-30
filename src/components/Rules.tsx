export default function Rules() {
  return (
    <div className="w-full max-w-3xl rounded-xl border border-neutral-300 dark:border-neutral-700 p-5 bg-white dark:bg-neutral-900 shadow-md space-y-6">
      <h1 className="text-2xl font-bold text-center">
        Regras do Jogo da Velha 2.0
      </h1>

      {/* Estrutura do Jogo */}
      <section>
        <h2 className="text-xl font-semibold">A Estrutura do Jogo</h2>
        <p>
          O campo de jogo consiste em um grande tabuleiro de{" "}
          <strong>3x3</strong>. Dentro de cada uma das suas nove casas, há um
          tabuleiro de jogo da velha menor, também de <strong>3x3</strong>. O
          objetivo final é vencer três dos jogos menores em uma linha, coluna ou
          diagonal no tabuleiro maior.
        </p>
      </section>

      {/* Mecânica de Jogo */}
      <section>
        <h2 className="text-xl font-semibold">
          Mecânica de Jogo: A Regra que Muda Tudo
        </h2>
        <p>
          A genialidade e o desafio do Jogo da Velha 2.0 residem em uma regra
          fundamental que interliga todos os tabuleiros:{" "}
          <strong>
            sua jogada em um dos tabuleiros pequenos determina em qual tabuleiro
            menor o oponente deverá jogar em seguida
          </strong>
          .
        </p>
        <p>
          Por exemplo, se um jogador marca o quadrado superior direito de um dos
          jogos da velha menores, o próximo jogador é obrigado a fazer sua
          jogada no tabuleiro que está localizado na posição superior direita do
          tabuleiro maior.
        </p>
        <p>
          Essa mecânica cria uma <strong>camada estratégica profunda</strong>,
          forçando os jogadores a pensarem não apenas em como vencer o pequeno
          jogo em que estão, mas também em como suas jogadas irão influenciar o
          estado geral do jogo e as opções do oponente.
        </p>
      </section>

      {/* Conquistando Território */}
      <section>
        <h2 className="text-xl font-semibold">
          Conquistando Território e Vencendo a Partida
        </h2>
        <p>
          Para vencer um dos tabuleiros menores, o jogador precisa, assim como
          no jogo tradicional, conseguir uma sequência de três de seus símbolos
          (<strong>X</strong> ou <strong>O</strong>) em linha, coluna ou
          diagonal.
        </p>
        <p>
          Uma vez que um tabuleiro menor é vencido, ele é{" "}
          <strong>marcado permanentemente</strong> com o símbolo do jogador
          vencedor.
        </p>
        <p>
          A vitória no Jogo da Velha 2.0 é alcançada quando um jogador consegue
          marcar três dos tabuleiros menores em uma linha, coluna ou diagonal no
          tabuleiro maior.
        </p>
      </section>

      {/* Regras Adicionais */}
      <section>
        <h2 className="text-xl font-semibold">
          Regras Adicionais e Situações Especiais
        </h2>
        <ul className="list-disc list-inside space-y-2">
          <li>
            <strong>Tabuleiro já vencido ou empatado:</strong> Se um jogador é
            enviado para um tabuleiro menor já vencido ou empatado, ele pode{" "}
            <strong>escolher jogar em qualquer outro tabuleiro menor</strong>{" "}
            ainda em disputa.
          </li>
          <li>
            <strong>Empate em um tabuleiro menor:</strong> Se um tabuleiro menor
            termina em empate (todas as casas ocupadas, sem vencedor), aquele
            tabuleiro é considerado <strong>neutro</strong> e não pode ser
            conquistado por nenhum jogador.
          </li>
          <li>
            <strong>Empate no jogo geral:</strong> Se todos os nove tabuleiros
            menores forem vencidos ou terminarem em empate, e nenhum jogador
            conseguir uma sequência de três no tabuleiro maior, o jogo termina
            em <strong>empate</strong>.
          </li>
        </ul>
      </section>
    </div>
  );
}
