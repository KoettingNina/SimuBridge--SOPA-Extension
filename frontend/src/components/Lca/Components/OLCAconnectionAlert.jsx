import React from 'react';
import {
  Alert, AlertIcon, AlertDescription, CloseButton, useDisclosure,
  Flex
} from '@chakra-ui/react';

export default function OLCAconnectionAlert({ countCostDrivers }) {
    const { isOpen, onClose } = useDisclosure({ defaultIsOpen: true });

    if (!isOpen) return null;

    return (
        <Alert status='success' mt={2} display='flex' alignItems='center' justifyContent='space-between'>
            <Flex alignItems='center'>
                <AlertIcon />
                <AlertDescription>{countCostDrivers} abstract cost drivers loaded</AlertDescription>
            </Flex>
            <CloseButton position='relative' onClick={onClose} />
        </Alert>
    );
}
