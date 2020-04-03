import React, { useRef, useEffect, useState } from "react";
import { Heading, Text, Flex } from "rebass";
import ClassCard from "../../components/ClassCard";
import { Input } from "@rebass/forms";
import axios from "axios";
import Cookie from "js-cookie";
import Link from "next/link"
import { useRouter } from "next/router";

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
const Users = props => {
    const router = useRouter();
    const input = useRef();
    const [classesLead, setClassesLead] = useState([]);
    const [classes, setClasses] = useState([]);
    const [name, setName] = useState(null)
    console.log(props);
    useEffect(() => {
        axios
            .get(`/api/users/${router.query.id}`)
            .then(async json => {
                console.log(json.data);
                setName(json.data.Username)
                if (json.data["Leading Classes"]) {
                    let ClassArray = json.data["Leading Classes"].map(async d => {
                        let res = await axios.get(`/api/classes/${d}`);
                        console.log(res.data);
                        return (
                            <ClassCard
                                href={`/classes/${d}`}
                                title={res.data["Class Name"]}
                                src={res.data["Class Image"][0].url}
                            />
                        );
                    });
                    Promise.all(ClassArray).then(d => {
                        setClassesLead(d);
                    });
                }
                if (json.data["Enrolled Classes"]) {
                    let ClassArray = json.data["Enrolled Classes"].map(async d => {
                        let res = await axios.get(`/api/classes/${d}`);
                        console.log("HERO");
                        return (
                            <ClassCard
                                href={`/classes/${d}`}
                                title={res.data["Class Name"]}
                                src={res.data["Class Image"][0].url}
                            />
                        );
                    });
                    Promise.all(ClassArray).then(d => {
                        setClasses(d);
                    });
                }
            })
            .catch(() => {
                window.location.href = "/"
            });
    }, []);
    return (
        <Flex flexDirection="column" width="100vw">
            <Flex p="30px" flex="1" flexDirection="column">
                <Flex flexDirection="column">
                    <Heading m="auto" fontSize={[4, 5, 6]}>
                        {name ? `@${name}'s Classes` : null}
                    </Heading>
                </Flex>
                <Flex flexDirection="column">
                    {classesLead.length > 0 ? (
                        <Flex flexDirection="column">
                            <Heading fontSize={[3, 4, 5]}>Leading Classes:</Heading>
                            <Flex flexWrap="wrap">{classesLead}</Flex>
                        </Flex>
                    ) : null}
                    {classes.length > 0 ? (
                        <Flex flexDirection="column">
                            <Heading fontSize={[3, 4, 5]}>Enrolled Classes:</Heading>
                            <Flex flexWrap="wrap">{classes}</Flex>
                        </Flex>
                    ) : null}
                </Flex>
            </Flex>
        </Flex>
    );
};

Users.getInitialProps = ctx => {
    return {}
}

export default Users;
