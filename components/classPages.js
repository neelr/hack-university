/** @jsx jsx */
import { jsx } from 'theme-ui'
import React, { useEffect, useState, useReducer, useRef } from "react";
import { Flex, Heading, Image as I, Text, Button, Link as A } from "rebass";
import axios from "axios";
import Sidebar from "../components/Sidebar";
import { X } from "react-feather"
import Box from "../components/box";
import { Input, Textarea } from "@rebass/forms";
import marked from "marked"
import DOM from "dompurify"
import Link from "next/link"
import Head from "next/head"
import Captcha from "react-google-recaptcha"
import Cookie from "js-cookie";

const NavLink = ({ sx, ...props }) => (
    <Link href={props.href}>
        <Text {...props} sx={{
            fontWeight: "bold",
            my: "auto",
            mx: "15px",
            fontSize: 2,
            color: "primary",
            ":hover": {
                color: "secondary",
                textDecoration: "none",
                cursor: "pointer"
            },
            ...sx
        }}>
            {props.children}
        </Text>
    </Link>
)
const Index = ({ sx, ...props }) => {
    const [teacher, setTeacher] = useState(null);
    const [resp, setResp] = useState(null);
    useEffect(() => {
        axios
            .get(`/api/classes/${props.id}`)
            .then(r => {
                setResp(r.data);
                axios.get(`/api/users/${r.data.Leader[0]}`)
                    .then(e => setTeacher(e.data.Username))
            })
            .catch(() => console.log(props.id));
    }, []);
    return (
        <Flex width="100vw" flexDirection="column" pt="20px">
            <Head>
                <meta name="og:image" content={resp ? resp["Class Image"][0].url : null} />
            </Head>
            <Heading mx="auto" my="20px">
                {resp ? resp["Class Name"] : null}
            </Heading>
            <Text sx={{ mx: "auto", my: "10px", }}>Teacher: <A href={`/users/${resp ? resp.Leader[0] : ""}`} sx={{ color: "link", textDecorationStyle: "wavy" }}>{`@${teacher}`}</A></Text>
            <I
                src={resp ? resp["Class Image"][0].url : null}
                sx={{
                    width: ["90vw", "30vw", null, "30vw"],
                    borderRadius: "20px",
                    mx: "auto"
                }}
            />
            <Text
                sx={{
                    mx: "auto",
                    width: ["90vw", "50vw", null, "50vw"],
                    p: "15px",
                    textIndent: "20px",
                    a: {
                        textDecorationStyle: "wavy", color: "link", ":hover": { "color": "secondary" }
                    }
                }}
                dangerouslySetInnerHTML={{ __html: DOM.sanitize(marked(resp ? resp.Description : "")) }}
            />
            {resp ? (
                <Button
                    onClick={() => {
                        axios
                            .post(`/api/classes/enroll/${props.id}`)
                            .then(d => {
                                window.location.href = "/classes";
                            })
                            .catch(e => {
                                window.location.href = "/login?err=You need to Sign in/Register and try again!"
                            });
                    }}
                    mx="auto"
                    my="50px"
                    variant="elevated"
                    color="black"
                >
                    Enroll!
                </Button>
            ) : null}
        </Flex>
    );
};
const IndexEnroll = ({ sx, ...props }) => {
    const [resp, setResp] = useState(null);
    const [teacher, setTeacher] = useState(null);
    useEffect(() => {
        axios
            .get(`/api/classes/${props.id}`)
            .then(r => {
                setResp(r.data);
                axios.get(`/api/users/${r.data.Leader[0]}`)
                    .then(e => setTeacher(e.data.Username))
            })
            .catch(() => console.log(props.id));
    }, []);
    return (
        <Flex width="100vw" flexDirection="column" pt="20px">
            <Sidebar id={props.id} />
            <Flex p="10px">
                <NavLink sx={{ ml: "auto" }} href="/" onClick={() => {
                    axios.post(`/api/classes/unenroll/${props.id}`)
                        .then(e => window.location.href = "/classes")
                }}>Leave Class</NavLink>
            </Flex>
            <Heading mx="auto" my="20px">
                {resp ? resp["Class Name"] : null}
            </Heading>
            <Text sx={{ mx: "auto", my: "10px", }}>Teacher: <A href={`/users/${resp ? resp.Leader[0] : ""}`} sx={{ color: "link", textDecorationStyle: "wavy" }}>{`@${teacher}`}</A></Text>
            <I
                src={resp ? resp["Class Image"][0].url : null}
                sx={{
                    width: ["90vw", "30vw", null, "30vw"],
                    borderRadius: "20px",
                    mx: "auto"
                }}
            />
            <Text
                sx={{
                    mx: "auto",
                    width: ["90vw", "50vw", null, "50vw"],
                    p: "15px",
                    textIndent: "20px",
                    a: {
                        textDecorationStyle: "wavy", color: "link", ":hover": { "color": "secondary" }
                    }
                }}
                dangerouslySetInnerHTML={{ __html: DOM.sanitize(marked(resp ? resp.Description : "")) }}
            >
            </Text>
        </Flex>
    );
};

