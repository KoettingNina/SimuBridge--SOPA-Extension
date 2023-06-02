import {React, useEffect} from 'react'
import { Box, Card, CardBody, Table, TableContainer, Thead,  Tbody, Tr, Th, Td, Flex, Stack, Heading} from '@chakra-ui/react'
import ResourceNavigation from '../ResourceNavigation';
function ResourceOverview({SideBarContentSetterButton, setCurrent, getData}){

    // Run once when the component mounts to set currentPage
    //setCurrent is important for displaying the right editorsidebar on the right side
    useEffect(() => { 
        setCurrent("Resource Parameters")
    },[setCurrent])

    // select ressources that are assigned to roles and ressources that are not assigned to roles
    var assignedRessources = getData().getCurrentScenario().resourceParameters.roles.map(x => x.resources).flat().map(y => y.id)
    var allRessources = getData().getCurrentScenario().resourceParameters.resources.map(x => x.id)
    let unassignedRessources = allRessources.filter(ressource => !assignedRessources.includes(ressource));


    return(
        <>
        <Box h="93vh" overflowY="auto" p="5" >
        <Stack gap="3">

        {/* Display the Navigation for ressources and set curent Tab to overview */}
        <ResourceNavigation currentTab="overview"/>

            <Card bg="white">
                <CardBody>
                <Heading size="md">Assigned resources</Heading>
                    <TableContainer overscrollx="scroll" w="100%">
                        <Table variant='simple'>
                            <Thead>
                                <Tr>
                                    <Th>Role</Th>
                                    <Th>Assigned ressources</Th>
                                </Tr>
                            </Thead>
                            <Tbody> 
                            
                                {getData().getCurrentScenario().resourceParameters.roles.map((element) => {
                                    return <><Tr key={element.id}>
                                        <Td><Flex><SideBarContentSetterButton type='role' id={element.id} variant='outline'/></Flex></Td>
                                        <Td><Flex gap="4" flexWrap="wrap">
                                            {element.resources.map((resource) => <SideBarContentSetterButton type='resource' id={resource.id}/>)}
                                        </Flex></Td>
                                    </Tr></>
                                })} 
                                
                           
                            </Tbody>
                        </Table>
                    </TableContainer>
                </CardBody>
            </Card>

            <Card bg="white">
                <CardBody>
                <Heading size="md" mb="5">Unassigned resources</Heading>
                    <Flex alignItems="center"  gap="4" flexWrap="wrap">
                        {
                        unassignedRessources.map((id) => {
                        return <SideBarContentSetterButton type='resource' id={id}/>
                    })}
                    </Flex> 
                </CardBody>
            </Card>
            </Stack>
            </Box>
            </>

            )
}

export default ResourceOverview;