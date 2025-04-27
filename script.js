// ----------- MODAIS -----------
const modal = document.getElementById('myModal');
const botaoAbrirModal = document.getElementById('openModal');
const fecharModalSpan = document.getElementById('closeModal');
const botaoFecharModal = document.getElementById('closeModalBtn');
const formulario = document.getElementById('cardForm');

const modalFiltro = document.getElementById('filterModal');
const botaoAbrirModalFiltro = document.getElementById('openFilterModal');
const fecharModalFiltroSpan = document.getElementById('closeFilterModal');
const cancelarModalFiltro = document.getElementById('cancelFilterModal');
const formularioFiltro = document.getElementById('filterCardForm');

// Abrir e fechar modais
function configurarModais() {
  // Modal de adicionar tarefa
  botaoAbrirModal.onclick = () => modal.style.display = 'block';
  fecharModalSpan.onclick = () => modal.style.display = 'none';
  botaoFecharModal.onclick = (e) => { 
    e.preventDefault(); 
    modal.style.display = 'none'; 
  };

  // Modal de filtro
  botaoAbrirModalFiltro.onclick = () => modalFiltro.style.display = 'block';
  fecharModalFiltroSpan.onclick = () => modalFiltro.style.display = 'none';
  cancelarModalFiltro.onclick = () => modalFiltro.style.display = 'none';
}

// ----------- DRAG AND DROP -----------
const colunas = document.querySelectorAll('.tarefa');
let cartaoArrastado = null;

function tornarArrastavel(cartao) {
  cartao.draggable = true;

  cartao.addEventListener('dragstart', () => {
    cartaoArrastado = cartao;
    cartao.classList.add('arrastando');
  });

  cartao.addEventListener('dragend', () => {
    cartaoArrastado = null;
    cartao.classList.remove('arrastando');
  });
}

function configurarDragAndDrop() {
  colunas.forEach(coluna => {
    coluna.addEventListener('dragover', (e) => e.preventDefault());
    coluna.addEventListener('dragenter', (e) => {
      e.preventDefault();
      coluna.classList.add('arrastar-sobre');
    });
    coluna.addEventListener('dragleave', () => coluna.classList.remove('arrastar-sobre'));
    coluna.addEventListener('drop', (e) => {
      e.preventDefault();
      coluna.classList.remove('arrastar-sobre');

      if (cartaoArrastado) {
        const elementoApos = obterElementoAposArraste(coluna, e.clientY);
        if (elementoApos == null) {
          coluna.appendChild(cartaoArrastado);
        } else {
          coluna.insertBefore(cartaoArrastado, elementoApos);
        }
        atualizarEstado(cartaoArrastado, coluna);
        atualizarContadores();
      }
    });
  });
}

function obterElementoAposArraste(coluna, y) {
  const cartoes = [...coluna.querySelectorAll('.card:not(.arrastando)')];
  return cartoes.reduce((maisProximo, cartao) => {
    const box = cartao.getBoundingClientRect();
    const offset = y - box.top - box.height / 2;
    if (offset < 0 && offset > maisProximo.offset) {
      return { offset, element: cartao };
    } else {
      return maisProximo;
    }
  }, { offset: Number.NEGATIVE_INFINITY }).element;
}

function atualizarEstado(cartao, coluna) {
  const tituloColuna = coluna.parentElement.querySelector('.titulo-coluna').textContent.toLowerCase();

  if (tituloColuna.includes('aberto')) cartao.dataset.estado = 'aberto';
  else if (tituloColuna.includes('andamento')) cartao.dataset.estado = 'andamento';
  else if (tituloColuna.includes('concluído')) cartao.dataset.estado = 'concluido';
  else if (tituloColuna.includes('done done')) cartao.dataset.estado = 'feito';
}

