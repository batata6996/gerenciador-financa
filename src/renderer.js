document.addEventListener('DOMContentLoaded', async () => {
    const despesaForm = document.getElementById('despesaForm')
    const corpoTabela = document.getElementById('corpoTabela')
    const resumoMensal = document.getElementById('resumoMensal')
    let rendaMensal = 0
    let rendasExtras = []

    await carregarInfoExtra()

    await carregarDespesas()
    
    // Adiciona nova despesa fixa
    despesaForm.addEventListener('submit', async (e) => {
        e.preventDefault()
        
        const descricao = document.getElementById('descricao').value
        const valor = parseFloat(document.getElementById('valor').value)
        const categoria = document.getElementById('categoria').value
        
        const novaDespesa = {
            id: Date.now().toString(),
            descricao,
            valor,
            categoria,
            pago: false
        }
        
        await window.electronAPI.addDespesa(novaDespesa)
        await carregarDespesas()
        despesaForm.reset()
    })
    
    async function carregarInfoExtra() {
        const info = await window.electronAPI.getInfoExtra()
        rendaMensal = info.rendaMensal
        rendasExtras = info.rendasExtras
    }
    // Carrega e exibe as despesas
    async function carregarDespesas() {
        const despesas = await window.electronAPI.getDespesas()
        exibirDespesas(despesas)
        atualizarResumoMensal(despesas)
    }

    // Exibe as despesas na tabela
    function exibirDespesas(despesas) {
        corpoTabela.innerHTML = ''
        
        despesas.forEach(despesa => {
            const row = document.createElement('tr')
            
            row.innerHTML = `
                <td>${despesa.descricao}</td>
                <td>${despesa.categoria}</td>
                <td>R$ ${despesa.valor.toFixed(2)}</td>
                <td>
                    <input type="checkbox" id="pago-${despesa.id}" ${despesa.pago ? 'checked' : ''}>
                    <label for="pago-${despesa.id}"></label>
                </td>
                <td><button class="btn-remover" data-id="${despesa.id}">Remover</button></td>
                <td>
                    <button class="btn-editar" data-id="${despesa.id}">Editar</button>
                </td>

                `
            
            corpoTabela.appendChild(row)
            
            // Adiciona evento ao checkbox
            document.getElementById(`pago-${despesa.id}`).addEventListener('change', (e) => {
                despesa.pago = e.target.checked
                window.electronAPI.updateDespesa(despesa)
                atualizarResumoMensal(despesas)
            })
        })
        
        // Adiciona eventos aos botões de remover
        document.querySelectorAll('.btn-remover').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = e.target.getAttribute('data-id')
                window.electronAPI.removeDespesa(id)
                carregarDespesas()
            })
        })

        document.querySelectorAll('.btn-editar').forEach(btn => {
            btn.addEventListener('click', async (e) => {
                const id = e.target.getAttribute('data-id')
                const despesas = await window.electronAPI.getDespesas()
                const despesa = despesas.find(d => d.id === id)
        
                const novaDescricao = prompt("Editar descrição:", despesa.descricao)
                const novoValor = parseFloat(prompt("Editar valor:", despesa.valor))
                const novaCategoria = prompt("Editar categoria:", despesa.categoria)
        
                if (novaDescricao && !isNaN(novoValor) && novaCategoria) {
                    despesa.descricao = novaDescricao
                    despesa.valor = novoValor
                    despesa.categoria = novaCategoria
        
                    await window.electronAPI.updateDespesa(despesa)
                    carregarDespesas()
                }
            })
        })
        
    }
    
    // Atualiza o resumo mensal
    function atualizarResumoMensal(despesas) {
        const totalDespesas = despesas.reduce((sum, despesa) => sum + despesa.valor, 0)
        const totalPago = despesas
            .filter(despesa => despesa.pago)
            .reduce((sum, despesa) => sum + despesa.valor, 0)
        
        resumoMensal.innerHTML = `
            <p>Total de despesas fixas: <strong>R$ ${totalDespesas.toFixed(2)}</strong></p>
            <p>Total já pago este mês: <strong>R$ ${totalPago.toFixed(2)}</strong></p>
            <p>Restante a pagar: <strong>R$ ${(totalDespesas - totalPago).toFixed(2)}</strong></p>
        `
    }
})