require("dotenv").config();
const {Router} = require('express');
const axios = require('axios');
const router = Router();
const Dialogflow = require("@google-cloud/dialogflow");
const {v4: uuid} = require('uuid');
const Path = require("path");
const fs = require('fs');

const {NlpManager} = require('node-nlp');

router.post('/', async (req, res) => {
    await res.json({
        'msg': 'Api de chatbot'
    })
})

router.post('/base-model', ((req, res) => {
    const manager = new NlpManager({languages: ['es'], forceNER: true, ner: {useDuckling: true}});
    // welcome intent
    manager.addDocument('es', 'oe', 'welcome.intent');
    manager.addDocument('es', 'hola que tal', 'welcome.intent');
    manager.addDocument('es', 'buenas', 'welcome.intent');
    manager.addDocument('es', 'buenos dias', 'welcome.intent');
    manager.addDocument('es', 'hola', 'welcome.intent');
    // respuestas
    manager.addAnswer('es', 'welcome.intent', '!Hola, bienvenido a Pimex! ¿Te gustaría saber lo que nuestro servicio puede hacer por ti?');

    // services yes intent
    manager.addDocument('es', 'esta bien', 'services.yes');
    manager.addDocument('es', 'por supuesto', 'services.yes');
    manager.addDocument('es', 'claro', 'services.yes');
    manager.addDocument('es', 'si', 'services.yes');

    manager.addAnswer('es', 'services.yes', 'Te podemos ayudar con eso. Solo necesito un poco de información para empezar, empecemos con tu nombre. ¿Cuál es tu nombre completo? (Digita únicamente tu nombre)');

    // get.name intent
    manager.addDocument('es', 'Juan Manuel Pajoy Lopez', 'get.name');
    manager.addDocument('es', 'me llamo javier cuevas', 'get.name');
    manager.addDocument('es', 'mi nombre es carlos', 'get.name');
    manager.addDocument('es', 'Alberto', 'get.name');

    manager.addAnswer('es', 'get.name', 'Por favor dinos tu dirección de correo electrónico para que podamos contactarte');

    // get.email intent
    manager.addDocument('es', 'mi correo es jpajoy@pimex.co', 'get.email');
    manager.addDocument('es', 'es juan@gmail.com', 'get.email');
    manager.addDocument('es', 'hola@test.com.co', 'get.email');

    manager.addAnswer('es', 'get.email', 'Y por último danos tu número de telefono para tener una mejor conversación(Sin espacios ni guones)');


    // get.phone
    manager.addDocument('es', 'es 2295698', 'get.phone');
    manager.addDocument('es', '325685459', 'get.phone');

    manager.addAnswer('es', 'get.phone', 'Gracias. Nuestro equipo se pondrá en contacto contigo pronto.');
    (async () => {
        await manager.train();
        manager.save(`src/models/base-model.nlp`);
    })();
    res.status(200).send({
        'message': 'correct'
    })
}));

router.post('/nlp-test', async (req, res) => {
    const {message} = req.body;
    const {id} = req.body;
    if (req.session.currentIntent === 'services.yes') {
        req.session.name = message;
    }
    let manager = new NlpManager({languages: ['es'], forceNER: true});
    manager.load(`src/models/base-model.nlp`);

    const nlpResponse = await manager.process('es', message);
    const val = message.toString().match('[\\w-\\.]+@([\\w-]+\\.)+[\\w-]{2,4}$');
    if (req.session.currentIntent === 'services.yes') {
        nlpResponse.answer = 'Por favor dinos tu dirección de correo electrónico para que podamos contactarte';
        nlpResponse.intent = 'get.name'
    }
    if (nlpResponse.entities[0]) {
        for (let i = 0; i < nlpResponse.entities.length; i++) {
            if (nlpResponse.entities[i].entity === 'email') {
                req.session.email = nlpResponse.entities[i].resolution.value
                nlpResponse.answer = 'Y por último danos tu número de telefono para tener una mejor conversación(Sin espacios ni guones)';
            } else if (nlpResponse.entities[i].entity === 'phonenumber') {
                req.session.phonenumber = nlpResponse.entities[i].resolution.value;
                req.session.end = true;
                nlpResponse.answer = 'Gracias. Nuestro equipo se pondrá en contacto contigo pronto.';
            }
        }
    }
    req.session.currentIntent = nlpResponse.intent;
    if (req.session.end) {
        const LeadDta = {
            _state: "lead",
            email: req.session.email,
            name: req.session.name,
            origin: "Chat",
            phone: req.session.phonenumber,
            project: id,
            referrer: "test"
        }
        await axios.post('https://api.pimex.io/v2/conversions/', LeadDta);
    }
    res.status(200).send({
        'answer' : nlpResponse.answer
    });
});


