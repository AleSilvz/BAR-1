const addButton = document.getElementById("addButton");
const itemNameInput = document.getElementById("itemName");
const confirmButton = document.getElementById("confirmButton");
const itemsContainer = document.getElementById("items");
const mesaPage = document.getElementById("mesaPage");
const addMesaItemButton = document.getElementById("addMesaItemButton");
const deleteMesaButton = document.getElementById("deleteMesaButton");
const backButton = document.getElementById("backButton");
const mesaTitle = document.getElementById("mesaTitle");
const mesaItemsContainer = document.getElementById("mesaItems"); // Corrigido para usar o nome correto
const modal = document.getElementById("modal");
const itemOptionsContainer = document.getElementById("itemOptions");
const confirmItemButton = document.getElementById("confirmItemButton");
const closeModal = document.querySelector(".close");

let currentMesa = null;
let selectedItem = null;

// Carrega mesas salvas do Local Storage ao iniciar
window.onload = function () {
  const savedMesas = JSON.parse(localStorage.getItem("mesas")) || {};
  for (const mesaName in savedMesas) {
    addMesaToPage(mesaName);
  }
};

addButton.addEventListener("click", function () {
  addButton.style.display = "none";
  itemNameInput.style.display = "block";
  confirmButton.style.display = "block";
  itemNameInput.focus();
});

confirmButton.addEventListener("click", addMesa);
itemNameInput.addEventListener("keypress", function (event) {
  if (event.key === "Enter") addMesa();
});

function addMesa() {
  const itemName = itemNameInput.value.trim();

  if (itemName) {
    const savedMesas = JSON.parse(localStorage.getItem("mesas")) || {};

    // Verificar se a mesa já existe
    if (savedMesas[itemName]) {
      alert(`Já existe uma mesa com o nome ${itemName}. Escolha outro nome.`);
      return; // Impede a adição da mesa
    }

    // Se não existir, adicione a mesa
    savedMesas[itemName] = savedMesas[itemName] || [];
    localStorage.setItem("mesas", JSON.stringify(savedMesas));

    addMesaToPage(itemName);

    itemNameInput.value = "";
    itemNameInput.style.display = "none";
    confirmButton.style.display = "none";
    addButton.style.display = "block";
  } else {
    alert("Por favor, digite um nome para a mesa.");
  }
}


function addMesaToPage(mesaName) {
  const mesaDiv = document.createElement("div");
  mesaDiv.classList.add("item");
  mesaDiv.innerText = mesaName;

  mesaDiv.addEventListener("click", function () {
    currentMesa = mesaName;
    openMesaPage();
  });

  itemsContainer.appendChild(mesaDiv);
}

function openMesaPage() {
  const savedMesas = JSON.parse(localStorage.getItem("mesas")) || {};
  const mesaItems = savedMesas[currentMesa] || [];

  mesaItemsContainer.innerHTML = ""; // Limpa a mesa atual antes de preencher
  mesaTitle.innerText = currentMesa; // Atualiza o título da mesa

  // Redefina o valor total
  totalValue = 0; // Resetar o total

  mesaItems.forEach(item => {
      const itemDiv = createItemDiv(item);
      if (itemDiv) {
          mesaItemsContainer.appendChild(itemDiv); // Adiciona o item se a div for válida
      } else {
          console.error("Erro ao criar item div para:", item); // Log de erro para o item
      }
  });

  updateTotal(); // Atualiza a exibição do total após adicionar os itens

  mesaPage.style.display = "block"; // Mostra a página da mesa
  container.style.display = "none";
}


