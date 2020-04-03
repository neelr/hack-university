import { useRouter } from "next/router";
import { Flex } from "rebass";
import classPages from "../../components/classPages"
import { useEffect, useState } from "react";
import axios from "axios";

let Classes = props => {
    const router = useRouter();
    console.log(router.query.id)
    const [pageProps, setPageProps] = useState(null)
    let Page = (props) => {
        if (props.page) {
            return classPages[props.page](props.id)
        } else {
            return <br />
        }
    }
    useEffect(() => {
        typeof router.query.id == "string" ? router.query.id = [router.query.id] : null;
        axios.get("/api/users")
            .then(d => {
                console.log()
                if (!(d.data["Leading Classes"] ? d.data["Leading Classes"].includes(router.query.id[0]) : false) && !(d.data["Enrolled Classes"] ? d.data["Enrolled Classes"].includes(router.query.id[0]) : false)) {
                    console.log("here")
                    setPageProps({ id: router.query.id, page: "index" })
                } else if (!(d.data["Enrolled Classes"] ? d.data["Enrolled Classes"].includes(router.query.id[0]) : false)) {
                    setPageProps({ id: router.query.id, page: router.query.id.length == 1 ? "indexAdmin" : `${router.query.id[1]}Admin` })
                } else if (!(d.data["Leading Classes"] ? d.data["Leading Classes"].includes(router.query.id[0]) : false)) {
                    setPageProps({ id: router.query.id, page: router.query.id.length == 1 ? "indexEnroll" : `${router.query.id[1]}Enroll` })
                }
            }).catch(e => window.location.href = "/register")
    }, [])
    return (
        <Flex width="100vw">
            <Page {...pageProps} />
        </Flex>
    );
};

Classes.getInitialProps = ctx => {
    return {}
}


export default Classes