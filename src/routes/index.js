const {Router} = require('express');
const axios = require('axios');
const router = Router();


router.get('/', ((req, res) => {
    res.json({
        "test": true
    })
}))
router.post('/chatterbot', ((req, res) => {
    console.log(req.body)
    const api = {
        "url": "https://api.pimex.io/v2/",
        "url1": "https://api.pimex.io/",
        "key": "!eqBwMfoWmEOWRoz^R^60$p2K"
    }
    const data = {
        _state: "lead",
        email: "juan@gmail.com",
        name: "Juan",
        origin: "https://app.pimex.co",
        phone: "12344",
        project: "14557",
        referrer: "test"
    }
    axios.post('https://api.pimex.io/v2/conversions/', data).then(r => console.log(r))
    res.json({
        "fulfillmentMessages": [
            {
                "text": {
                    "text": [
                        "Text response from webhook"
                    ]
                }
            }
        ]
    })
}))
module.exports = router;
