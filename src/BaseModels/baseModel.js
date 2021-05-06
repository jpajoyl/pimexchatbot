const {NlpManager} = require('node-nlp');

function createBaseModel(companyName) {
    const manager = new NlpManager({languages: ['es'], forceNER: true, ner: {useDuckling: true}});

    // intent de bienvenida
    manager.addDocument('es', 'oe', 'welcome.intent');
    manager.addDocument('es', 'hola que tal', 'welcome.intent');
    manager.addDocument('es', 'buenas', 'welcome.intent');
    manager.addDocument('es', 'buenos dias', 'welcome.intent');
    manager.addDocument('es', 'hola', 'welcome.intent');
// respuestas
    manager.addAnswer('es', 'welcome.intent',
        '!Hola, bienvenido a ' + companyName + '! Aqui podrás conocer las principales funcionalidades ' +
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
        'Fue un placer poder ayudarte, ¡Adiós!');

    // asesor
    manager.addDocument('es', 'Asesor', 'asesor.intent');
    manager.addDocument('es', 'quiero comunicarme con un asesor', 'asesor.intent');
    manager.addDocument('es', 'quiero hablar con alguien', 'asesor.intent');
    manager.addDocument('es', 'necesito comunicarme con una persona', 'asesor.intent');

    manager.addAnswer('es', 'asesor.intent',
        'Te podemos ayudar con eso. Solo necesito un poco de información para empezar, ' +
        'empecemos con tu nombre. ¿Cuál es tu nombre completo? (Digita únicamente tu nombre)');

    return manager;
}

module.exports = {
    createBaseModel
}
