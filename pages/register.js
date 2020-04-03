import { useState } from "react";
import { Input, Label } from "@rebass/forms";
import { Text, Flex, Heading, Button } from "rebass";
import Box from "../components/box";
import sha256 from "crypto-js/sha256";
import axios from "axios";

export default props => {
  const [text, setText] = useState(null);
  return (
    <Flex p="30px" width="100vw" flexDirection="column">
      <Heading m="auto" fontSize={[4, 5, 6]}>
        Register
      </Heading>
      <Box
        id="form"
        as="form"
        onSubmit={e => {
          e.preventDefault();
          setText(null);
          axios
            .post("/api/signup", {
              email: document.getElementById("email").value,
              username: document.getElementById("username").value,
              password: String(
                sha256(
                  document.getElementById("pass").value +
                    document.getElementById("username").value
                )
              )
            })
            .then(r => {
              document.getElementById("form").reset();
              setText(
                <Text
                  textAlign="center"
                  p="10px"
                  fontWeight="bold"
                  color="green"
                >
                  Done! Check your email to verify, then Login!
                </Text>
              );
            })
            .catch(e =>
              setText(
                <Text textAlign="center" p="10px" fontWeight="bold" color="red">
                  Username Taken!
                </Text>
              )
            );
        }}
        mx="auto"
        my="15px"
        sx={{ p: "10px", py: "30px" }}
        width={["90vw", "50vw", "50vw", "50vw"]}
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
        <Flex m="auto" my="20px">
          <Text fontWeight="bold" m="auto" mr="10px">
            Email:
          </Text>
          <Input
            type="email"
            id="email"
            sx={{ borderRadius: "10px" }}
            width="70%"
            m="auto"
            ml="10px"
            required
          />
        </Flex>
        <Flex py="20px">
          <Button m="auto" variant="3D" bg="accent">
            Register!
          </Button>
        </Flex>
      </Box>
    </Flex>
  );
};
