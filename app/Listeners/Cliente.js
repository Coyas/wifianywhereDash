'use strict';
const Mail = use('Mail');
const Env = use('Env');

const Cliente = (exports = module.exports = {});

Cliente.novo = async dados => {
  console.log('estou dentro do evento new::cliente');

  await Mail.send('auth.emails.cliente_confirm_email', dados, message => {
    message
      .to(dados.email)
      .from(Env.get('MAIL_USERNAME'))
      .subject('please confirm your wifianywhere  account');
  });
};

Cliente.confirmBook = async Confirmacao => {
  console.log(
    'estou dentro da funcao confirmacao de booking por email user::confirmBook'
  );

  try {
    await Mail.send('auth.emails.confirm_booking', Confirmacao, message => {
      message
        .to(Confirmacao.cliente.email)
        .from(Env.get('MAIL_USERNAME'))
        .subject('Wifianywhere Online Booking');
    });
  } catch (error) {
    console.log('erro ao enviar o email');
    console.log(error);
  }
};
