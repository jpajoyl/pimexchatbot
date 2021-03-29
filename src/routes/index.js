const { Router } = require('express');
const router = Router();



router.get('/', ((req, res) => {
    res.json({
        "test": true
    })
}))
router.post('/chatterbot', ((req, res) => {
    console.log(req.body)
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
