import React from "react";
import { IconButton, useColorMode } from "theme-ui";
import { Flex, Heading, Text, Box } from "rebass";
import { ArrowLeft, Plus, Moon, Sun } from "react-feather";
import Link from "next/link"
import Cookie from "js-cookie"

const NavButton = ({ sx, ...props }) => (
    <IconButton
        {...props}
        sx={{
            color: "primary",
            width: "40px",
            height: "40px",
            borderRadius: "100%",
            transition: "box-shadow .125s ease-in-out",
            ":hover,:focus": {
                boxShadow: "0 0 0 2px",
                outline: "none",
                cursor: "pointer"
            },
            ...sx
        }}
    />
);
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
export default ({ sx, ...props }) => {
    const [mode, setMode] = useColorMode();
    return (
        <Flex height="60px" flexDirection="reverse-row" {...props}>
            <NavLink href="/">Home</NavLink>
            <NavLink href="/classes">Classes</NavLink>
            {Cookie.get("loginToken") ? (
                <NavLink href="/" onClick={() => { Cookie.remove("loginToken"); window.location.href = "/" }} ml="auto">Logout</NavLink>
            ) :
                <NavLink href="/login" sx={{ ml: "auto" }}>Login</NavLink>
            }
            <NavButton
                onClick={() => setMode(mode === "dark" ? "swiss" : "dark")}
                title="Reverse color scheme"
                my="auto"
                mx="20px"
            >
                {mode == "dark" ? <Moon size={24} /> : <Sun size={24} />}
            </NavButton>
        </Flex>
    );
};
