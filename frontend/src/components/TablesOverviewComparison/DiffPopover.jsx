import { Button, Popover, PopoverArrow, PopoverBody, PopoverCloseButton, PopoverContent, PopoverTrigger, Portal } from "@chakra-ui/react";

export default function DiffPopover({ buttonLabel, body }) {
    return <Popover>
        <PopoverTrigger>
            <Button>  {buttonLabel}</Button>
        </PopoverTrigger>
        <Portal>
            <PopoverContent bg='#dce5e6' zIndex={4}>
                <PopoverArrow />
                <PopoverCloseButton />
                <PopoverBody>
                    {body}
                </PopoverBody>
            </PopoverContent>
        </Portal>
    </Popover>
}