const IndexAdmin = props => {
    const ValidateImg = (file, done) => {
        let img = new Image()
        img.src = window.URL.createObjectURL(file)
        img.onload = () => {
            if ((img.height / img.width) <= 0.7) {
                done(true)
            } else {
                alert("Max image ratio is 7:10");
                return false;
            }

        }
    }
    const [resp, setResp] = useState(null);
    const [text, setText] = useState(null);
    useEffect(() => {
        axios
            .get(`/api/classes/${props.id}`)
            .then(r => {
                setResp(r.data);
            })
            .catch(() => console.log(props.id));
    }, []);
    return (
        <Flex width="100vw" flexDirection="column" pt="20px">
            <Sidebar id={props.id} admin />
            <Heading m="auto" fontSize={[3, 4, 5]}>
                Admin Panel
			</Heading>
            <Box width="80vw" mx="auto" as="form" onSubmit={async e => {
                e.preventDefault()
                setText(null)
                let payload = {
                    "Class Name": document.getElementById("name").value,
                    "Description": document.getElementById("desc").value,
                    "KeyWords": document.getElementById("key").value
                }
                let image = document.getElementById("image")
                let url;
                if (image.files.length > 0) {
                    ValidateImg(image.files[0], async () => {
                        let form = new FormData();
                        form.append("file", image.files[0]);
                        url = await axios({
                            method: "post",
                            url: "https://cors-anywhere.herokuapp.com/uguu.se/api.php?d=upload-tool",
                            data: form,
                            headers: { "Content-Type": "multipart/form-data" }
                        })
                        payload["Class Image"] = [{ url: url.data }]
                        axios.post(`/api/classes/update/${props.id}`, payload)
                            .then(d => {
                                setText(<Text m="auto" color="green">Done!</Text>)
                                document.getElementById("image").value = null
                            })
                    })
                } else {
                    axios.post(`/api/classes/update/${props.id}`, payload)
                        .then(d => {
                            setText(<Text m="auto" color="green">Done!</Text>)
                        })
                }
            }}>
                <Flex m="auto" flexDirection="column">
                    {text}
                    <Text fontWeight="bold" m="auto">
                        Class Name:
					</Text>
                    <Input
                        sx={{ borderRadius: "10px" }}
                        width="70%"
                        m="auto"
                        id="name"
                        defaultValue={resp ? resp["Class Name"] : null}
                    />
                </Flex>
                <Flex m="auto" my="20px" flexDirection="column">
                    <Text fontWeight="bold" m="auto">
                        Class Description:
					</Text>
                    <Textarea
                        id="desc"
                        sx={{ borderRadius: "10px" }}
                        width="70%"
                        m="auto"
                        defaultValue={resp ? resp["Description"] : null}
                    />
                </Flex>
                <Flex m="auto" my="20px" flexDirection="column">
                    <Text fontWeight="bold" m="auto">
                        Keywords (Separated by Comma):
					</Text>
                    <Textarea
                        id="key"
                        sx={{ borderRadius: "10px" }}
                        width="70%"
                        m="auto"
                        defaultValue={resp ? resp["KeyWords"] : null}
                    />
                </Flex>
                <Flex m="auto" my="20px" flexDirection="column">
                    <Text fontWeight="bold" m="auto">
                        Class Image:
					</Text>
                    <Input
                        type="file"
                        id="image"
                        accept="image/*"
                        sx={{ borderRadius: "10px" }}
                        width="70%"
                        m="auto"
                    />
                </Flex>
                <Flex py="20px">
                    <Button m="auto" variant="3D" bg="accent">
                        Save!
                    </Button>
                </Flex>
                <Flex py="20px">
                    <Button m="auto" variant="3D" bg="red" onClick={e => {
                        e.preventDefault()
                        if (confirm("Are you sure you want to delete this class?")) {
                            axios.post(`/api/classes/delete/${props.id}`)
                                .then(d => window.location.href = "/")
                                .catch(d => window.location.href = "/")
                        }
                    }}>
                        Delete
                    </Button>
                </Flex>
            </Box>
        </Flex>
    );
};
const SectionsEnroll = (props) => {
    const [resp, setResp] = useState(null);
    const [text, setText] = useState(null);
    useEffect(() => {
        axios
            .get(`/api/classes/${props.id[0]}`)
            .then(r => {
                r.data.Sections ? null : r.data.Sections = "[]"
                setResp(r.data);
            })
            .catch(() => console.log(props.id));
    }, []);
    return (
        <Flex flexDirection="column" width="100vw">
            <Sidebar id={props.id[0]} />
            <Heading m="auto" fontSize={[3, 4, 5]}>
                Sections
			</Heading>
            {resp ? JSON.parse(resp.Sections).map(v => (
                <Box sx={{ display: "flex" }} mx="auto" width={["90vw", "50vw", null, "50vw"]} >
                    <Heading fontSize={[3, 4, 5]} m="auto">{v.name}</Heading>
                    <Flex flexDirection="column" width={["90vw", "50vw", null, "50vw"]} p="30px" m="auto" dangerouslySetInnerHTML={{ __html: DOM.sanitize(marked(v.text)) }}>
                    </Flex>
                    <hr sx={{ mx: "30vw" }} />
                </Box>
            )) : null}
        </Flex>
    )
}
const SectionsAdmin = props => {
    const [ignored, forceUpdate] = useReducer(x => x + 1, 0);
    const [resp, setResp] = useState(null);
    const [text, setText] = useState(null);
    useEffect(() => {
        axios
            .get(`/api/classes/${props.id[0]}`)
            .then(r => {
                setResp(JSON.parse(r.data.Sections));
            })
            .catch(() => console.log(props.id));
    }, []);
    return (
        <Flex width="100vw" flexDirection="column" pt="20px">
            <Sidebar id={props.id[0]} admin />
            <Heading m="auto" fontSize={[3, 4, 5]}>
                Admin Sections Panel
			</Heading>
            {text}
            <Flex flexDirection="column" as="form" onSubmit={(e) => {
                e.preventDefault()
                setText(null)
                let sections = []
                resp.map((v, i) => {
                    sections.push({ name: document.getElementById(`${i}-name`).value, text: document.getElementById(i).value })
                })
                axios.post(`/api/classes/update/${props.id[0]}`, { Sections: JSON.stringify(sections) })
                    .then(d => {
                        setText(<Text m="auto" color="green">Done!</Text>)
                    })
            }}>
                {resp ? resp.map((v, i) => (
                    <Box width="80vw" mx="auto" as="form" my="20px">
                        <Flex>
                            <Flex onClick={() => {
                                let buff = resp;
                                buff.splice(i, 1)
                                console.log(resp)
                                setResp(buff)
                                forceUpdate()
                            }} m="10px" ml="auto" p="3px" sx={{ borderRadius: "30px", transition: "all 0.2s", ":hover": { color: "red", cursor: "pointer", border: "1px solid red" } }}>
                                <X size={24} />
                            </Flex>
                        </Flex>
                        <Flex m="auto" my="20px" flexDirection="column">
                            <Input id={`${i}-name`} defaultValue={v.name} sx={{ borderRadius: "10px", my: "10px" }} mx="auto" placeholder="Title" width="80%" />
                            <Textarea
                                id={i}
                                sx={{ borderRadius: "10px" }}
                                width="70%"
                                m="auto"
                                placeholder="Markdown"
                                defaultValue={v.text}
                            />
                        </Flex>
                    </Box>)) : null
                }
                <Flex py="20px">
                    <Button onClick={(e) => {
                        e.preventDefault()
                        if (resp) {
                            resp.push({ name: "", text: "" })
                        } else {
                            setResp([{ name: "", text: "" }])
                        }
                        forceUpdate()
                    }} m="auto" variant="3D" bg="green">
                        Add
                </Button>
                </Flex>
                <Flex py="20px">
                    <Button m="auto" variant="3D" bg="green">
                        Save!
                </Button>
                </Flex>
            </Flex>
        </Flex>
    );
};

