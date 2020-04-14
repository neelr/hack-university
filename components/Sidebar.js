import { Flex, Text } from "rebass";
import { AlignJustify, X } from "react-feather";
import Link from "next/link"

const Tabs = ({ sx, ...props }) => (
    <Link href={props.href}>
        <Flex sx={{
            py: "10px",
            ":hover": {
                bg: "accent",
                cursor: "pointer"
            },
            ...sx
        }} {...props}>
            <Text mx="auto" fontWeight="bold">{props.children}</Text>
        </Flex>
    </Link>
)

export default props => {
    return (
        <Flex>
            <Flex
                id="icon"
                onClick={() =>
                    (document.getElementById("sidebar").style.width = "300px")
                }
                sx={{
                    bg: "primary",
                    color: "white",
                    display: props.hidden ? "none" : null,
                    left: 0,
                    top: "50px",
                    p: "10px",
                    position: "absolute",
                    ":hover": { color: "grey", cursor: "pointer" }
                }}
            >
                <AlignJustify size={30} />
            </Flex>
            <Flex
                id="sidebar"
                sx={{
                    width: ["0px", null, null, "300px"],
                    bg: "primary",
                    transition: "all 0.5s",
                    overflow: "hidden",
                    height: "100vh",
                    position: "fixed",
                    left: 0,
                    top: "50px",
                    flexDirection: "column",
                    color: "white"
                }}
            >
                <Flex
                    onClick={() =>
                        (document.getElementById("sidebar").style.width = "0px")
                    }
                    sx={{ m: "10px", mr: "auto", ":hover": { color: "grey", cursor: "pointer" } }}
                >
                    <X size={24} />
                </Flex>
                <Tabs href={`/classes/${props.id}`}>Home</Tabs>
                <Tabs href={`/classes/${props.id}/sections`}>Sections</Tabs>
                <Tabs href={`/classes/${props.id}/files`}>Files</Tabs>
                <Tabs href={`/classes/${props.id}/students`}>Students</Tabs>
            </Flex>
        </Flex>
    );
};
