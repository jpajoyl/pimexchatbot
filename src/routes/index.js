require("dotenv").config();
const {Router} = require('express');
const axios = require('axios');
const router = Router();
const Dialogflow = require("@google-cloud/dialogflow");
const { v4: uuid } = require('uuid');
const Path = require("path");

router.post('/', async (req, res) => {
    await res.json({
        'msg': 'Api de chatbot'
    })
})

router.post('/text-input', async (req, res) => {
    const { message } = req.body;
    let { code } = req.body;
    const { id } = req.body;
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
        if (responses[0].queryResult.intent.displayName === "get.phone"){
            const param = responses[0].queryResult.outputContexts[3].parameters.fields
            console.log(param.name.stringValue)
            const data = {
                _state: "lead",
                email: param.email.stringValue,
                name: param.name.stringValue,
                origin: "Chat",
                phone: param.phoneNumber.stringValue,
                project: id,
                referrer: "test"
            }
            console.log(data)
            axios.post('https://api.pimex.io/v2/conversions/', data).then(r => {
                let response = ''
                if (r.data.data.event === 'created'){
                    response = 'Se ha creado el lead'
                } else {
                    response = 'Error'
                }
                const ans = {
                    "fulfillmentMessages": [
                        {
                            "text": {
                                "text": [
                                    response
                                ]
                            }
                        }
                    ]
                }
            })
        }
        responses[0].code = code;
        res.status(200).send({ data: responses });
    } catch (e) {
        console.log(e);
        res.status(422).send({ e });
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