function createItemDiv(item) {
  const itemDiv = document.createElement("div");
  const { nome, unitPrice } = item;

  let quantity = item.quantity || 1;
  let priceValue = Number(unitPrice) * quantity;

  if (isNaN(priceValue)) {
      console.error("Erro: Preço calculado não é um número válido.", item);
      return null;
  }

  const priceDisplay = document.createElement("span");
  priceDisplay.innerText = `${nome}\n${quantity}x - R$ ${priceValue.toFixed(2)}`;
  itemDiv.appendChild(priceDisplay);

  // Atualiza o total inicialmente
  totalValue += priceValue;
  updateTotal();

    const decrementButton = document.createElement("button");
    decrementButton.innerText = "-";
    decrementButton.classList.add("button-small");
    decrementButton.onclick = function () {
      if (quantity === 1) {
        // Remove o item se a quantidade for 1
        mesaItemsContainer.removeChild(itemDiv); // Remove a div do item da exibição
        totalValue -= Number(unitPrice); // Subtrai o valor do item do total
        updateTotal(); // Atualiza a exibição do total
        removeItemData(currentMesa, nome); // Remove o item do Local Storage
    } else if (quantity > 1) {
        // Diminui a quantidade e atualiza normalmente
        quantity -= 1;
        priceValue = Number(unitPrice) * quantity;
        priceDisplay.innerText = `${nome}\n${quantity}x - R$ ${priceValue.toFixed(2)}`;
        saveItemData(currentMesa, nome, quantity, unitPrice);
        totalValue -= Number(unitPrice); // Subtrai o valor unitário
        updateTotal();
    }
  };

  const incrementButton = document.createElement("button");
  incrementButton.innerText = "+";
  incrementButton.classList.add("button-small");
  incrementButton.onclick = function () {
      quantity += 1;
      priceValue = Number(unitPrice) * quantity;
      priceDisplay.innerText = `${nome}\n${quantity}x - R$ ${priceValue.toFixed(2)}`;
      saveItemData(currentMesa, nome, quantity, unitPrice);
      totalValue += Number(unitPrice); // Adiciona o valor unitário
      updateTotal();
  };

  itemDiv.appendChild(decrementButton);
  itemDiv.appendChild(incrementButton);

  return itemDiv;
}

// Função para remover o item do Local Storage
function removeItemData(mesaName, itemName) {
  const savedMesas = JSON.parse(localStorage.getItem("mesas")) || {};
  const mesaItems = savedMesas[mesaName] || [];

  const updatedItems = mesaItems.filter(item => item.nome !== itemName); // Remove o item da lista
  savedMesas[mesaName] = updatedItems;
  localStorage.setItem("mesas", JSON.stringify(savedMesas)); // Atualiza o Local Storage
}

// Função para salvar a atualização no Local Storage
function saveItemData(mesaName, itemName, quantity, unitPrice) {
  const savedMesas = JSON.parse(localStorage.getItem("mesas")) || {};
  const mesaItems = savedMesas[mesaName] || [];

  const itemIndex = mesaItems.findIndex(i => i.nome === itemName);
  if (itemIndex >= 0) {
    mesaItems[itemIndex] = { nome: itemName, quantity, unitPrice: Number(unitPrice).toFixed(2) };
  } else {
    mesaItems.push({ nome: itemName, quantity, unitPrice: Number(unitPrice).toFixed(2) });
  }

  savedMesas[mesaName] = mesaItems;
  localStorage.setItem("mesas", JSON.stringify(savedMesas));
}

addMesaItemButton.addEventListener("click", function () {
  // Preenche as opções de itens na modal
  itemOptionsContainer.innerHTML = ""; // Limpa opções anteriores
  itens.forEach((item, index) => {
    const optionDiv = document.createElement("div");
    optionDiv.innerText = `${item.nome} - R$${item.preco.toFixed(2)}`;
    optionDiv.setAttribute("data-index", index);
    optionDiv.classList.add("item");
    optionDiv.style.cursor = "pointer";

    // Adiciona evento de clique para selecionar item
    optionDiv.addEventListener("click", function () {
      selectedItem = itens[this.getAttribute("data-index")];
      itemOptionsContainer.querySelectorAll(".item").forEach(i => i.classList.remove("selected"));
      this.classList.add("selected"); // Destaca item selecionado
    });

    itemOptionsContainer.appendChild(optionDiv);
  });

  modal.style.display = "flex"; // Mostra modal
});

