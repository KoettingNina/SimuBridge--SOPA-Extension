import React from 'react';
import { Flex, Spinner } from '@chakra-ui/react';

const BasicSpinner = () => {
    return (
        <Flex
            height="100vh"
            justifyContent="center"
            alignItems="center"
        >
            <Spinner size='xl' />
        </Flex>
    );
}

export default BasicSpinner;