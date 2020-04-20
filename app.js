require("dotenv").config()
const express = require("express")
const cookieParser = require("cookie-parser")
const next = require("next")
const nodemailer = require("nodemailer")
const Airtable = require("airtable")
const { v4 } = require("uuid")
const axios = require("axios")
const rateLimit = require("express-rate-limit");
const qs = require("querystring")
const crypto = require("crypto")
const createDOMPurify = require('dompurify');
const { JSDOM } = require('jsdom');
const window = new JSDOM('').window;
const DOMPurify = createDOMPurify(window);
const marked = require("marked")
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
                    res.cookie("user", record.id)
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
    app.post("/api/classes/mail/:id", (req, res) => {
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
                        if (!record.get("Leading Classes"))
                            return res.sendStatus(401)
                        if (!record.get("Leading Classes").includes(req.params.id))
                            return res.sendStatus(401)
                        base("Classes").find(req.params.id).then(async record => {
                            let emails = await record.fields.Students.map(d => {
                                return new Promise((res, rej) => {
                                    base("Users")
                                        .find(d)
                                        .then(student => {
                                            res(student.fields.Email)
                                        })
                                })
                            })
                            Promise.all(emails).then(allEmails => {
                                transporter.sendMail({
                                    from: `"Hack University" hackuniversity@outlook.com`,
                                    bcc: allEmails,
                                    subject: `${record.fields["Class Name"]} - ${req.body.subject}`,
                                    html: `
                        <!doctype html>
<html>
  <head>
    <meta name="viewport" content="width=device-width">
    <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
    <style>
    /* -------------------------------------
        INLINED WITH htmlemail.io/inline
    ------------------------------------- */
    /* -------------------------------------
        RESPONSIVE AND MOBILE FRIENDLY STYLES
    ------------------------------------- */
    @media only screen and (max-width: 620px) {
      table[class=body] h1 {
        font-size: 28px !important;
        margin-bottom: 10px !important;
      }
      table[class=body] p,
            table[class=body] ul,
            table[class=body] ol,
            table[class=body] td,
            table[class=body] span,
            table[class=body] a {
        font-size: 16px !important;
      }
      table[class=body] .wrapper,
            table[class=body] .article {
        padding: 10px !important;
      }
      table[class=body] .content {
        padding: 0 !important;
      }
      table[class=body] .container {
        padding: 0 !important;
        width: 100% !important;
      }
      table[class=body] .main {
        border-left-width: 0 !important;
        border-radius: 0 !important;
        border-right-width: 0 !important;
      }
      table[class=body] .btn table {
        width: 100% !important;
      }
      table[class=body] .btn a {
        width: 100% !important;
      }
      table[class=body] .img-responsive {
        height: auto !important;
        max-width: 100% !important;
        width: auto !important;
      }
    }

    /* -------------------------------------
        PRESERVE THESE STYLES IN THE HEAD
    ------------------------------------- */
    @media all {
      .ExternalClass {
        width: 100%;
      }
      .ExternalClass,
            .ExternalClass p,
            .ExternalClass span,
            .ExternalClass font,
            .ExternalClass td,
            .ExternalClass div {
        line-height: 100%;
      }
      .apple-link a {
        color: inherit !important;
        font-family: inherit !important;
        font-size: inherit !important;
        font-weight: inherit !important;
        line-height: inherit !important;
        text-decoration: none !important;
      }
      #MessageViewBody a {
        color: inherit;
        text-decoration: none;
        font-size: inherit;
        font-family: inherit;
        font-weight: inherit;
        line-height: inherit;
      }
      .btn-primary table td:hover {
        background-color: #34495e !important;
      }
      .btn-primary a:hover {
        background-color: #34495e !important;
        border-color: #34495e !important;
      }
    }
    </style>
  </head>
  <body class="" style="background-color: #f6f6f6; font-family: sans-serif; -webkit-font-smoothing: antialiased; font-size: 14px; line-height: 1.4; margin: 0; padding: 0; -ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%;">
    <table border="0" cellpadding="0" cellspacing="0" class="body" style="border-collapse: separate; mso-table-lspace: 0pt; mso-table-rspace: 0pt; width: 100%; background-color: #f6f6f6;">
      <tr>
        <td style="font-family: sans-serif; font-size: 14px; vertical-align: top;">&nbsp;</td>
        <td class="container" style="font-family: sans-serif; font-size: 14px; vertical-align: top; display: block; Margin: 0 auto; max-width: 580px; padding: 10px; width: 580px;">
          <div class="content" style="box-sizing: border-box; display: block; Margin: 0 auto; max-width: 580px; padding: 10px;">

            <!-- START CENTERED WHITE CONTAINER -->
            <table class="main" style="border-collapse: separate; mso-table-lspace: 0pt; mso-table-rspace: 0pt; width: 100%; background: #ffffff; border-radius: 3px;">

              <!-- START MAIN CONTENT AREA -->
              <tr>
                <td class="wrapper" style="font-family: sans-serif; font-size: 14px; vertical-align: top; box-sizing: border-box; padding: 20px;">
                  ${DOMPurify.sanitize(marked(req.body.html))}
                </td>
              </tr>

            <!-- END MAIN CONTENT AREA -->
            </table>

            <!-- START FOOTER -->
            <div class="footer" style="clear: both; Margin-top: 10px; text-align: center; width: 100%;">
              <table border="0" cellpadding="0" cellspacing="0" style="border-collapse: separate; mso-table-lspace: 0pt; mso-table-rspace: 0pt; width: 100%;">
                <tr>
                  <td class="content-block" style="font-family: sans-serif; vertical-align: top; padding-bottom: 10px; padding-top: 10px; font-size: 12px; color: #999999; text-align: center;">
                    <span class="apple-link" style="color: #999999; font-size: 12px; text-align: center;">Don't like the emails? Leave the class on HackUniversity!</span>
                  </td>
                </tr>
                <tr>
                  <td class="content-block powered-by" style="font-family: sans-serif; vertical-align: top; padding-bottom: 10px; padding-top: 10px; font-size: 12px; color: #999999; text-align: center;">
                    Powered by <a href="http://university.hackclub.com" style="color: #999999; font-size: 12px; text-align: center; text-decoration: none;">HackUniversity</a>.
                  </td>
                </tr>
              </table>
            </div>
            <!-- END FOOTER -->

          <!-- END CENTERED WHITE CONTAINER -->
          </div>
        </td>
        <td style="font-family: sans-serif; font-size: 14px; vertical-align: top;">&nbsp;</td>
      </tr>
    </table>
  </body>
</html>
`
                                })
                                res.sendStatus(200)
                            })
                        })
                    }).catch(e => res.sendStatus(401))
            } else {
                res.sendStatus(401)
            }
        })
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
    app.post("/api/classes/:id/post", (req, res) => {
        captcha(req.body.captcha, (captcha) => {
            if (captcha) {
                base("Users")
                    .select({
                        view: "Main",
                        maxRecords: 3,
                        filterByFormula: `{LoginToken} = '${req.cookies.loginToken}'`
                    })
                    .eachPage(records => {
                        let user = records[0]
                        if (!user)
                            return res.sendStatus(401)
                        if (!user.get("Verified"))
                            return res.sendStatus(401)
                        base("Classes")
                            .select({ view: "Main" })
                            .eachPage((records, next) => {
                                records.forEach(record => {
                                    if (record.id == req.params.id) {
                                        posts = JSON.parse(record.get("Posts"))
                                        posts.push({
                                            id: v4(),
                                            body: req.body.body,
                                            title: req.body.title,
                                            user: user.id,
                                            name: user.get("Username"),
                                            comments: []
                                        })
                                        base("Classes").update([{ id: record.id, fields: { Posts: JSON.stringify(posts) } }])
                                        res.sendStatus(200)
                                    }
                                })
                                next()
                            })
                    }).catch(e => res.sendStatus(401))
            } else {
                res.sendStatus(401)
            }
        })
    })
    app.delete("/api/classes/:id/post/:postId", (req, res) => {
        base("Users")
            .select({
                view: "Main",
                maxRecords: 3,
                filterByFormula: `{LoginToken} = '${req.cookies.loginToken}'`
            })
            .eachPage(records => {
                let user = records[0]
                if (!user)
                    return res.sendStatus(401)
                if (!user.get("Verified"))
                    return res.sendStatus(401)
                base("Classes")
                    .select({ view: "Main" })
                    .eachPage((records, next) => {
                        records.forEach(record => {
                            if (record.id == req.params.id) {
                                posts = JSON.parse(record.get("Posts"))
                                posts.map((d, i) => {
                                    if (d.id == req.params.postId) {
                                        if ((d.user == user.id) || (user.id == record.get("Leader")[0])) {
                                            posts.splice(i, 1)
                                            base("Classes").update([{ id: record.id, fields: { Posts: JSON.stringify(posts) } }])
                                            res.sendStatus(200)
                                        } else {
                                            res.sendStatus(401)
                                        }
                                    }
                                })
                            }
                        })
                        next()
                    })
            }).catch(e => res.sendStatus(401))
    })
    app.delete("/api/classes/:id/post/:postId/:commentId", (req, res) => {
        base("Users")
            .select({
                view: "Main",
                maxRecords: 3,
                filterByFormula: `{LoginToken} = '${req.cookies.loginToken}'`
            })
            .eachPage(records => {
                let user = records[0]
                if (!user)
                    return res.sendStatus(401)
                if (!user.get("Verified"))
                    return res.sendStatus(401)
                base("Classes")
                    .select({ view: "Main" })
                    .eachPage((records, next) => {
                        records.forEach(record => {
                            if (record.id == req.params.id) {
                                posts = JSON.parse(record.get("Posts"))
                                posts.map((d, s) => {
                                    if (d.id == req.params.postId) {
                                        d.comments.map((d, i) => {
                                            if (d.id == req.params.commentId) {
                                                if ((d.user == user.id) || (user.id == record.get("Leader")[0])) {
                                                    posts[s].comments.splice(i, 1)
                                                    base("Classes").update([{ id: record.id, fields: { Posts: JSON.stringify(posts) } }])
                                                    res.sendStatus(200)
                                                } else {
                                                    res.sendStatus(401)
                                                }
                                            }
                                        })
                                    }
                                })
                            }
                        })
                        next()
                    })
            }).catch(e => res.sendStatus(401))
    })
    app.post("/api/classes/:id/post/:postId", (req, res) => {
        captcha(req.body.captcha, (captcha) => {
            if (captcha) {
                base("Users")
                    .select({
                        view: "Main",
                        maxRecords: 3,
                        filterByFormula: `{LoginToken} = '${req.cookies.loginToken}'`
                    })
                    .eachPage(records => {
                        let user = records[0]
                        if (!user)
                            return res.sendStatus(401)
                        if (!user.get("Verified"))
                            return res.sendStatus(401)
                        base("Classes")
                            .select({ view: "Main" })
                            .eachPage((records, next) => {
                                records.forEach(record => {
                                    if (record.id == req.params.id) {
                                        posts = JSON.parse(record.get("Posts"))
                                        posts.map(v => {
                                            if (v.id == req.params.postId) {
                                                v.comments.push({
                                                    body: req.body.body,
                                                    user: user.id,
                                                    id: v4(),
                                                    name: user.get("Username")
                                                })
                                            }
                                        })
                                        base("Classes").update([{ id: record.id, fields: { Posts: JSON.stringify(posts) } }])
                                        res.sendStatus(200)
                                    }
                                })
                                next()
                            })
                    }).catch(e => res.sendStatus(401))
            } else {
                res.sendStatus(401)
            }
        })
    })
    app.get("/api/classes/:id/post", (req, res) => {
        base("Users")
            .select({
                view: "Main",
                maxRecords: 3,
                filterByFormula: `{LoginToken} = '${req.cookies.loginToken}'`
            })
            .eachPage(records => {
                let user = records[0]
                if (!user)
                    return res.sendStatus(401)
                if (!user.get("Verified"))
                    return res.sendStatus(401)
                base("Classes")
                    .select({ view: "Main" })
                    .eachPage((records, next) => {
                        records.forEach(record => {
                            if (record.id == req.params.id) {
                                res.send(JSON.parse(record.get("Posts") == "" ? "[]" : record.get("Posts")))
                            }
                        })
                        next()
                    })
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
    app.post("/api/users/update", (req, res) => {
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
                if (req.body.pass == record.fields.Password && record.fields.Verified) {
                    base("Users").update([{
                        id: record.id,
                        fields: {
                            ...req.body.fields
                        }
                    }]).then(d => res.sendStatus(200)).catch(e => console.log(e))
                } else {
                    res.sendStatus(401)
                }
            }).catch(r => res.sendStatus(401))
    })
    //NEXTJS ROUTES
    app.get("/*", handle);

    app.listen(process.env.PORT, () => console.log(`Listening in port ${process.env.PORT}!`))
})