// Na função confirmItemButton, adicione a atualização do total ao adicionar um novo item
confirmItemButton.addEventListener("click", function () {
  if (selectedItem) {
      const itemName = selectedItem.nome;
      const unitPrice = Number(selectedItem.preco); // Converte para número

      // Verifica se unitPrice é um número válido
      if (isNaN(unitPrice)) {
          console.error("Erro: O preço do item não é um número válido.", selectedItem);
          alert("Erro: O preço do item não é válido.");
          return; // Interrompe se o preço não é um número
      }

      const item = { nome: itemName, unitPrice, quantity: 1 }; // Objeto com os valores corretos
      const itemDiv = createItemDiv(item); // Adiciona o item com a quantidade inicial
      if (itemDiv) {
          mesaItemsContainer.appendChild(itemDiv); // Adiciona ao container da mesa
      }

      const savedMesas = JSON.parse(localStorage.getItem("mesas")) || {};
      if (!savedMesas[currentMesa]) savedMesas[currentMesa] = [];
      savedMesas[currentMesa].push(item);
      localStorage.setItem("mesas", JSON.stringify(savedMesas));

      selectedItem = null; // Reseta o item selecionado
      modal.style.display = "none"; // Fecha a modal
  } else {
      alert("Por favor, selecione um item.");
  }
});

closeModal.addEventListener("click", function () {
  modal.style.display = "none"; // Fecha a modal
  selectedItem = null; // Reseta o item selecionado
});

// Botão de deletar mesa
deleteMesaButton.addEventListener("click", function () {
  if (currentMesa) {
    const savedMesas = JSON.parse(localStorage.getItem("mesas")) || {};
    delete savedMesas[currentMesa]; // Remove mesa
    localStorage.setItem("mesas", JSON.stringify(savedMesas)); // Salva as alterações

    itemsContainer.innerHTML = ""; // Limpa a lista de mesas
    for (const mesaName in savedMesas) {
      addMesaToPage(mesaName); // Recarrega mesas restantes
    }

    mesaItemsContainer.innerHTML = ""; // Limpa itens da mesa
    mesaPage.style.display = "none";
    container.style.display = "block"; // Oculta a página da mesa
    currentMesa = null; // Reseta a mesa atual
  } else {
    alert("Nenhuma mesa selecionada para deletar.");
  }
});

// Botão de voltar
backButton.addEventListener("click", function () {
  mesaPage.style.display = "none"; // Oculta a página da mesa
  container.style.display = "block"; 
  currentMesa = null; // Reseta a mesa atual
});

// Adicione esta variável para armazenar o total
let totalValue = 0;

// Atualize a função para calcular o total
function updateTotal() {
    const totalValueDiv = document.getElementById("totalValue");
    totalValueDiv.innerText = `Total: R$ ${totalValue.toFixed(2)}`;
}

// Função de pesquisa para filtrar itens
function searchItems() {
  const searchTerm = document.getElementById("searchInput").value.toLowerCase();
  const filteredItems = itens.filter(item => item.nome.toLowerCase().includes(searchTerm));
  
  // Limpar os itens anteriores
  itemOptionsContainer.innerHTML = "";
  
  // Adicionar os itens filtrados na interface
  filteredItems.forEach((item, index) => {
    const optionDiv = document.createElement("div");
    optionDiv.innerText = `${item.nome} - R$${item.preco.toFixed(2)}`;
    optionDiv.setAttribute("data-index", index);
    optionDiv.classList.add("item");
    optionDiv.style.cursor = "pointer";

    // Adiciona evento de clique para selecionar item
    optionDiv.addEventListener("click", function () {
      selectedItem = item;  // Atualiza o item selecionado com base no filtro
      itemOptionsContainer.querySelectorAll(".item").forEach(i => i.classList.remove("selected"));
      this.classList.add("selected"); // Destaca item selecionado
    });

    itemOptionsContainer.appendChild(optionDiv);
  });
}

