import random
import os
from flask import Flask, render_template, jsonify, session, request

app = Flask(__name__)
app.secret_key = os.environ.get('SECRET_KEY', 'delfbet_2025')

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
    if 'saldo' not in session:
        session['saldo'] = SALDO_INICIAL
    return render_template('index.html', saldo=session['saldo'])

@app.route('/girar', methods=['POST'])
def girar_roleta():
    saldo_atual = session.get('saldo', SALDO_INICIAL)
    
    if saldo_atual < VALOR_APOSTA:
        return jsonify({
            'status': 'erro',
            'mensagem': 'Saldo insuficiente! (Recarregue a página para reiniciar)'
        }), 400

    saldo_atual -= VALOR_APOSTA
    
    rolos_sorteados = [random.choice(SIMBOLOS) for _ in range(3)]
    
    valor_vitoria = 0
    mensagem_resultado = ""
    eh_jackpot = False
    eh_quase_vitoria = False

    quantidade_simbolos_unicos = len(set(rolos_sorteados))

    if quantidade_simbolos_unicos == 1:
        valor_vitoria = VALOR_APOSTA * 20
        saldo_atual += valor_vitoria
        mensagem_resultado = "JACKPOT! 💰 TRÊS IGUAIS!"
        eh_jackpot = True
        
    elif quantidade_simbolos_unicos == 2:
        mensagem_resultado = random.choice(FRASES_CASSINO)
        eh_quase_vitoria = True
        
    else:
        mensagem_resultado = "Tente novamente."

    session['saldo'] = saldo_atual

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
    port = int(os.environ.get("PORT", 5000))
    app.run(host='0.0.0.0', port=port)
