const express = require("express");
const axios = require("axios");
const fs = require("fs");
const path = require("path"); // Importe o módulo 'path'

const app = express();
const PORT = process.env.PORT || 3077;
const url = "https://api.bcb.gov.br/dados/serie/bcdata.sgs.1/dados?formato=json";
const jsonFilePath = path.join(__dirname, "cotacao_dolar.json");

const cotacaodolar = require("./cotacao_dolar.json");

app.get("/cotacaodolar", (req, res) =>{
  try {
    // Lê o conteúdo do arquivo JSON a cada solicitação
    const cotacaodolar = JSON.parse(fs.readFileSync(jsonFilePath));
    res.json(cotacaodolar);
  } catch (error) {
    console.error("Erro ao ler o arquivo JSON:", error);
    res.status(500).json({ error: "Erro ao ler o arquivo JSON" });
  }
})

// Função para verificar e inicializar o arquivo JSON se estiver vazio ou malformado
function inicializarArquivoJSON() {
  try {
    // Verifica se o arquivo existe, senão cria um novo
    if (!fs.existsSync(jsonFilePath)) {
      fs.writeFileSync(jsonFilePath, "[]");
    }
  } catch (error) {
    console.error("Erro ao inicializar o arquivo JSON:", error);
  }
}

// Inicializa o arquivo JSON quando o servidor é iniciado
inicializarArquivoJSON();

async function obterCotacaoDolarPTAXVenda() {
  try {
    const response = await axios.get(url);
    const dados = response.data;
    const dataAtual = new Date().toLocaleDateString();

    let valorEncontrado = null;

    for (let i = 0; i < dados.length; i++) {
      if (dataAtual === dados[i].data) {
        valorEncontrado = dados[i].valor;
        break;
      } 
    }

    for (let o = dados.length - 1; o >= 0; o--) {
      if (dataAtual !== dados[o].data) {
        valorEncontrado = dados[o].valor;
        break;
      } 
    }
    
    if (valorEncontrado !== null) {
      const resultado = { Valor: valorEncontrado };
      const jsonResultado = JSON.stringify(resultado);
      console.log(jsonResultado);

      // Salvar os dados em um arquivo JSON
      const dadosSalvos = JSON.parse(fs.readFileSync(jsonFilePath));
      dadosSalvos.push(resultado);
      fs.writeFileSync(jsonFilePath, JSON.stringify(dadosSalvos, null, 2));
    } else {
      console.log(JSON.stringify({ error: "Cotação não encontrada para a data atual." }));
    }
  } catch (error) {
    console.error("Erro ao obter a cotação:", error);
  }
}

// Execute a função a cada 10 segundos
setInterval(obterCotacaoDolarPTAXVenda, 5000); // 10 segundos em milissegundos

// Inicia o servidor
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
