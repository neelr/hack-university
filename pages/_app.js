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
      <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
      <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
      <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
      <link rel="manifest" href="/site.webmanifest" />
      <meta name="google-site-verification" content="lbE7qTArPeKcKU55QWflkokeDJmcHXeEZGO0yXRxhj4" />
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