import dotenv from "dotenv"
dotenv.config()
import express from "express"
import cookieParser from "cookie-parser"
import fetch from "isomorphic-unfetch"
import nodemailer from "nodemailer"
import Airtable from "airtable"
import crypto from "crypto"
const base = new Airtable({ apiKey: process.env.AIRTABLE }).base(process.env.BASE);
const app = express()
var transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'neel.redkar@gmail.com',
        pass: process.env.GMAIL
    }
});
app.use(express.json())
app.use(cookieParser());

app.post("/api/signup", (req, res) => {
    let username = req.body.username
    let password = req.body.password
    let email = req.body.email
    let loginToken = crypto.randomBytes(256).toString("hex");
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
        res.cookie("loginToken", loginToken)
        transporter.sendMail({
            to: email,
            subject: "Verify Email for Hack University",
            html: `
                <p>Welcome ${username},</p>
                <br/>
                <p>Thanks for sign up for Hack University! Please <a href="localhost:3000/api/verify/${e[0].id}">verify your email!</a>
                <br/>
                <p>Thanks so much,</p>
                <p>Hack University Team</p>
            `
        }).then(e => {
            res.sendStatus(200)
        })
    })
})
app.get("/api/verify/:id", (req, res) => {
    base("Users").update([{
        id: req.params.id,
        fields: {
            Verified: true
        }
    }]).then(d => {
        res.sendStatus(200)
    }).catch(e => {
        res.sendStatus(404)
    })
})
app.post("/api/classes/create", (req, res) => {
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
            base("Users").update([{
                id: record.id,
                fields: {
                    "Enrolled Classes": record.get("Enrolled Classes") ? record.get("Enrolled Classes").push(req.params.id) : [req.params.id]
                }
            }]).then(e => res.sendStatus(200)).catch(e => res.sendStatus(404))
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
            base("Classes")
                .find(req.params.id)
                .then(classRecord => {
                    if (!(classRecord.get("Students") ? classRecord.get("Students").includes(record.id) : false))
                        return res.sendStatus(401)
                    res.send(classRecord.fields)
                }).catch(e => res.sendStatus(404))
        }).catch(e => res.sendStatus(401))
})
app.get("/api/classes", (req, res) => {
    let allClasses = {}
    base("Classes").select({
        view: "Main"
    }).eachPage((records, next) => {
        records.forEach(record => {
            allClasses[record.get("Class Name")] = { fields: record.fields, id: record.id }
        })
        next()
    }).then(d => {
        res.send(allClasses)
    })
})
app.listen(process.env.PORT, () => console.log(`Listening in port ${process.env.PORT}!`))