const FilesEnrolled = (props) => {
    const [ignored, forceUpdate] = useReducer(x => x + 1, 0);
    const [resp, setResp] = useState(null);
    const [text, setText] = useState(null);
    useEffect(() => {
        axios
            .get(`/api/classes/${props.id[0]}`)
            .then(r => {
                r.data.Files ? null : r.data.Files = []
                setResp(r.data);
                console.log("hi")
            })
            .catch(e => console.log(e));
    }, []);
    return (
        <Flex width="100vw" flexDirection="column">
            <Sidebar id={props.id[0]} />
            <Heading m="auto" fontSize={[4, 5, 6]}>Files</Heading>
            {resp ? resp.Files.map(v => {
                return <A href={v.url} sx={{ color: "link", m: "auto", my: "10px", textDecorationStyle: "wavy" }}>{v.filename}</A>
            }) : null}
        </Flex>
    )
}
const FilesAdmin = (props) => {
    const [ignored, forceUpdate] = useReducer(x => x + 1, 0);
    const [resp, setResp] = useState({});
    const [text, setText] = useState(null);
    useEffect(() => {
        axios
            .get(`/api/classes/${props.id[0]}`)
            .then(r => {
                setResp(r.data);
                console.log("hi")
            })
            .catch(e => console.log(e));
    }, []);
    return (
        <Flex width="100vw" flexDirection="column">
            <Sidebar id={props.id[0]} admin />
            <Heading m="auto" fontSize={[4, 5, 6]}>Files</Heading>
            {text}
            {resp.Files ? resp.Files.map((v, i) => {
                return (
                    <Flex my="10px">
                        <A href={v.url} sx={{ color: "link", ml: "auto", mr: "10px", my: "auto", textDecorationStyle: "wavy" }}>{v.filename}</A>
                        <Button onClick={() => {
                            setText(null)
                            let buff = resp.Files
                            buff.splice(i, 1)
                            axios.post(`/api/classes/update/${props.id[0]}`, { Files: buff })
                                .then(d => {
                                    axios
                                        .get(`/api/classes/${props.id[0]}`)
                                        .then(r => {
                                            setText(<Text color="red" mx="auto" my="10px">Deleted!</Text>)
                                            setResp(r.data);
                                            console.log("hi")
                                        })
                                        .catch(e => console.log(e));
                                })
                        }} bg="red" mr="auto" ml="20px" sx={{ ":hover": { cursor: "pointer" } }}>Delete</Button>
                    </Flex>
                )
            }) : null}
            <Input id="file" onChange={async () => {
                setText(<Text mx="auto" my="10px" color="yellow">Uploading...</Text>)
                let file = document.getElementById("file")
                let form = new FormData()
                form.append("file", file.files[0])
                form.append("name", file.files[0].name)
                let url = await axios({
                    method: "put",
                    url: "https://cors-anywhere.herokuapp.com/transfer.sh/" + file.files[0].name,
                    data: file.files[0],
                })
                url = url.data
                let Files = resp.Files ? resp.Files : []
                Files.push({ url: url, filename: file.files[0].name })
                axios.post(`/api/classes/update/${props.id[0]}`, { Files: Files })
                    .then(d => {
                        axios
                            .get(`/api/classes/${props.id[0]}`)
                            .then(r => {
                                setText(<Text color="green" mx="auto" my="10px">Done!</Text>)
                                setResp(r.data);
                                console.log("hi")
                                file.value = ""
                            })
                            .catch(e => console.log(e));
                    })
                    .catch(d => setText(<Text color="red" mx="auto" my="10px">Filetype not Allowed</Text>))
            }} type="file" width="300px" mx="auto" />
        </Flex>
    )
}
const Students = (props) => {
    const [resp, setResp] = useState(null);
    useEffect(() => {
        axios
            .get(`/api/classes/${props.id[0]}`)
            .then(async r => {
                let names = r.data.Students.map(async d => {
                    let name = await axios.get(`/api/users/${d}`)
                    return <A href={`/users/${d}`} sx={{ color: "link", borderRadius: "10px", textDecorationStyle: "wavy" }} mx="auto" my="10px" p="10px" bg="#AC2901">{name.data.Username}</A>
                })
                names = await Promise.all(names)
                setResp(names)
            })
            .catch(e => console.log(e));
    }, []);
    return (
        <Flex flexDirection="column" width="100vw">
            <Sidebar id={props.id[0]} />
            <Heading mx="auto" fontSize={[3, 4, 5]}>Students!</Heading>
            {resp}
        </Flex>
    )
}
const StudentsAdmin = (props) => {
    const [resp, setResp] = useState(null);
    useEffect(() => {
        axios
            .get(`/api/classes/${props.id[0]}`)
            .then(async r => {
                let names = r.data.Students.map(async d => {
                    let name = await axios.get(`/api/users/${d}`)
                    return <A href={`/users/${d}`} sx={{ color: "link", borderRadius: "10px", textDecorationStyle: "wavy" }} mx="auto" my="10px" p="10px" bg="#AC2901">{name.data.Username}</A>
                })
                names = await Promise.all(names)
                setResp(names)
            })
            .catch(e => console.log(e));
    }, []);
    return (
        <Flex flexDirection="column" width="100vw">
            <Sidebar id={props.id[0]} admin />
            <Heading mx="auto" fontSize={[3, 4, 5]}>Students!</Heading>
            {resp}
        </Flex>
    )
}

