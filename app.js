require("dotenv").config()
const express = require("express")
const cookieParser = require("cookie-parser")
const next = require("next")
const nodemailer = require("nodemailer")
const Airtable = require("airtable")
const axios = require("axios")
const rateLimit = require("express-rate-limit");
const qs = require("querystring")
const crypto = require("crypto")
const base = new Airtable({ apiKey: process.env.AIRTABLE }).base(process.env.BASE);
const dev = process.env.NODE_ENV !== 'production'
const server = next({ dev })
const handle = server.getRequestHandler()
const app = express()
const limiter = rateLimit({ windowMs: 1000 })
var captcha = async (token, after) => {
    let resp = await axios.post("https://www.google.com/recaptcha/api/siteverify", qs.stringify({
        secret: process.env.CAPTCHA,
        response: token
    }))
    console.log(resp.data)
    after(resp.data.success)
}

var transporter = nodemailer.createTransport({
    host: "smtp-mail.outlook.com", // hostname
    secureConnection: false, // TLS requires secureConnection to be false
    port: 587, // port for secure SMTP
    tls: {
        ciphers: 'SSLv3'
    },
    auth: {
        user: 'hackuniversity@outlook.com',
        pass: process.env.OUTLOOK
    }
});
app.use(express.json())
app.use(cookieParser());

