const {NlpManager} = require('node-nlp');

function pimexModel() {
    const manager = new NlpManager({languages: ['es'], forceNER: true, ner: {useDuckling: true}});
// intent de bienvenida
    manager.addDocument('es', 'oe', 'welcome.intent');
    manager.addDocument('es', 'hola que tal', 'welcome.intent');
    manager.addDocument('es', 'buenas', 'welcome.intent');
    manager.addDocument('es', 'buenos dias', 'welcome.intent');
    manager.addDocument('es', 'hola', 'welcome.intent');
// respuestas
    manager.addAnswer('es', 'welcome.intent',
        '!Hola, bienvenido a PimexBot! Aqui podrás conocer las principales funcionalidades ' +
        'de pimex y resolver algunas de las dudas que te puedan surgir durante su uso, si en algún momento ' +
        'deseas comunicarte con un asesor escribe la palabra "Asesor" y te pediremos algunos datos para que uno de nuestros ' +
        'asesores se comunique contigo lo más rápido posible.\n' +
        '¿Que deseas hacer?');

// intent de despedida
    manager.addDocument('es', 'Gracias', 'bye.intent');
    manager.addDocument('es', 'Adiós', 'bye.intent');
    manager.addDocument('es', 'hasta luego', 'bye.intent');
    manager.addDocument('es', 'Espero su llamada', 'bye.intent');
    manager.addDocument('es', 'Hasta la próxima', 'bye.intent');
    manager.addDocument('es', 'Chao', 'bye.intent');
    manager.addDocument('es', 'Espero que se comuniquen conmigo pronto', 'bye.intent');

    manager.addAnswer('es', 'bye.intent',
        'Fue un placer hablar contigo, ¡Adiós!');

// asesor
    manager.addDocument('es', 'Asesor', 'asesor.intent');
    manager.addDocument('es', 'quiero comunicarme con un asesor', 'asesor.intent');
    manager.addDocument('es', 'quiero hablar con alguien', 'asesor.intent');
    manager.addDocument('es', 'necesito comunicarme con una persona', 'asesor.intent');

    manager.addAnswer('es', 'asesor.intent',
        'Te podemos ayudar con eso. Solo necesito un poco de información para empezar, ' +
        'empecemos con tu nombre. ¿Cuál es tu nombre completo? (Digita únicamente tu nombre)');

// que puede hacer pimex?
    manager.addDocument('es', 'que puede hacer pimex?', 'what.intent');
    manager.addDocument('es', '¿Qué es Pimex?', 'what.intent');
    manager.addDocument('es', 'que hacen?', 'what.intent');
    manager.addDocument('es', '¿Para qué sirve Pimex?', 'what.intent');

    manager.addAnswer('es', 'what.intent',
        'Pimex es un software que te permite organizar a tus clientes potenciales y reales ' +
        'de manera rápida y sencilla para que puedas monetizar tus esfuerzos marketing y ventas con ' +
        'resultados poderosos. Para conocer más de Pimex mira este video: <a href="https://www.youtube.com/watch?v=yOq1CkfXogw">¿Que es Pimex?</a>');
    manager.addAnswer('es', 'what.intent',
        'Pimex es una aplicación web, que te ayuda almacenando y organizando los clientes ' +
        'potenciales obtenidos desde tus campañas de marketing digital.\n' +
        'Pimex es muy fácil de usar, solo tienes que instalarlo en tu sitio web y el hará seguimiento ' +
        'de todos los formularios de contacto de este, para que estés al tanto de tus clientes potenciales. ' +
        'Para conocer más de Pimex mira este video: <a href="https://www.youtube.com/watch?v=yOq1CkfXogw">¿Que es Pimex?</a>');

    manager.addAnswer('es', 'what.intent',
        'Pimex es una herramienta para organizar y gestionar los clientes potenciales ' +
        'que puedas generar a través de cualquier formulario de contacto que tengas disponible ' +
        'en la web. Es como centralizar toda la información en un solo lugar con información ' +
        'relevante para tomar decisiones más inteligentes a la hora de invertir tus presupuestos.' +
        'Para conocer más de Pimex mira este video: <a href="https://www.youtube.com/watch?v=yOq1CkfXogw">¿Que es Pimex?</a>');


// tarifa
    manager.addDocument('es', 'cuánto cuesta?', 'fee.intent');
    manager.addDocument('es', 'que valor tiene?', 'fee.intent');
    manager.addDocument('es', '¿Qué precio tiene utilizar Pimex?', 'fee.intent');
    manager.addDocument('es', 'Precio de Pimex', 'fee.intent');
    manager.addDocument('es', '¿Qué costo tiene utilizarlo?', 'fee.intent');
    manager.addDocument('es', '¿Qué costo tiene?', 'fee.intent');
    manager.addDocument('es', '¿Cuánto vale Pimex?', 'fee.intent');
    manager.addDocument('es', 'Precio para utilizarlo', 'fee.intent');

    manager.addAnswer('es', 'fee.intent',
        'En Pimex te ofrecemos 3 planes, ya escoges cual es el perfecto para tu negocio:\n' +
        'Gratis\n' +
        'Pimex plus, tiene un costo mensual de 35 USD\n' +
        'Pimex enterprise, tiene un costo desde 145 USD mensual\n' +
        'Conoce nuestros planes en: <a href="https://es.pimex.co/precio/">Planes</a>');

    manager.addDocument('es', '¿Cómo agregar a mi equipo de trabajo a los tableros?', 'add-team.intent');
    manager.addDocument('es', '¿Cómo agrego a más personas al tablero?', 'add-team.intent');
    manager.addDocument('es', 'Pasos para agregar a mi equipo al tablero', 'add-team.intent');
    manager.addDocument('es', '¿Cómo agregar usuarios?', 'add-team.intent');

    manager.addAnswer('es', 'add-team.intent',
        '1. Inicia sesión\n' +
        '2. Ve a tu tablero\n' +
        '3. En la columna de la izquierda ve a la opción "Usuarios"\n' +
        '4. Justo debajo de la lista de usuarios vas a ver un campo que dice email. Agrega ahí el email de la persona a la que quieras agregar.\n' +
        '5. Dale click al botón "Agregar usuario".\n' +
        'Listo, ahora un mail de confirmación le llegará a esta persona. Tu invitado solo tiene que registrarse en Pimex y comenzará a ver tu tablero de inmediato.\n');

    manager.addDocument('es', '¿Cómo exportar mis leads a un excel?', 'excel-leads.intent');
    manager.addDocument('es', 'Se puede exportar los leads a un excel', 'excel-leads.intent');
    manager.addDocument('es', 'Se puede exportar a los clientes en un excel', 'excel-leads.intent');

    manager.addAnswer('es', 'excel-leads.intent',
        'En Pimex podrás exportar tus leads o clientes potenciales a tus tableros, en el siguiente ' +
        'video podrás conocer más sobre este tema: <a href="https://www.youtube.com/watch?v=-vBv_oovamQ&list=PLlegCSvynNQdG2xUEMIlj5TQR1rU5Va1k&index=2&t=758s">Exportar a excel</a>');

    manager.addDocument('es', '¿Cómo funcionan los tableros?', 'boards.intent');
    manager.addDocument('es', 'Explicación de funcionamiento de los tableros de Pimex', 'boards.intent');

    manager.addAnswer('es', 'boards.intent',
        'Si deseas ver la explicación completa de el funcionamiento de pimex, tesugerimos que ingreses al siguiente video ' +
        'en donde te explicamos cada una de las funcionalidades de éste: <a href="https://www.youtube.com/watch?v=-vBv_oovamQ">¿Cómo funcionan los tableros?</a>');

    manager.addDocument('es', 'No puedo acceder a mi cuenta, ¿qué debo hacer?', 'login-fail.intent');
    manager.addDocument('es', 'tenemos problemas con la aplicación y no deja ingresar', 'login-fail.intent');
    manager.addDocument('es', 'No me deja ingresar', 'login-fail.intent');

    manager.addAnswer('es', 'login-fail.intent',
        'Bien, para comenzar debes dirigirte a <a href="https://app.pimex.co/signin">Signin</a> y dar clic en la opción “Olvidé mi contraseña”' +
        '. Después de seguir las instrucciones que se envían a tu correo electrónico podrás intentarlo nuevamente.');

    manager.addDocument('es', 'Necesito la exportar la factura', 'billing-export.intent');
    manager.addDocument('es', '¿Cómo puedo exportar mi factura?', 'billing-export.intent');

    manager.addAnswer('es', 'billing-export.intent',
        'Pimex solo generará tu factura una vez hayan pasado los 14 días de prueba que te regalamos para que disfrutes ' +
        'de nuestro servicio. Si no has superado este tiempo, deberás esperar a que el periodo de prueba finalice. Una vez hayan ' +
        'transcurrido estos 14 días podrás acceder a la sección de “Mi suscripción” y allí encontrarás todo lo relacionado a tu plan y facturación.');
    return manager;
}

module.exports = {
    pimexModel
}
