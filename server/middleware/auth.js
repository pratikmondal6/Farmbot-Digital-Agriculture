const config = require('config')
const jwt = require('jsonwebtoken')

function auth(req, res, next) {
    // const token = req.header('x-auth-token')
    const token = req.cookies["x-auth-token"]
    if (!token) return res.status(401).send({
        "status": 401,
        "message": "Access denied. No token proovided."
    })

    try {
        const decoded = jwt.verify(token, config.get('jwtPrivateKey'))
        req.user = decoded
        res.cookie("x-auth-token", token, { maxAge: 3600000 });
        next()
    }
    catch (ex) {
        res.status(400).send({
            "status": 400,
            "message": "Invalid token."
        })
    }
}

module.exports = auth