const Mail = (props) => {
    let [text, setText] = useState(null)
    let captcha = useRef()
    return (
        <Flex flexDirection="column" width="100vw">
            <Sidebar id={props.id[0]} admin />
            <Heading m="auto" fontSize={[4, 5, 6]}>
                Send Mail!
            </Heading>
            <Box
                id="form"
                as="form"
                mx="auto"
                my="15px"
                sx={{ p: "10px", py: "30px" }}
                width={["90vw", "50vw", "50vw", "50vw"]}
                onSubmit={e => {
                    e.preventDefault()
                    setText(<Text mx="auto" textAlign="center" color="yellow" fontWeight="700">Sending...</Text>)
                    axios.post(`/api/classes/mail/${props.id[0]}`, {
                        subject: document.getElementById("subject").value,
                        captcha: captcha.current.getValue(),
                        html: document.getElementById("body").value
                    }).then(d => {
                        setText(<Text mx="auto" textAlign="center" color="green" fontWeight="700">Sent!</Text>)
                    }).catch(d => {
                        setText(<Text mx="auto" textAlign="center" color="red" fontWeight="700">Fill out the Captcha!</Text>)
                    })
                }}
            >
                {text}
                <Flex m="auto" flexDirection="column">
                    <Text fontWeight="bold" m="auto">
                        Subject:
                    </Text>
                    <Input
                        sx={{ borderRadius: "10px" }}
                        width="70%"
                        m="auto"
                        id="subject"
                        required
                    />
                </Flex>
                <Flex m="auto" my="20px" flexDirection="column">
                    <Text fontWeight="bold" m="auto">
                        Body:
                    </Text>
                    <Textarea
                        id="body"
                        sx={{ borderRadius: "10px" }}
                        width="70%"
                        m="auto"
                        placeholder="Markdown"
                        required
                    />
                </Flex>
                <Flex py="20px">
                    <Flex mx="auto">
                        <Captcha
                            ref={captcha}
                            sitekey="6LcvzOYUAAAAAOuU-30rjhvgKl3dtzM1iRcF2uZW"
                        />
                    </Flex>
                </Flex>
                <Flex py="20px">
                    <Button m="auto" variant="3D" bg="accent">
                        Send!
                    </Button>
                </Flex>
            </Box>
        </Flex>
    )
}
const Posts = (props) => {
    let [resp, setResp] = useState(null)
    let [text, setText] = useState(null)
    let captcha = useRef()
    useEffect(() => {
        axios
            .get(`/api/classes/${props.id[0]}/post`)
            .then(r => {
                setResp(r.data);
                console.log("hi")
            })
            .catch(e => console.log(e));
    }, []);
    return (
        <Flex flexDirection="column" width="100vw">
            <Sidebar id={props.id[0]} admin={props.admin} />
            <Heading m="auto" fontSize={[4, 5, 6]} pt="30px">
                Posts
            </Heading>
            <Flex mx="auto" flexDirection="column" width={["90vw", "50vw", "50vw", "50vw"]} sx={{
                a: {
                    textDecorationStyle: "wavy", color: "link", ":hover": { "color": "secondary" }
                }
            }}>
                {resp ? resp.map(v => (
                    <div style={{ display: "block" }}>
                        <Flex>
                            <Flex ml="auto">
                                {(v.user == Cookie.get("user")) || props.admin ?
                                    (
                                        <Flex onClick={() => {
                                            axios.delete(`/api/classes/${props.id[0]}/post/${v.id}`)
                                                .then(d => location.reload())
                                        }} m="10px" ml="auto" p="3px" sx={{ borderRadius: "30px", transition: "all 0.2s", ":hover": { color: "red", cursor: "pointer", border: "1px solid red" } }}>
                                            <X size={24} />
                                        </Flex>
                                    )
                                    : null}
                            </Flex>
                        </Flex>
                        <a href={`/classes/${props.id[0]}/post/${v.id}`}><Heading>{v.title}</Heading></a>
                        <a sx={{ textDecoration: "none" }} href={`/users/${v.user}`}>{`@${v.name}`}</a>
                        <Text color="grey" dangerouslySetInnerHTML={{ __html: DOM.sanitize(marked(v.body)) }} />
                        <hr />
                    </div>
                )) : null}
                <Flex flexDirection="column" as="form" mb="30px" onSubmit={e => {
                    e.preventDefault()
                    axios.post(`/api/classes/${props.id[0]}/post`, {
                        body: document.getElementById("body").value,
                        title: document.getElementById("title").value,
                        captcha: captcha.current.getValue()
                    })
                        .then(d => {
                            location.reload()
                        })
                        .catch(d => {
                            setText("You must fill out the Captcha!")
                        })
                }}>
                    <Flex my="20px" flexDirection="column">
                        <Text fontWeight="bold" m="auto">
                            Make a Post!
					    </Text>
                        <Text color="red" mx="auto">{text}</Text>
                        <Input
                            sx={{ borderRadius: "10px", width: "100%", mb: "10px" }}
                            id="title"
                            placeholder="Title"
                            required
                        />
                        <Textarea
                            id="body"
                            placeholder="Body Mardown"
                            sx={{ borderRadius: "10px", width: "100%", height: "200px", m: "auto" }}
                            defaultValue={resp ? resp["Description"] : null}
                            required
                        />
                        <Flex m="auto" mt="20px">
                            <Captcha ref={captcha} sitekey="6LcvzOYUAAAAAOuU-30rjhvgKl3dtzM1iRcF2uZW" />
                        </Flex>
                    </Flex>
                    <Button sx={{ ":hover": { cursor: "pointer" } }}>Submit!</Button>
                </Flex>
            </Flex>
        </Flex >
    )
}
const Post = (props) => {
    let [text, setText] = useState(null)
    let [resp, setResp] = useState(null)
    let captcha = useRef()
    useEffect(() => {
        axios
            .get(`/api/classes/${props.id[0]}/post`)
            .then(r => {
                r.data.map(v => {
                    if (v.id == props.id[2]) {
                        setResp(v)
                    }
                })
            })
            .catch(e => console.log(e));
    }, []);
    return (
        <Flex flexDirection="column" width={["90vw", "50vw", "50vw", "50vw"]} mx="auto" sx={{
            a: {
                textDecorationStyle: "wavy", color: "link", ":hover": { "color": "secondary" }
            }
        }}>
            < Sidebar id={props.id[0]} admin={props.admin} />
            <Heading m="auto" fontSize={[4, 5, 6]} pt="30px">
                {resp ? resp.title : null}
            </Heading>
            <a sx={{ textDecoration: "none" }} href={`/users/${resp ? resp.user : null}`}>{`@${resp ? resp.name : null}`}</a>
            <Text dangerouslySetInnerHTML={{ __html: DOM.sanitize(marked(resp ? resp.body : "")) }}></Text>
            <Flex flexDirection="column">
                <Heading m="10px">Comments</Heading>
                {resp ? resp.comments.map(v => (
                    <div style={{ display: "block", border: "1px solid grey", padding: "10px" }}>
                        <Flex>
                            <Flex ml="auto">
                                {(v.user == Cookie.get("user")) || props.admin ?
                                    (
                                        <Flex onClick={() => {
                                            axios.delete(`/api/classes/${props.id[0]}/post/${props.id[2]}/${v.id}`)
                                                .then(d => location.reload())
                                        }} m="10px" ml="auto" p="3px" sx={{ borderRadius: "30px", transition: "all 0.2s", ":hover": { color: "red", cursor: "pointer", border: "1px solid red" } }}>
                                            <X size={24} />
                                        </Flex>
                                    )
                                    : null}
                            </Flex>
                        </Flex>
                        <a sx={{ textDecoration: "none" }} href={`/users/${v.user}`}>{`@${v.name}`}</a>
                        <Text color="grey" dangerouslySetInnerHTML={{ __html: DOM.sanitize(marked(v.body)) }} />
                    </div>
                )) : null}
                <Flex flexDirection="column" mb="30px" as="form" onSubmit={e => {
                    e.preventDefault()
                    axios.post(`/api/classes/${props.id[0]}/post/${props.id[2]}`, { body: document.getElementById("body").value, captcha: captcha.current.getValue() })
                        .then(d => {
                            location.reload()
                        })
                        .catch(d => setText("You need to fill out the Captcha!"))
                }}>
                    <Flex my="20px" flexDirection="column">
                        <Text fontWeight="bold" m="auto">
                            Make a Comment!
					    </Text>
                        <Text color="red" mx="auto">{text}</Text>
                        <Textarea
                            id="body"
                            sx={{ borderRadius: "10px", width: "100%", height: "200px" }}
                            defaultValue={resp ? resp["Description"] : null}
                            required
                        />
                        <Flex m="auto" mt="20px">
                            <Captcha ref={captcha} sitekey="6LcvzOYUAAAAAOuU-30rjhvgKl3dtzM1iRcF2uZW" />
                        </Flex>
                    </Flex>
                    <Button sx={{ ":hover": { cursor: "pointer" } }}>Submit!</Button>
                </Flex>
            </Flex>
        </Flex >
    )
}
export default {
    index: id => <Index id={id} />,
    indexEnroll: id => <IndexEnroll id={id} />,
    indexAdmin: id => <IndexAdmin id={id} />,
    sectionsEnroll: id => <SectionsEnroll id={id} />,
    sectionsAdmin: id => <SectionsAdmin id={id} />,
    filesEnroll: id => <FilesEnrolled id={id} />,
    filesAdmin: id => <FilesAdmin id={id} />,
    studentsEnroll: id => <Students id={id} />,
    studentsAdmin: id => <StudentsAdmin id={id} />,
    mailAdmin: id => <Mail id={id} />,
    postsEnroll: id => <Posts id={id} />,
    postsAdmin: id => <Posts id={id} admin />,
    postEnroll: id => <Post id={id} />,
    postAdmin: id => <Post id={id} admin />
};
