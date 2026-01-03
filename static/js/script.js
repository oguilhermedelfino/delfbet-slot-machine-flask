document.addEventListener('DOMContentLoaded', () => {
    const botaoGirar = document.getElementById('botao-girar');
    const displaySaldo = document.getElementById('display-saldo');
    const displayMensagem = document.getElementById('mensagem-jogo');
    const rolosVisuais = [
        document.getElementById('rolo1'),
        document.getElementById('rolo2'),
        document.getElementById('rolo3')
    ];

    const simbolosVisuais = ['🍒', '🍋', '🔔', '⭐', '🍇', '💎'];
    let estaGirando = false;

    botaoGirar.addEventListener('click', async () => {
        if (estaGirando) return;
        
        estaGirando = true;
        botaoGirar.disabled = true;
        botaoGirar.innerText = "GIRANDO...";
        displayMensagem.innerText = "Boa sorte...";
        displayMensagem.className = "";

        const intervalosGiro = rolosVisuais.map(rolo => {
            rolo.classList.add('blur-effect');
            return setInterval(() => {
                rolo.innerText = simbolosVisuais[Math.floor(Math.random() * simbolosVisuais.length)];
            }, 100);
        });

        try {
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

            setTimeout(() => {
                clearInterval(intervalosGiro[0]);
                rolosVisuais[0].classList.remove('blur-effect');
                rolosVisuais[0].innerText = dados.rolos[0];
            }, 500);

            setTimeout(() => {
                clearInterval(intervalosGiro[1]);
                rolosVisuais[1].classList.remove('blur-effect');
                rolosVisuais[1].innerText = dados.rolos[1];
            }, 1000);

            setTimeout(() => {
                clearInterval(intervalosGiro[2]);
                rolosVisuais[2].classList.remove('blur-effect');
                rolosVisuais[2].innerText = dados.rolos[2];

                finalizarRodada(dados);
            }, 1500);

        } catch (erro) {
            console.error(erro);
            estaGirando = false;
            botaoGirar.disabled = false;
        }
    });

    function finalizarRodada(dados) {
        displaySaldo.innerText = `R$ ${dados.saldo.toFixed(2)}`;
        
        displayMensagem.innerText = dados.mensagem;

        if (dados.eh_jackpot) {
            displayMensagem.classList.add('highlight-win');
        } else if (dados.eh_quase_vitoria) {
            displayMensagem.classList.add('highlight-near-miss');
        }

        estaGirando = false;
        botaoGirar.disabled = false;
        botaoGirar.innerText = "GIRAR (R$ 2,00)";
    }
});
