import { Flex, Text, Heading, Box, Image } from "rebass"
import Link from "next/link"
import { useColorMode } from "theme-ui"

export default ({ sx, ...props }) => {
    const [color, setColor] = useColorMode()
    console.log(color)
    return (
        <Link href={props.href ? props.href : "/"}>
            <Flex sx={{
                boxShadow: "md",
                bg: "highlight",
                flexDirection: "column",
                width: ["90vw", null, "30vw", "25vw"],
                borderRadius: "20px",
                overflow: "hidden",
                transition: "all 0.25s",
                m: "auto",
                mb: "30px",
                ":hover": {
                    cursor: "pointer",
                    transform: "scale(1.03) rotate(2deg)",
                },
                ...sx
            }} {...props}>
                <Image width="100%" src={props.src} />
                <Heading p="10px" textAlign="center">{props.title}</Heading>
            </Flex>
        </Link>
    )
}