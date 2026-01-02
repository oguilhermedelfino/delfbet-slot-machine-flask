document.addEventListener('DOMContentLoaded', () => {
    // Selecionando elementos do HTML
    const botaoGirar = document.getElementById('botao-girar');
    const displaySaldo = document.getElementById('display-saldo');
    const displayMensagem = document.getElementById('mensagem-jogo');
    const rolosVisuais = [
        document.getElementById('rolo1'),
        document.getElementById('rolo2'),
        document.getElementById('rolo3')
    ];

    // Símbolos apenas para o efeito visual de "embaralhar"
    const simbolosVisuais = ['🍒', '🍋', '🔔', '⭐', '🍇', '💎'];
    let estaGirando = false;

    botaoGirar.addEventListener('click', async () => {
        if (estaGirando) return; // Impede clicar duas vezes
        
        // 1. Prepara o terreno (Bloqueia botão, limpa mensagens)
        estaGirando = true;
        botaoGirar.disabled = true;
        botaoGirar.innerText = "GIRANDO...";
        displayMensagem.innerText = "Boa sorte...";
        displayMensagem.className = ""; // Remove cores antigas

        // 2. Inicia o efeito visual (Animação de embaralhar)
        // Isso cria a ilusão de velocidade enquanto o servidor processa
        const intervalosGiro = rolosVisuais.map(rolo => {
            rolo.classList.add('blur-effect'); // Adiciona desfoque
            return setInterval(() => {
                // Troca o emoji a cada 100ms aleatoriamente
                rolo.innerText = simbolosVisuais[Math.floor(Math.random() * simbolosVisuais.length)];
            }, 100);
        });

        try {
            // 3. Pede ao Python o resultado real
            const resposta = await fetch('/girar', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' }
            });

            const dados = await resposta.json();

            if (dados.status === 'erro') {
                alert(dados.mensagem);
                window.location.reload();
                return;
            }

            // 4. Lógica de Parada (Aqui substituímos o time.sleep)
            // Paramos um rolo de cada vez para dar emoção
            
            // Para o Rolo 1 (0.5 segundos depois)
            setTimeout(() => {
                clearInterval(intervalosGiro[0]); // Para de trocar aleatoriamente
                rolosVisuais[0].classList.remove('blur-effect');
                rolosVisuais[0].innerText = dados.rolos[0]; // Mostra o resultado real do Python
            }, 500);

            // Para o Rolo 2 (1.0 segundo depois)
            setTimeout(() => {
                clearInterval(intervalosGiro[1]);
                rolosVisuais[1].classList.remove('blur-effect');
                rolosVisuais[1].innerText = dados.rolos[1];
            }, 1000);

            // Para o Rolo 3 (1.5 segundos depois - Fim)
            setTimeout(() => {
                clearInterval(intervalosGiro[2]);
                rolosVisuais[2].classList.remove('blur-effect');
                rolosVisuais[2].innerText = dados.rolos[2];

                // 5. Finaliza mostrando saldo e mensagens
                finalizarRodada(dados);
            }, 1500);

        } catch (erro) {
            console.error("Erro no sistema:", erro);
            estaGirando = false;
            botaoGirar.disabled = false;
        }
    });

    function finalizarRodada(dados) {
        // Atualiza o texto do saldo
        displaySaldo.innerText = `R$ ${dados.saldo.toFixed(2)}`;
        
        // Mostra a mensagem (Vitória, Derrota ou Frase Psicológica)
        displayMensagem.innerText = dados.mensagem;

        // Aplica cores baseadas no resultado
        if (dados.eh_jackpot) {
            displayMensagem.classList.add('highlight-win'); // Verde/Dourado
        } else if (dados.eh_quase_vitoria) {
            displayMensagem.classList.add('highlight-near-miss'); // Roxo (Incentivo)
        }

        // Libera o botão para jogar de novo
        estaGirando = false;
        botaoGirar.disabled = false;
        botaoGirar.innerText = "GIRAR (R$ 2,00)";
    }
});