// ----------- ADICIONAR NOVA TAREFA -----------
function adicionarNovaTarefa() {
  formulario.onsubmit = function(evento) {
    evento.preventDefault();

    const titulo = document.getElementById('title').value.trim();
    const conteudo = document.getElementById('content').value.trim();
    const dataEntrega = document.getElementById('dataentrega').value;
    const prioridade = document.getElementById('priority').value;

    const cartao = document.createElement('div');
    cartao.className = 'card';
    cartao.dataset.datetime = Date.now();
    cartao.dataset.priority = prioridade;
    cartao.dataset.title = titulo.toLowerCase();
    cartao.dataset.estado = 'aberto';

    cartao.innerHTML = `
      <h3>${titulo}</h3>
      <p>${conteudo}</p>
      <p><strong>Entrega:</strong> ${dataEntrega}</p>
      <div class="subtarefas-titulo">
        <span>Subtarefas:</span>
        <button class="botao-adicionar-subtarefa">+</button>
      </div>
      <div class="subtarefas"></div>
    `;

    switch (prioridade) {
      case 'urgente': cartao.style.backgroundColor = '#ff9999'; break;
      case 'alta': cartao.style.backgroundColor = '#ffb74d'; break;
      case 'media': cartao.style.backgroundColor = '#ffe599'; break;
      case 'baixa': cartao.style.backgroundColor = '#b2f2bb'; break;
    }

    // Tornar o novo cartão arrastável
    tornarArrastavel(cartao);

    // Adicionar o cartão à primeira coluna
    colunas[0].appendChild(cartao);

    // Configurar o botão de adicionar subtarefas
    const botaoAdicionarSubtarefa = cartao.querySelector('.botao-adicionar-subtarefa');
    const divSubtarefas = cartao.querySelector('.subtarefas');

    botaoAdicionarSubtarefa.onclick = () => {
      const textoSubtarefa = prompt('Digite o nome da subtarefa:');
      if (textoSubtarefa) {
        const subtarefa = document.createElement('div');
        subtarefa.innerHTML = `<input type="checkbox"> ${textoSubtarefa}`;
        divSubtarefas.appendChild(subtarefa);
      }
    };

    atualizarContadores();
    formulario.reset();
    modal.style.display = 'none';
  };
}

// ----------- ATUALIZAR CONTADORES -----------
function atualizarContadores() {
  colunas.forEach(coluna => {
    const contador = coluna.parentElement.querySelector('.contador');
    const quantidade = coluna.querySelectorAll('.card').length;
    if (contador) contador.textContent = quantidade;
  });
}

// ----------- ORDENAR CARTÕES -----------
function ordenarCartoes() {
  const botoesOrdenar = document.querySelectorAll('.ordenar');

  function ordenar(coluna, criterio) {
    const cartoes = Array.from(coluna.querySelectorAll('.card'));

    if (criterio === 'data') {
      cartoes.sort((a, b) => {
        const dataA = Number(a.dataset.datetime);
        const dataB = Number(b.dataset.datetime);
        return dataA - dataB;
      });
    } else if (criterio === 'prioridade') {
      const ordemPrioridade = { 'urgente': 1, 'alta': 2, 'media': 3, 'baixa': 4 };
      cartoes.sort((a, b) => ordemPrioridade[a.dataset.priority] - ordemPrioridade[b.dataset.priority]);
    }

    cartoes.forEach(cartao => coluna.appendChild(cartao));
    atualizarContadores();
  }

  botoesOrdenar.forEach(botao => {
    botao.addEventListener('click', () => {
      const coluna = botao.closest('.coluna-painel').querySelector('.tarefa');
      const criterio = botao.getAttribute('data-sort');
      ordenar(coluna, criterio);
    });
  });
}

// ----------- FILTRAR E MOSTRAR DENTRO DO MODAL -----------
function filtrarCartoes() {
  formularioFiltro.onsubmit = function(evento) {
    evento.preventDefault();

    const estadoSelecionado = document.getElementById('estado').value;
    const tituloFiltro = document.getElementById('filterTitle').value.trim().toLowerCase();
    const cartoes = document.querySelectorAll('.card');
    const divResultadosFiltro = document.getElementById('filterResults');

    divResultadosFiltro.innerHTML = '';
    let encontrou = false;

    const filtroAtivo = estadoSelecionado !== 'sem_filtro' || tituloFiltro !== '';

    if (!filtroAtivo) {
      divResultadosFiltro.innerHTML = '<p>Por favor, selecione um filtro (estado ou título).</p>';
      return;
    }

    cartoes.forEach(cartao => {
      let combinar = true;

      const estadoAtual = cartao.dataset.estado;
      const tituloCartao = cartao.dataset.title;

      if (tituloFiltro !== '' && !tituloCartao.includes(tituloFiltro)) {
        combinar = false;
      }

      if (estadoSelecionado !== 'sem_filtro' && estadoSelecionado !== estadoAtual) {
        combinar = false;
      }

      if (combinar) {
        encontrou = true;
        const cloneCartao = cartao.cloneNode(true);
        cloneCartao.style.pointerEvents = 'none';
        cloneCartao.style.opacity = '0.8';
        divResultadosFiltro.appendChild(cloneCartao);
      }
    });

    if (!encontrou) {
      divResultadosFiltro.innerHTML = '<p>Nenhuma tarefa encontrada.</p>';
    }
  };
}

// ----------- INICIAR APLICAÇÃO -----------
function iniciarAplicacao() {
  configurarModais();
  configurarDragAndDrop();
  adicionarNovaTarefa();
  atualizarContadores();
  ordenarCartoes();
  filtrarCartoes();
}

document.addEventListener('DOMContentLoaded', iniciarAplicacao);