router.post('/create-faq', async (req, res) => {
    const {id} = req.body;
    if (fs.existsSync(`src/models/${id.toString()}.nlp`)) {
        res.status(200).send({
            'message': 'Already exist'
        });
    } else {
        const manager = new NlpManager({languages: ['es'], forceNER: true, autoSave: false});
        manager.save(`src/models/${id.toString()}.nlp`);
        res.status(201).send({
            'message': 'successful faq created'
        });
    }
});

router.post('/add-faq-questions', async (req, res) => {
    const {id} = req.body;
    const {trainingPhrases} = req.body;
    const {intent} = req.body;
    let manager = new NlpManager();
    manager.load(`src/models/${id.toString()}.nlp`);
    for (let i = 0; i < trainingPhrases.length; i++) {
        manager.addDocument('es', trainingPhrases[i], intent);
    }
    manager.save(`src/models/${id.toString()}.nlp`);
    res.status(200).send({
        'message': 'Correctly added'
    });
});

router.post('/add-faq-answers', async (req, res) => {
    const {id} = req.body;
    const {possibleAnswers} = req.body;
    const {intent} = req.body;
    let manager = new NlpManager();
    manager.load(`src/models/${id.toString()}.nlp`);
    for (let i = 0; i < possibleAnswers.length; i++) {
        manager.addAnswer('es', intent, possibleAnswers[i]);
    }
    manager.save(`src/models/${id.toString()}.nlp`);
    res.status(200).send({
        'message': 'Correctly answers added'
    });
});

router.post('/train', async (req, res) => {
    const {id} = req.body;
    let manager = new NlpManager();
    manager.load(`src/models/${id.toString()}.nlp`);
    try {
        await manager.train();
        manager.save(`src/models/${id.toString()}.nlp`);
        res.status(200).send({
            'message': 'Successful trained'
        });
    } catch (error) {
        res.status(500).send({
            'message': 'Something went wrong'
        });
    }

});


router.post('/text-input', async (req, res) => {
    const {message} = req.body;
    let {code} = req.body;
    const {id} = req.body;
    let data = {};
    if (!code) {
        code = uuid();
    }

    // Create a new session
    const sessionClient = new Dialogflow.SessionsClient({
        keyFilename: Path.join(__dirname, "../keys/chatbot-uadb-58adc8bbba26.json"),
    });
    const sessionPath = sessionClient.projectAgentSessionPath(
        process.env.PROJECT_ID,
        code
    );
    // The dialogflow request object
    const request = {
        session: sessionPath,
        queryInput: {
            text: {
                // The query to send to the dialogflow agent
                text: message,
                // The language used by the client (en-US)
                languageCode: 'es',
            },
        },
    };

    // Sends data from the agent as a response
    try {
        const responses = await sessionClient.detectIntent(request);
        if (responses[0].queryResult.intent.displayName === "get.phone") {
            const param = responses[0].queryResult.outputContexts[3].parameters.fields
            const LeadDta = {
                _state: "lead",
                email: param.email.stringValue,
                name: param.name.stringValue,
                origin: "Chat",
                phone: param.phoneNumber.stringValue,
                project: id,
                referrer: "test"
            }
            await axios.post('https://api.pimex.io/v2/conversions/', LeadDta);
        }
        // responses[0].code = code;
        const messageResponse = responses[0].queryResult.fulfillmentMessages.map(data => {
            return data.text.text[0]
        });
        data = {
            'messages': messageResponse,
            'code': code
        }
        if (responses[0].queryResult.action === 'input.unknown') {
            let manager = new NlpManager();
            manager.load(`src/models/${id.toString()}.nlp`);

            const nlpResponse = await manager.process('es', message);
            data = {
                'messages': [nlpResponse.answer],
                'code': code
            }
        }
        res.status(200).send(data);
    } catch (e) {
        console.log(e);
        res.status(422).send({e});
    }

})

/*router.post('/chatterbot', ((req, res) => {
    const param = req.body.queryResult.outputContexts[3].parameters.fields
    const data = {
        _state: "lead",
        email: param.email.stringValue,
        name: param.name.stringValue,
        origin: "Chat",
        phone: param.phone_number.stringValue,
        project: gId,
        referrer: "test"
    }
    axios.post('https://api.pimex.io/v2/conversions/', data).then(r => {
        let response = ''
        if (r.data.data.event === 'created'){
            response = 'Se ha creado el lead'
        } else {
            response = 'Error'
        }
        res.json({
            "fulfillmentMessages": [
                {
                    "text": {
                        "text": [
                            response
                        ]
                    }
                }
            ]
        })
    })
}))*/
module.exports = router;
