import { Card, Progress } from "@chakra-ui/react";

export default function RunProgressIndicationBar({ started, finished, errored }) {
    return <>
        {started &&
            <Card bg="white" p="5" >
                <Progress isIndeterminate isAnimated hasStripe value={100} colorScheme="green" />
            </Card>}

        {finished &&
            <Card bg="white" p="5" >
                <Progress hasStripe value={100} colorScheme={errored ? "red" : (window.canceled ? "gray" : "green")} />
            </Card>}
    </>
}