require('dotenv').config({ path: './key.env' });
const crypto = require('crypto');
const fs = require('fs');
const CryptoJS = require('crypto-js');
const request = require('request');
const path = require('path');

const consumerKey = process.env.consumerKey;
const consumerSecret = process.env.consumerSecret;
const callbackUrl = process.env.callbackUrl;
const partnerCsn = process.env.partnerCsn;
const environmentUrl = process.env.environmentUrl;

let accessToken = process.env.accessToken;

console.log('Iniciando Consulta');

async function getAccessToken(callback) {
  const timestamp = Math.floor(Date.now() / 1000);
  const message = callbackUrl + consumerKey + timestamp;
  const hash = CryptoJS.HmacSHA256(message, consumerSecret);
  const hashInBase64 = CryptoJS.enc.Base64.stringify(hash);
  const signature = hashInBase64;
  const passwordSignature = `${consumerKey}:${consumerSecret}`;
  const authorization = Buffer.from(passwordSignature).toString('base64');
  const Auth = `Basic ${authorization}`;
  const options = {
    method: 'POST',
    url: `https://${environmentUrl}/v2/oauth/generateaccesstoken?grant_type=client_credentials`,
    headers: {
      signature,
      timestamp,
      Authorization: Auth,
    },
  };
  
  request(options, (error, response, body) => {
    if (error) throw new Error(error);
    const dataJson = JSON.parse(body);
    accessToken = dataJson.access_token;
    setTimeout(callback, 5000); // Pausa de 5 segundos
  });
}

async function makeRequest(csn, startDate, endDate) {
  return new Promise((resolve, reject) => {
    console.clear();
    console.log(`Consultando o CSN: ${csn}`);
    console.log(`Consultando de ${startDate.toISOString().split('T')[0]} a ${endDate.toISOString().split('T')[0]}`);
    
    const timestamp = Math.floor(Date.now() / 1000);
    const message = callbackUrl + accessToken + timestamp;
    const hash = CryptoJS.HmacSHA256(message, consumerSecret);
    const hashInBase64 = CryptoJS.enc.Base64.stringify(hash);
    const signature = hashInBase64;
    const baseUrl = `https://${environmentUrl}`;
    const url = `${baseUrl}/v1/orders?customer_number=${csn}&order_date_from=${startDate.toISOString().split('T')[0]}&order_date_to=${endDate.toISOString().split('T')[0]}`;
    const options = {
      method: 'GET',
      url: url,
      headers: {
        'signature': signature,
        'timestamp': timestamp,
        'Authorization': "Bearer " + accessToken,
        'CSN': partnerCsn,
      },
    };

    request(options, (error, response, body) => {
      if (error) {
        console.error(`Erro na consulta para o CSN ${csn} entre ${startDate.toISOString().split('T')[0]} e ${endDate.toISOString().split('T')[0]}: ${error.message}`);
        fs.appendFileSync(path.join(process.cwd(), 'order.json'), `Erro na consulta para o CSN ${csn} entre ${startDate.toISOString().split('T')[0]} e ${endDate.toISOString().split('T')[0]}: ${error.message}\n`);
        resolve(); // Continua mesmo se houver erro
        return;
      }

      const dataJson = JSON.parse(body);
      console.log(dataJson);

      if (dataJson.status === "OK" && dataJson.message && dataJson.message.elements && dataJson.message.elements.length > 0) {
        const orderListArray = dataJson.message.elements[0].order_list_array || [];
        const orders = orderListArray.map(order => ({
          csn,
          startDate: startDate.toISOString().split('T')[0],
          endDate: endDate.toISOString().split('T')[0],
          ...order,
        }));
        fs.appendFileSync(path.join(process.cwd(), 'order.json'), JSON.stringify(orders, null, 2) + ',\n');
      } else {
        console.log(`A consulta para o CSN ${csn} entre ${startDate.toISOString().split('T')[0]} e ${endDate.toISOString().split('T')[0]} não retornou resultados.`);
      }
      
      resolve();
    });
  });
}

async function runRequestsForDatesWithVariation(csn, startDate, endDate, variationInterval) {
  let currentDate = new Date(startDate);

  while (currentDate <= endDate) {
    const nextEndDate = new Date(currentDate);
    nextEndDate.setDate(nextEndDate.getDate() + variationInterval); // Incrementa a data final

    await makeRequest(csn, currentDate, nextEndDate); // Faz a consulta com as datas atual e final

    currentDate.setDate(currentDate.getDate() + variationInterval); // Incrementa a data inicial
    await delay(1000); // Pausa de 1 segundo entre cada consulta
  }
}

async function runRequestsForDates(csn, startDate, endDate, intervaloDeDias) {
  const variationInterval = intervaloDeDias; // Define a variação como o intervalo de dias

  await runRequestsForDatesWithVariation(csn, startDate, endDate, variationInterval);
}

async function getLastDateWithOrders(csn, currentDate, intervaloDeDias) {
  let lastDate = new Date(currentDate);
  while (true) {
    const nextDate = new Date(lastDate);
    nextDate.setDate(nextDate.getDate() + intervaloDeDias);
    const response = await makeRequest(csn, nextDate, nextDate);
    if (!response || !response.length) {
      break;
    }
    lastDate = new Date(nextDate);
  }
  return lastDate;
}

function clearOrderFile() {
  fs.writeFileSync(path.join(process.cwd(), 'order.json'), '['); // Abre o array JSON
}

function finalizeOrderFile() {
  fs.appendFileSync(path.join(process.cwd(), 'order.json'), ']'); // Fecha o array JSON
}

function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

getAccessToken(async () => {
  // Limpa o arquivo antes de começar as consultas
  clearOrderFile();

  const currentYear = new Date().getFullYear();
  let startDate = new Date();
  startDate.setFullYear(currentYear - 10);

  const endDate = new Date(); // Data atual

  const intervaloDeDias = 30; // Ajuste o intervalo de dias desejado aqui

  const lastDateWithOrders = await getLastDateWithOrders(partnerCsn, endDate, intervaloDeDias);
  
  await runRequestsForDates(partnerCsn, startDate, lastDateWithOrders, intervaloDeDias);

  finalizeOrderFile(); // Fecha o array JSON após finalizar as consultas
});
