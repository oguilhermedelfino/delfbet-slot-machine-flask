import random
from flask import Flask, render_template, jsonify, session, request

app = Flask(__name__)
# Chave secreta 
app.secret_key = 'delfbet_2025'

# --- CONFIGURAÇÕES INICIAIS  ---
SIMBOLOS = ['🍒', '🍋', '🔔', '⭐', '🍇', '💎']
VALOR_APOSTA = 2
SALDO_INICIAL = 100

FRASES_CASSINO = [
    "Você sentiu isso? A vitória passou raspando!",
    "Quase cravou… não pare!",
    "A sorte tá provocando. Vai deixar passar?",
    "O jogo esquentou! Agora é hora de ousar.",
    "Isso não foi acaso… a próxima é sua.",
    "Boa! Mais uma rodada?",
]

@app.route('/')
def inicio():
    # Inicializa o saldo se o usuário acabou de chegar
    if 'saldo' not in session:
        session['saldo'] = SALDO_INICIAL
    return render_template('index.html', saldo=session['saldo'])

@app.route('/girar', methods=['POST'])
def girar_roleta():
    saldo_atual = session.get('saldo', SALDO_INICIAL)
    
    # Validação de Saldo
    if saldo_atual < VALOR_APOSTA:
        return jsonify({
            'status': 'erro',
            'mensagem': 'Saldo insuficiente! (Recarregue a página para reiniciar)'
        }), 400

    # 1. Cobra a aposta
    saldo_atual -= VALOR_APOSTA
    
    # 2. Sorteia os 3 rolos
    rolos_sorteados = [random.choice(SIMBOLOS) for _ in range(3)]
    
    # 3. Analisa o resultado
    valor_vitoria = 0
    mensagem_resultado = ""
    eh_jackpot = False
    eh_quase_vitoria = False

    # Conta quantos símbolos únicos temos
    quantidade_simbolos_unicos = len(set(rolos_sorteados))

    if quantidade_simbolos_unicos == 1:
        # Vitória Grande (3 iguais)
        valor_vitoria = VALOR_APOSTA * 20
        saldo_atual += valor_vitoria
        mensagem_resultado = "JACKPOT! 💰 TRÊS IGUAIS!"
        eh_jackpot = True
        
    elif quantidade_simbolos_unicos == 2:
        # Quase Vitória (2 iguais) -> Lógica Psicológica
        mensagem_resultado = random.choice(FRASES_CASSINO)
        eh_quase_vitoria = True
        
    else:
        # Derrota (Tudo diferente)
        mensagem_resultado = "Tente novamente."

    # Atualiza a "carteira" do usuário
    session['saldo'] = saldo_atual

    # Retorna os dados para o JavaScript
    return jsonify({
        'status': 'sucesso',
        'rolos': rolos_sorteados,
        'saldo': saldo_atual,
        'valor_vitoria': valor_vitoria,
        'mensagem': mensagem_resultado,
        'eh_jackpot': eh_jackpot,
        'eh_quase_vitoria': eh_quase_vitoria
    })

@app.route('/reset')
def reset():
    session['saldo'] = SALDO_INICIAL
    return jsonify({'saldo': SALDO_INICIAL})

if __name__ == '__main__':
    app.run(debug=True)