/* global use */
const Event = use('Event');

Event.on('new::cliente', 'Cliente.novo');
Event.on('cliente::confirmBook', 'Cliente.confirmBook');

Event.on('new::user', 'User.novo');
Event.on('resetpassword::user', 'User.resetpassword');
