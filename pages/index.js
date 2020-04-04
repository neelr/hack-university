import React, { useRef, useEffect, useState } from "react";
import { Heading, Text, Flex } from "rebass";
import ClassCard from "../components/ClassCard";
import { Input } from "@rebass/forms";
import axios from "axios";

const Index = props => {
  const input = useRef();
  const [classes, setClasses] = useState([]);
  const [shownClasses, setShownClasses] = useState([]);
  console.log(props);
  useEffect(() => {
    axios.get("/api/classes").then(json => {
      setClasses(json.data);
      setShownClasses(Object.values(json.data))
    });
  }, []);
  return (
    <Flex p="30px" flex="1" flexDirection="column">
      <Flex flexDirection="column">
        <Heading m="auto" fontSize={[5, 6, 7]}>
          Hack University
        </Heading>
        <Heading m="auto" fontSize={[3, 4, 5]}>
          Making Education Open Source.
        </Heading>
        <Text
          sx={{
            m: "auto",
            width: ["90vw", null, "50vw"],
            textIndent: "3vw",
            p: "20px"
          }}
        >
          Welcome to Hack University! The best place to teach and learn! Here, its easy to host an online class, or open source
          your classes already happening online! Here, you can teach anything, from the basics of sowing, to rocket science! To teach, just go to your classes, and ceate a new class! Then, you can add different sections, and add zoom links to meet up with students and lecture! This way, since everything is already going online due to COVID19, we may as well make it open source!
        </Text>
      </Flex>
      <Flex flexDirection="column">
        <Input
          ref={input}
          placeholder="Search..."
          sx={{ width: "35vw", mx: "auto", my: "15px", borderRadius: "5px" }}
          onChange={e => {
            console.log(shownClasses)
            let show = []
            let flag = true
            Object.values(classes).map(v => {
              v.fields.KeyWords.split(",").map(k => {
                if (k.toLowerCase().includes(e.target.value.toLowerCase()) && flag) {
                  show.push(v)
                  flag = false
                }
              })
              flag = true
            })
            console.log(show)
            setShownClasses(show)
          }}
        />
        <Flex flexWrap="wrap">
          {shownClasses.map(v => (
            <ClassCard
              href={`/classes/${v.id}`}
              title={v.fields["Class Name"]}
              src={v.fields["Class Image"][0].url}
            />
          ))}
        </Flex>
      </Flex>
    </Flex>
  );
};
export default Index;
