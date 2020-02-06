const sha512 = require('js-sha512');
const btoa = require('btoa');
const moment = require('moment');

/* global use */
const Env = use('Env');
const Config = use('App/Models/Config');

class Sisp {
  // FUNCOES PARA CALCULAR FINGERPRINT
  static ToBase64(u8) {
    return btoa(String.fromCharCode.apply(null, u8));
  }

  static GenerateSHA512StringToBase64(input) {
    return this.ToBase64(sha512.digest(input));
  }

  static GerarFingerPrintEnvio(
    posAutCode,
    timestamp,
    amount,
    merchantRef,
    merchantSession,
    posID,
    currency,
    transactionCode,
    entityCode,
    referenceNumber
  ) {
    var toHash =
      this.GenerateSHA512StringToBase64(posAutCode) +
      timestamp +
      Number(parseFloat(amount) * 1000) +
      merchantRef.trim() +
      merchantSession.trim() +
      posID.trim() +
      currency.trim() +
      transactionCode.trim();

    if (entityCode) toHash += Number(entityCode.trim());

    if (referenceNumber) toHash += Number(referenceNumber.trim());

    return this.GenerateSHA512StringToBase64(toHash);
  }

  static GerarFingerPrintRespostaBemSucedida(
    posAutCode,
    messageType,
    clearingPeriod,
    transactionID,
    merchantReference,
    merchantSession,
    amount,
    messageID,
    pan,
    merchantResponse,
    timestamp,
    reference,
    entity,
    clientReceipt,
    additionalErrorMessage,
    reloadCode
  ) {
    // EFETUAR O CALCULO CONFORME A DOCUMENTAÇÃO
    var toHash =
      this.GenerateSHA512StringToBase64(posAutCode) +
      messageType +
      clearingPeriod +
      transactionID +
      merchantReference +
      merchantSession +
      Number(parseFloat(amount) * 1000) +
      messageID.trim() +
      pan.trim() +
      merchantResponse.trim() +
      timestamp +
      reference.trim() +
      entity.trim() +
      clientReceipt.trim() +
      additionalErrorMessage.trim() +
      reloadCode.trim();

    return GenerateSHA512StringToBase64(toHash);
  }

  static autoPost(formData) {
    console.log('inn formData');
    console.log(formData);

    //iniciando o form do autopost

    // link de teste
    var postURL =
      Env.get('Sisp_mip_Url') +
      encodeURIComponent(formData.fingerprint) +
      '&TimeStamp=' +
      encodeURIComponent(formData.timeStamp) +
      '&FingerPrintVersion=' +
      encodeURIComponent(formData.fingerprintversion);
    // link real Env.get('Sisp_mip_Url')
    // var postURL = "https://mc.vinti4net.cv/Client_VbV_v2/biz_vbv_clientdata.jsp?FingerPrint=" + encodeURIComponent(formData.fingerprint ) + "&TimeStamp=" + encodeURIComponent(formData.timeStamp) + "&FingerPrintVersion=" + encodeURIComponent(formData.fingerprintversion)

    // CONSTRUIR UM FORM PARA FAZER POST AUTOMATICO
    var formHtml = `
    <html>
      <head>
        <title>Pagamento vinti4</title>
      </head>
      <body onload="autoPost()">
        <h5>Processando o pagamento...</h5>
        <form action="${postURL}" method="post">
    `;
    Object.keys(formData).forEach(function(key) {
      formHtml += `<input type="hidden" name="${key}" value="${formData[key]}">`;
    });

    formHtml += '</form>';

    formHtml += `<script>function autoPost(){document.forms[0].submit();}</script></body></html>`;

    return formHtml;
  }

  /**
   * recarregar
   * @param {Object} book
   * @param {Object} response
   */
  static async recarregar(book, response) {
    const plan = await book.plans().first();
    const config = await Config.first();
    const amount = Math.round(plan.preco * Number(config.txcambio));

    const formData = Sisp.rechargeFormData({
      amount: amount.toString(),
      contact: (await book.devices().first()).numero.toString(),
      responseURL: `${Env.get('APP_URL')}/reservas/recargaCallback`,
    });

    const formHtml = Sisp.autoPost(formData);
    response.send(formHtml);
  }

  /**
   * rechargeFormData
   * @param {Object}
   *  {String} amount
   *  {String} contact
   *  {String} responseURL
   */
  static rechargeFormData({ amount, contact, responseURL }) {
    const formData = {
      transactionCode: '3',
      posID: Env.get('posId'),
      merchantRef: `R${moment().format('YYYYMMDDHHmmss')}`,
      merchantSession: `S${moment().format('YYYYMMDDHHmmss')}`,
      amount,
      currency: '132',
      is3DSec: '1',
      urlMerchantResponse: responseURL,
      languageMessages: 'pt',
      timeStamp: moment().format('YYYY-MM-DD HH:mm:ss'),
      fingerprintversion: '1',
      entityCode: Env.get('CvmovelEntityCode'),
      referenceNumber: contact,
    };

    formData.fingerprint = Sisp.GerarFingerPrintEnvio(
      Env.get('posAutoCode'),
      formData.timeStamp,
      formData.amount,
      formData.merchantRef,
      formData.merchantSession,
      formData.posID,
      formData.currency,
      formData.transactionCode,
      formData.entityCode,
      formData.referenceNumber
    );

    return formData;
  }
}

module.exports = Sisp;