// Função para exportar o pedido em arquivo de texto com o formato solicitado
function exportarParaTexto() {
  let textContent = "Cliente\n";
  
  // Obtém o nome da mesa
  const mesaTitle = document.getElementById("mesaTitle").innerText;
  textContent += `${mesaTitle}\n\n`;

  // Adiciona título para os itens
  textContent += "Produtos\n\n";  // Adicionando um espaço após "Produtos"
  
  // Obtém os itens
  const items = document.querySelectorAll("#mesaItems > div"); 
  items.forEach(item => {
      // Pega o conteúdo do span (nome e quantidade)
      const itemText = item.querySelector("span").innerText;

      // Adiciona o item ao texto
      textContent += `${itemText}\n\n`; // Adicionando um espaço após cada item
  });

  // Adiciona o total
  const totalValue = document.getElementById("totalValue").innerText;
  textContent += `${totalValue}\n`; // Espaço após o total

  // Cria o arquivo de texto e faz o download
  const blob = new Blob([textContent], { type: "text/plain" });
  const link = document.createElement("a");
  const comprovanteTxt = `${mesaTitle}.txt`
  link.href = URL.createObjectURL(blob);
  link.download = comprovanteTxt;
  link.click();
}











//Exportar PDF
function exportarParaPDF() {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();

  let y = 10; // Posição inicial para o texto no PDF

  // Obtém o nome da mesa
  const mesaTitle = document.getElementById("mesaTitle").innerText;

  // Adiciona o nome do cliente (nome da mesa)
  doc.text(`Cliente\n${mesaTitle}`, 10, y);
  y += 15; // Pula linha

  // Adiciona "Produtos"
  doc.text("\nProdutos\n", 10, y);
  y += 10; // Pula linha

  // Obtém os itens
  const items = document.querySelectorAll("#mesaItems > div"); 
  items.forEach(item => {
      // Pega o conteúdo do span (nome e quantidade)
      const itemText = item.querySelector("span").innerText;

      // Adiciona o item ao PDF
      doc.text(`\n${itemText}`, 10, y,);
      y += 17; // Pula linha entre os itens
  });

  // Adiciona o total
  const totalValue = document.getElementById("totalValue").innerText;
  doc.text(`\n\n${totalValue}`, 10, y);
  y += 10; // Pula linha antes de salvar

  // Salva o PDF
  const comprovante = `${mesaTitle}.pdf`;
  doc.save(comprovante);
};


// Comprovante 
function imprimirComprovante() {
  // Cria um conteúdo HTML temporário para impressão
  let printContent = `
    <div style="text-align: center;">
      <h2>Cliente</h2>
      <p>${document.getElementById('mesaTitle').innerText}</p>
      <h3>Produtos</h3>
  `;

  // Adiciona os produtos da mesa
  const items = document.querySelectorAll("#mesaItems > div");
  items.forEach(item => {
      const itemText = item.querySelector("span").innerText;
      const itemParts = itemText.split("\n");
      
      // Exibe o nome do produto em uma linha e a quantidade e preço na próxima linha
      printContent += `<p>${itemParts[0]}</p>`;  // Nome do item
      printContent += `<p>${itemParts[1]}</p>`;  // Quantidade e preço
  });

  // Adiciona o total da mesa
  const totalValue = document.getElementById("totalValue").innerText;
  printContent += `
      <h3>${totalValue}</h3>
    </div>
  `;

  // Cria uma janela de impressão com o conteúdo gerado
  const printWindow = window.open('', '', 'height=500,width=800');
  printWindow.document.write('<html><head><title>Comprovante de Pedido</title></head><body>');
  printWindow.document.write(printContent);
  printWindow.document.write('</body></html>');
  printWindow.document.close();
  
  // Aguarda o conteúdo ser carregado e chama o comando de impressão
  printWindow.print();
};




