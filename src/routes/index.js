require("dotenv").config();
const {Router} = require('express');
const axios = require('axios');
const router = Router();
const Dialogflow = require("@google-cloud/dialogflow");
const {v4: uuid} = require('uuid');
const Path = require("path");
const fs = require('fs');

const {NlpManager} = require('node-nlp');
const {getConnection} = require('../database');
const {createBaseModel} = require('../BaseModels/baseModel')

router.post('/pimex-model', async (req, res) => {
    const {pimexModel} = require('../BaseModels/pimexBot')
    const manager = pimexModel();
    await manager.train();
    manager.save(`src/models/pimex-model.nlp`);
    res.status(200).send('EVENT_RECEIVED');
});
// Creates the endpoint for our webhook
router.post('/webhook', (req, res) => {

    let body = req.body;
    console.log(body);
    // Checks this is an event from a page subscription
    if (body.object === 'page') {

        // Iterates over each entry - there may be multiple if batched
        body.entry.forEach(function (entry) {

            // Gets the message. entry.messaging is an array, but
            // will only ever contain one message, so we get index 0
            let webhook_event = entry.messaging[0];
            console.log(webhook_event);
        });

        // Returns a '200 OK' response to all requests
        res.status(200).send('EVENT_RECEIVED');
    } else {
        // Returns a '404 Not Found' if event is not from a page subscription
        res.sendStatus(404);
    }

});

// Adds support for GET requests to our webhook
router.get('/webhook', (req, res) => {

    // Your verify token. Should be a random string.
    let VERIFY_TOKEN = "pimexChat";

    // Parse the query params
    let mode = req.query['hub.mode'];
    let token = req.query['hub.verify_token'];
    let challenge = req.query['hub.challenge'];

    // Checks if a token and mode is in the query string of the request
    if (mode && token) {

        // Checks the mode and token sent is correct
        if (mode === 'subscribe' && token === VERIFY_TOKEN) {

            // Responds with the challenge token from the request
            console.log('WEBHOOK_VERIFIED');
            res.status(200).send(challenge);

        } else {
            // Responds with '403 Forbidden' if verify tokens do not match
            res.sendStatus(403);
        }
    }
});

router.get('/', async (req, res) => {
    await res.json({
        'msg': 'Api de chatbot'
    })
})


router.post('/add-button', async (req, res) => {
    const {question} = req.body;
    const {id} = req.body;
    const utteranceList = getConnection().get('button').value()[id];
    if (utteranceList === undefined) {
        getConnection().set('button.' + id, []).write();
    }
    getConnection().get('button.' + id).push({
        id: uuid(),
        message: question
    }).write();
    res.status(200).send({
        'result': 'correct'
    });
})
router.delete('/delete-button/:id/:buttonId', async (req, res) => {
    const {id} = req.params;
    const {buttonId} = req.params;
    getConnection().get('button.' + id).remove({id: buttonId}).write();
    res.status(200).send({
        'result': 'deleted'
    });
})
router.get('/get-button/:id', async (req, res) => {
    const {id} = req.params;
    const buttons = getConnection().get('button.' + id).value();
    res.status(200).send({
        'buttons': buttons
    });
})


router.post('/nlp-test', async (req, res) => {
    const {message} = req.body;
    const {id} = req.body;
    let manager = new NlpManager({languages: ['es'], forceNER: true});
    manager.load(`src/models/${id.toString()}.nlp`);

    const nlpResponse = await manager.process('es', message);

    if (nlpResponse.intent === 'None') {
        nlpResponse.answer = 'Aún estoy aprendiendo a hablar como un humano, ¿Podrías repetirme lo que acabas de decir?';
    }
    if (req.session.currentIntent === 'asesor.intent') {
        req.session.name = message;
        nlpResponse.answer = 'Por favor dinos tu dirección de correo electrónico para que podamos contactarte';
        nlpResponse.intent = 'get.name'
    }
    if (nlpResponse.entities[0]) {
        for (let i = 0; i < nlpResponse.entities.length; i++) {
            if (nlpResponse.entities[i].entity === 'email') {
                req.session.email = nlpResponse.entities[i].resolution.value
                nlpResponse.answer = 'Y por último danos tu número de telefono para tener una mejor conversación (Sin espacios ni guones)';
            } else if (nlpResponse.entities[i].entity === 'phonenumber') {
                req.session.phonenumber = nlpResponse.entities[i].resolution.value;
                req.session.end = true;
                nlpResponse.answer = 'Gracias. Nuestro equipo se pondrá en contacto contigo pronto.';
            }
        }
    }
    req.session.currentIntent = nlpResponse.intent;
    // guardar respuestas en json
    const newUtterance = {
        intent: nlpResponse.intent,
        message: message
    }
    const utteranceList = getConnection().get('utterance').value()[id];
    if (utteranceList === undefined) {
        getConnection().set('utterance.' + id, []).write();
    }
    getConnection().get('utterance.' + id).push(newUtterance).write();
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
        'answer': nlpResponse.answer
    });
});


router.post('/create-faq', async (req, res) => {
    const {id} = req.body;
    const {companyName} = req.body;
    if (fs.existsSync(`src/models/${id.toString()}.nlp`)) {
        res.status(200).send({
            'message': 'Already exist'
        });
    } else {
        const manager = createBaseModel(companyName);
        await manager.train();
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
module.exports = router;
