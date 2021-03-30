const {Router} = require('express');
const axios = require('axios');
const router = Router();


router.get('/', ((req, res) => {
    res.json({
        "test": true
    })
}))
router.post('/chatterbot', ((req, res) => {
    const param = req.body.queryResult.outputContexts[3].parameters
    const data = {
        _state: "lead",
        email: param.email,
        name: param.name,
        origin: "Chat",
        phone: param.phone_number,
        project: "14557",
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
}))
module.exports = router;
