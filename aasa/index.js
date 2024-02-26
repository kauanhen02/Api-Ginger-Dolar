const axios = require("axios")

const url =
  "https://api.bcb.gov.br/dados/serie/bcdata.sgs.1/dados?formato=json"

async function obterCotacaoDolarPTAXVenda() {
  try {
    const response = await axios.get(url)
    const dados = response.data
    const dataAtual = new Date().toLocaleDateString()

    let valorEncontrado = null

    for (let i = 0; i < dados.length; i++) {
      if (dataAtual === dados[i].data) {
        valorEncontrado = dados[i].valor
        break
      }
    }

    if (valorEncontrado !== null) {
      console.log([{"Valor": valorEncontrado,}])
    } else {
      console.log("Cotação não encontrada para a data atual.")
    }
  } catch (error) {
    console.error("Erro ao obter a cotação:", error)
  }
}

obterCotacaoDolarPTAXVenda()
