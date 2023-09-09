import { Button, Card, CardBody, CardHeader, Flex, Heading, ListItem, Textarea, UnorderedList } from "@chakra-ui/react";
import { downloadFile } from "../util/Storage";

export default function ToolRunOutputCard({projectName, response, toolName, processName, filePrefix}) {


    return <Card bg="white">
        <CardHeader>
            <Heading size='md'> Last {toolName} Run Output {response.finished && `[${new Date(response.finished).toLocaleString()}]`}</Heading>
        </CardHeader>
        <CardBody>
            <Flex flexDirection='column' gap='5'>
                {!response.message && !response.files && !response.finished && <>
                    No {processName} runs in this session yet.
                </>}
                {response.message && <>
                    <Heading size='ms' mt={-5}>Console Output:</Heading>
                    <Textarea isDisabled value={response.message} />
                </>}
                {response.files && <>
                    <Heading size='ms'>Returned Files: (Click on the name of the file to download it)</Heading>
                    <UnorderedList>
                    {response.files.map(fileName => (<ListItem>
                        <Button onClick={() => downloadFile(projectName, (filePrefix ? filePrefix + '/' : '') + fileName)} variant="link">{fileName}</Button>
                    </ListItem>)) }
                    </UnorderedList>
                </>}
            </Flex>
        </CardBody>
    </Card>      
}