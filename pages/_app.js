import { ThemeProvider } from "theme-ui";
import theme from "../components/theme";
import Nav from "../components/nav";
import Footer from "../components/footer";
import { Flex } from "rebass";
import Head from "next/head"

export default ({ Component, props }) => (
  <ThemeProvider theme={theme}>
    <Head>
      <title>Hack University!</title>
    </Head>
    <Flex flexDirection="column" minHeight="100vh">
      <Nav />
      <Flex mb="auto">
        <Component {...props} />
      </Flex>
      <Footer />
    </Flex>
  </ThemeProvider>
);