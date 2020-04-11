import { useState } from "react";
import { Input, Label } from "@rebass/forms";
import { Text, Flex, Heading, Button } from "rebass";
import { useRouter } from 'next/router'
import Box from "../components/box";
import sha256 from "crypto-js/sha256";
import axios from "axios";
import Link from "next/link";

export default props => {
    const router = useRouter()
    console.log(router.query.err)
    let [text, setText] = useState(null);
    if (!text && router.query.err) {
        text = <Text
            textAlign="center"
            p="10px"
            fontWeight="bold"
            color="red"
        >
            {router.query.err}
        </Text>
    }
    return (
        <Flex width="100vw" flexDirection="column">
            <Heading m="auto" fontSize={[3, 4, 5]}>
                Change Password
            </Heading>
            <Box
                onSubmit={e => {
                    e.preventDefault();
                    setText(null);
                    axios
                        .post("/api/users/update", {
                            pass: String(
                                sha256(
                                    document.getElementById("oldpass").value +
                                    document.getElementById("username").value
                                )
                            ),
                            fields: {
                                Username: document.getElementById("username").value,
                                Password: String(
                                    sha256(
                                        document.getElementById("pass").value +
                                        document.getElementById("username").value
                                    )
                                )
                            }
                        })
                        .then(r => {
                            window.location.href = "/";
                        })
                        .catch(e => {
                            console.log(e);
                            setText(
                                <Text textAlign="center" p="10px" fontWeight="bold" color="red">
                                    Not Authorized!
                                </Text>
                            )
                        });
                }}
                mx="auto"
                my="15px"
                sx={{ p: "10px", py: "30px" }}
                width={["90vw", "50vw", "50vw", "50vw"]}
                as="form"
            >
                {text}
                <Flex m="auto">
                    <Text fontWeight="bold" m="auto" mr="10px">
                        Current Username:
                    </Text>
                    <Input
                        sx={{ borderRadius: "10px" }}
                        width="70%"
                        m="auto"
                        ml="10px"
                        id="username"
                        required
                    />
                </Flex>
                <Flex m="auto" my="20px">
                    <Text fontWeight="bold" m="auto" mr="10px">
                        New Password:
                    </Text>
                    <Input
                        type="password"
                        id="pass"
                        sx={{ borderRadius: "10px" }}
                        width="70%"
                        m="auto"
                        ml="10px"
                        required
                    />
                </Flex>
                <Flex m="auto" my="20px">
                    <Text fontWeight="bold" m="auto" mr="10px">
                        Old Password:
                    </Text>
                    <Input
                        type="password"
                        id="oldpass"
                        sx={{ borderRadius: "10px" }}
                        width="70%"
                        m="auto"
                        ml="10px"
                        required
                    />
                </Flex>
                <Flex py="20px">
                    <Button m="auto" variant="3D" bg="#7E92FF">
                        Submit Changes
                    </Button>
                </Flex>
            </Box>
        </Flex>
    );
};
