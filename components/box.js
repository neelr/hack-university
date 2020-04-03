import React from "react"
import { Card } from "rebass"

export default ({ sx, ...props }) => (
    <Card sx={{
        boxShadow: "md",
        borderRadius: "10px",
        p: "15px",
        m: "15px",
        flexDirection: "column",
        bg: "highlight",
        ...sx
    }} {...props}>
        {props.children}
    </Card>
)