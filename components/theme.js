export default {
  useCustomProperties: true,
  initialColorMode: "swiss",
  colors: {
    text: "hsl(10, 20%, 20%)",
    background: "hsl(10, 10%, 98%)",
    primary: "hsl(10, 80%, 50%)",
    secondary: "hsl(10, 60%, 50%)",
    highlight: "hsl(10, 40%, 90%)",
    accent: "hsl(250, 60%, 30%)",
    muted: "hsl(10, 20%, 94%)",
    gray: "hsl(10, 20%, 50%)",
    link: "#7e9eff",
    modes: {
      dark: {
        text: "#fff",
        background: "#1B1A1F",
        primary: "#FF5A5F",
        secondary: "hsl(10, 60%, 50%)",
        highlight: "#FF5A5F",
        accent: "#609",
        gray: "#999"
      }
    }
  },
  fonts: {
    body:
      'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", sans-serif',
    heading: "inherit",
    monospace: "Menlo, monospace"
  },
  fontSizes: [12, 14, 16, 20, 24, 32, 48, 64, 72],
  fontWeights: {
    body: 400,
    heading: 700,
    display: 900
  },
  lineHeights: {
    body: 1.5,
    heading: 1.25
  },
  textStyles: {
    heading: {
      fontFamily: "heading",
      fontWeight: "heading",
      lineHeight: "heading"
    },
    display: {
      variant: "textStyles.heading",
      fontSize: [5, 6],
      fontWeight: "display",
      letterSpacing: "-0.03em",
      mt: 3
    }
  },
  styles: {
    Container: {
      p: 3,
      maxWidth: 1024
    },
    root: {
      fontFamily: "body",
      lineHeight: "body",
      fontWeight: "body"
    },
    h1: {
      variant: "textStyles.display"
    },
    h2: {
      variant: "textStyles.heading",
      fontSize: 5
    },
    h3: {
      variant: "textStyles.heading",
      fontSize: 4
    },
    h4: {
      variant: "textStyles.heading",
      fontSize: 3
    },
    h5: {
      variant: "textStyles.heading",
      fontSize: 2
    },
    h6: {
      variant: "textStyles.heading",
      fontSize: 1
    },
    a: {
      color: "primary",
      "&:hover": {
        color: "secondary"
      }
    },
    pre: {
      fontFamily: "monospace",
      fontSize: 1,
      p: 3,
      color: "text",
      bg: "muted",
      overflow: "auto",
      code: {
        color: "inherit"
      }
    },
    code: {
      fontFamily: "monospace",
      fontSize: 1
    },
    inlineCode: {
      fontFamily: "monospace",
      color: "secondary",
      bg: "muted"
    },
    table: {
      width: "100%",
      my: 4,
      borderCollapse: "separate",
      borderSpacing: 0,
      "th,td": {
        textAlign: "left",
        py: "4px",
        pr: "4px",
        pl: 0,
        borderColor: "muted",
        borderBottomStyle: "solid"
      }
    },
    th: {
      verticalAlign: "bottom",
      borderBottomWidth: "2px"
    },
    td: {
      verticalAlign: "top",
      borderBottomWidth: "1px"
    },
    hr: {
      border: 0,
      borderBottom: "1px solid",
      borderColor: "muted"
    }
  },
  buttons: {
    simple: {
      py: 2,
      px: 3,
      cursor: "pointer",
      fontSize: "100%",
      lineHeight: "inherit",
      backgroundColor: "primary",
      border: "none",
      color: "white",
      fontWeight: "bold",
      borderRadius: "default",
      "&:hover": {
        backgroundColor: "primaryHover"
      }
    },
    pill: {
      py: 2,
      px: 3,
      cursor: "pointer",
      fontSize: "100%",
      lineHeight: "inherit",
      backgroundColor: "primary",
      border: "none",
      color: "white",
      fontWeight: "bold",
      borderRadius: "full",
      "&:hover": {
        backgroundColor: "primaryHover"
      }
    },
    outline: {
      py: 2,
      px: 3,
      cursor: "pointer",
      fontSize: "100%",
      lineHeight: "inherit",
      backgroundColor: "transparent",
      borderWidth: "1px",
      borderStyle: "solid",
      borderColor: "primary",
      color: "primary",
      fontWeight: "semibold",
      borderRadius: "default",
      "&:hover": {
        backgroundColor: "primary",
        color: "white",
        borderColor: "transparent"
      }
    },
    bordered: {
      py: 2,
      px: 3,
      cursor: "pointer",
      fontSize: "100%",
      lineHeight: "inherit",
      backgroundColor: "primary",
      borderWidth: "1px",
      borderStyle: "solid",
      borderColor: "primaryHover",
      color: "white",
      fontWeight: "bold",
      borderRadius: "default",
      "&:hover": {
        backgroundColor: "primaryHover"
      }
    },
    disabled: {
      py: 2,
      px: 3,
      cursor: "not-allowed",
      fontSize: "100%",
      lineHeight: "inherit",
      backgroundColor: "primary",
      border: "none",
      opacity: 0.5,
      color: "white",
      fontWeight: "bold",
      borderRadius: "default"
    },
    "3D": {
      py: 2,
      px: 3,
      cursor: "pointer",
      fontSize: "100%",
      lineHeight: "inherit",
      backgroundColor: "primary",
      border: "none",
      borderBottomWidth: "4px",
      borderBottomStyle: "solid",
      borderBottomColor: "primaryHover",
      color: "white",
      fontWeight: "bold",
      borderRadius: "default",
      transition: "transform 0.3s ease-in-out",
      "&:hover": {
        transform: "translateY(-1px)"
      }
    },
    elevated: {
      py: 2,
      px: 3,
      cursor: "pointer",
      fontSize: "100%",
      lineHeight: "inherit",
      backgroundColor: "white",
      borderWidth: "1px",
      borderStyle: "solid",
      borderColor: "gray.4",
      color: "text",
      fontWeight: "bold",
      borderRadius: "default",
      boxShadow: "default",
      "&:hover": {
        backgroundColor: "gray.1"
      }
    }
  },
  inputs: {
    shadow: {
      py: 2,
      px: 3,
      fontSize: "100%",
      borderRadius: "default",
      appearance: "none",
      lineHeight: "tight",
      border: "none",
      color: "gray.7",
      boxShadow: "default",
      "&:focus": {
        outline: "none",
        boxShadow: "outline"
      }
    },
    inline: {
      py: 2,
      px: 3,
      fontSize: "100%",
      borderRadius: "default",
      appearance: "none",
      lineHeight: "tight",
      backgroundColor: "gray.2",
      borderWidth: "2px",
      borderStyle: "solid",
      borderColor: "gray.2",
      color: "gray.7",
      "&:focus": {
        outline: "none",
        borderColor: "primary",
        backgroundColor: "white"
      }
    },
    underline: {
      py: 2,
      px: 3,
      fontSize: "100%",
      borderRadius: "0px",
      appearance: "none",
      lineHeight: "tight",
      backgroundColor: "transparent",
      border: "none",
      borderBottomWidth: "2px",
      borderBottomStyle: "solid",
      borderBottomColor: "primary",
      color: "gray.7",
      "&:focus": {
        outline: "none",
        borderColor: "primary",
        backgroundColor: "white"
      }
    }
  },
  transforms: {
    transformOrigin: {
      center: "center",
      top: "top",
      "top-right": "top right",
      right: "right",
      "bottom-right": "bottom right",
      bottom: "bottom",
      "bottom-left": "bottom left",
      left: "left",
      "top-left": "top left"
    },
    translate: {
      "0": "0",
      "1": "0.25rem",
      "2": "0.5rem",
      "3": "0.75rem",
      "4": "1rem",
      "5": "1.25rem",
      "6": "1.5rem",
      "8": "2rem",
      "10": "2.5rem",
      "12": "3rem",
      "16": "4rem",
      "20": "5rem",
      "24": "6rem",
      "32": "8rem",
      "40": "10rem",
      "48": "12rem",
      "56": "14rem",
      "64": "16rem",
      px: "1px",
      "-full": "-100%",
      "-1/2": "-50%",
      "1/2": "50%",
      full: "100%"
    },
    scale: {
      "0": "0",
      "50": ".5",
      "75": ".75",
      "90": ".9",
      "95": ".95",
      "100": "1",
      "105": "1.05",
      "110": "1.1",
      "125": "1.25",
      "150": "1.5"
    },
    rotate: {
      "0": "0",
      "45": "45deg",
      "90": "90deg",
      "180": "180deg",
      "-180": "-180deg",
      "-90": "-90deg",
      "-45": "-45deg"
    },
    skew: {
      "0": "0",
      "3": "3deg",
      "6": "6deg",
      "12": "12deg",
      "-12": "-12deg",
      "-6": "-6deg",
      "-3": "-3deg"
    }
  },
  transitions: {
    property: {
      none: "none",
      all: "all",
      default:
        "background-color, border-color, color, fill, stroke, opacity, box-shadow, transform",
      colors: "background-color, border-color, color, fill, stroke",
      opacity: "opacity",
      shadow: "box-shadow",
      transform: "transform"
    },
    timingFunction: {
      linear: "linear",
      in: "cubic-bezier(0.4, 0, 1, 1)",
      out: "cubic-bezier(0, 0, 0.2, 1)",
      "in-out": "cubic-bezier(0.4, 0, 0.2, 1)"
    },
    duration: {
      "75": "75ms",
      "100": "100ms",
      "150": "150ms",
      "200": "200ms",
      "300": "300ms",
      "500": "500ms",
      "700": "700ms",
      "1000": "1000ms"
    }
  },
  shadows: {
    xs: "0 0 0 1px rgba(0, 0, 0, 0.05)",
    sm: "0 1px 2px 0 rgba(0, 0, 0, 0.05)",
    default: "0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)",
    md: "0 4px 6px 5px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
    lg:
      "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
    xl:
      "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
    "2xl": "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
    inner: "inset 0 2px 4px 0 rgba(0, 0, 0, 0.06)",
    outline: "0 0 0 3px rgba(66, 153, 225, 0.5)",
    none: "none"
  }
};
