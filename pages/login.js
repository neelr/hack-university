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
      <Heading m="auto" fontSize={[4, 5, 6]}>
        Login
      </Heading>
      <Box
        onSubmit={e => {
          e.preventDefault();
          setText(null);
          axios
            .post("/api/login", {
              username: document.getElementById("username").value,
              password: String(
                sha256(
                  document.getElementById("pass").value +
                  document.getElementById("username").value
                )
              )
            })
            .then(r => {
              if (r.data.verified) {
                setText(
                  <Text
                    textAlign="center"
                    p="10px"
                    fontWeight="bold"
                    color="red"
                  >
                    Account Not Verified!
                  </Text>
                );
              } else {
                window.location.href = "/";
              }
            })
            .catch(e =>
              setText(
                <Text textAlign="center" p="10px" fontWeight="bold" color="red">
                  Wrong Username or Password!
                </Text>
              )
            );
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
            Username:
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
            Password:
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
        <Flex py="20px">
          <Button m="auto" variant="3D" bg="#7E92FF">
            Sign in!
          </Button>
          <Link href="/register">
            <Button m="auto" variant="3D" bg="accent">
              Register!
            </Button>
          </Link>
        </Flex>
      </Box>
    </Flex>
  );
};