server.prepare().then(() => {
    //API ROUTES
    app.post("/api/signup", (req, res) => {
        captcha(req.body.captcha, (success) => {
            if (success) {
                let username = req.body.username
                let password = req.body.password
                let email = req.body.email
                let loginToken = crypto.randomBytes(256).toString("hex");
                let flag = true;
                base("Users").select({
                    view: "Main",
                    filterByFormula: `Username = '${username}'`
                }).eachPage((records, next) => {
                    records.forEach(record => {
                        flag = false;
                    })
                    next()
                }, e => {
                    if (!flag) {
                        res.sendStatus(401)
                    } else {
                        base("Users").create([
                            {
                                fields: {
                                    Username: username,
                                    Password: password,
                                    Email: email,
                                    LoginToken: loginToken
                                }
                            }
                        ]).then((e) => {
                            res.sendStatus(200)
                            transporter.sendMail({
                                from: `"Hack University" hackuniversity@outlook.com`,
                                to: email,
                                subject: "Verify Email for Hack University",
                                html: `
                                <p>Welcome ${username},</p>
                                <br/>
                                <p>Thanks for sign up for Hack University! Please <a href="https://university.hackclub.com/api/verify/${e[0].id}">verify your email!</a>
                                <br/>
                                <p>Thanks so much,</p>
                                <p>Hack University Team</p>
                            `
                            })
                        })
                    }
                })
            } else {
                res.sendStatus(401)
            }
        })

    })
    app.post("/api/login", (req, res) => {
        let loginToken = crypto.randomBytes(256).toString("hex");
        let username = req.body.username
        let password = req.body.password
        base("Users").select({
            view: "Main",
            filterByFormula: `AND(Password = '${password}', Username = '${username}')`
        }).eachPage((records, next) => {
            records.forEach(record => {
                if (record.get("Verified")) {
                    res.cookie("loginToken", loginToken)
                    res.cookie("user", username)
                    base("Users").update([{
                        id: record.id,
                        fields: {
                            LoginToken: loginToken
                        }
                    }]).then(d => res.sendStatus(200))
                    loginToken = false;
                } else {
                    loginToken = "verify"
                }
            })
            next()
        }, e => {
            if (loginToken) {
                loginToken == "verify" ? res.send({ verified: true }) : res.sendStatus(401)
            }
        })
    })
    app.get("/api/verify/:id", (req, res) => {
        base("Users").update([{
            id: req.params.id,
            fields: {
                Verified: true
            }
        }]).then(d => {
            res.redirect("https://university.hackclub.com/login")
        }).catch(e => {
            res.sendStatus(404)
        })
    })
    app.post("/api/classes/create", (req, res) => {
        captcha(req.body.captcha, (success) => {
            if (success) {
                base("Users")
                    .select({
                        view: "Main",
                        maxRecords: 3,
                        filterByFormula: `{LoginToken} = '${req.cookies.loginToken}'`
                    })
                    .eachPage(records => {
                        let record = records[0]
                        if (!record)
                            return res.sendStatus(401)
                        if (!record.get("Verified"))
                            return res.sendStatus(401)
                        base("Classes").create([
                            {
                                fields: {
                                    "Class Name": req.body.name,
                                    Description: req.body.desc,
                                    "Class Image": [{
                                        url: req.body.image
                                    }],
                                    Leader: [record.id],
                                    KeyWords: req.body.KeyWords
                                }
                            }
                        ]).then(d => {
                            res.send({ id: d[0].id })
                        })
                    }).catch(e => res.sendStatus(401))
            } else {
                res.send({ captcha: true })
            }
        })
    })
    app.post("/api/classes/update/:id", (req, res) => {
        base("Users")
            .select({
                view: "Main",
                maxRecords: 3,
                filterByFormula: `{LoginToken} = '${req.cookies.loginToken}'`
            })
            .eachPage(records => {
                let record = records[0]
                if (!record)
                    return res.sendStatus(401)
                if (!record.get("Leading Classes"))
                    return res.sendStatus(401)
                if (!record.get("Leading Classes").includes(req.params.id))
                    return res.sendStatus(401)

                base("Classes").update([{
                    id: req.params.id,
                    fields: req.body
                }])
                    .then(e => res.sendStatus(200))
                    .catch(e => res.sendStatus(404))
            }).catch(e => res.sendStatus(401))
    })
    app.post("/api/classes/delete/:id", (req, res) => {
        base("Users")
            .select({
                view: "Main",
                maxRecords: 3,
                filterByFormula: `{LoginToken} = '${req.cookies.loginToken}'`
            })
            .eachPage(records => {
                let record = records[0]
                if (!record)
                    return res.sendStatus(401)
                if (!record.get("Leading Classes"))
                    return res.sendStatus(401)
                if (!record.get("Leading Classes").includes(req.params.id))
                    return res.sendStatus(401)

                base("Classes").destroy([req.params.id])
                    .then(e => res.sendStatus(200))
                    .catch(e => res.sendStatus(404))
            }).catch(e => res.sendStatus(401))
    })
    app.post("/api/classes/enroll/:id", (req, res) => {
        base("Users")
            .select({
                view: "Main",
                maxRecords: 3,
                filterByFormula: `{LoginToken} = '${req.cookies.loginToken}'`
            })
            .eachPage(records => {
                let record = records[0]
                if (!record)
                    return res.sendStatus(401)
                if (!record.get("Verified"))
                    return res.sendStatus(401)
                let classes = record.get("Enrolled Classes") ? record.get("Enrolled Classes") : [];
                classes.push(req.params.id)
                base("Users").update([{
                    id: record.id,
                    fields: {
                        "Enrolled Classes": record.get("Enrolled Classes") ? classes : [req.params.id]
                    }
                }]).then(e => res.sendStatus(200)).catch(e => console.log(e))
            }).catch(e => res.sendStatus(401))
    })
    app.post("/api/classes/unenroll/:id", (req, res) => {
        base("Users")
            .select({
                view: "Main",
                maxRecords: 3,
                filterByFormula: `{LoginToken} = '${req.cookies.loginToken}'`
            })
            .eachPage(records => {
                let record = records[0]
                if (!record)
                    return res.sendStatus(401)
                if (!record.get("Verified"))
                    return res.sendStatus(401)
                let classes = record.get("Enrolled Classes") ? record.get("Enrolled Classes") : []
                base("Users").update([{
                    id: record.id,
                    fields: {
                        "Enrolled Classes": classes.filter(v => v !== req.params.id)
                    }
                }]).then(e => res.sendStatus(200)).catch(e => res.sendStatus(404))
            }).catch(e => res.sendStatus(401))
    })
    app.get("/api/classes/:id", (req, res) => {
        base("Classes")
            .find(req.params.id)
            .then(classRecord => {
                res.send(classRecord.fields)
            }).catch(e => res.sendStatus(404))
        /* base("Users")
             .select({
                 view: "Main",
                 maxRecords: 3,
                 filterByFormula: `{LoginToken} = '${req.cookies.loginToken}'`
             })
             .eachPage(records => {
                 let record = records[0]
                 if (!record)
                     return res.sendStatus(401)
                 base("Classes")
                     .find(req.params.id)
                     .then(classRecord => {
                         if (!(classRecord.get("Students") ? classRecord.get("Students").includes(record.id) : false))
                             return res.sendStatus(401)
                         res.send(classRecord.fields)
                     }).catch(e => res.sendStatus(404))
             }).catch(e => res.sendStatus(401))*/
    })
    app.get("/api/classes", (req, res) => {
        let allClasses = []
        base("Classes").select({
            view: "Main"
        }).eachPage((records, next) => {
            records.forEach(record => {
                allClasses.push({ fields: record.fields, id: record.id })
            })
            next()
        }).then(d => {
            res.send(allClasses)
        })
    })
    app.get("/api/users", (req, res) => {
        base("Users")
            .select({
                view: "Main",
                maxRecords: 3,
                filterByFormula: `{LoginToken} = '${req.cookies.loginToken}'`
            })
            .eachPage(records => {
                let record = records[0]
                if (!record)
                    return res.sendStatus(401)
                let { Username, Password, ...clean } = record.fields
                res.send(clean)
            }).catch(r => res.sendStatus(401))
    })
    app.get("/api/users/:id", (req, res) => {
        base("Users").find(req.params.id).then(record => {
            if (!record)
                return res.sendStatus(401)
            let { Password, LoginToken, Email, ...clean } = record.fields
            res.send(clean)
        }).catch(r => res.sendStatus(401))
    })
    //NEXTJS ROUTES
    app.get("/*", handle);

    app.listen(process.env.PORT, () => console.log(`Listening in port ${process.env.PORT}!`))
})