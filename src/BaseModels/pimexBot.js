const {NlpManager} = require('node-nlp');
const manager = new NlpManager({languages: ['es'], forceNER: true, ner: {useDuckling: true}});
// intent de bienvenida
manager.addDocument('es', 'oe', 'welcome.intent');
manager.addDocument('es', 'hola que tal', 'welcome.intent');
manager.addDocument('es', 'buenas', 'welcome.intent');
manager.addDocument('es', 'buenos dias', 'welcome.intent');
manager.addDocument('es', 'hola', 'welcome.intent');
// respuestas
manager.addAnswer('es', 'welcome.intent', '!Hola, bienvenido a Pimex! ¿Te gustaría saber lo que nuestro servicio puede hacer por ti?');
