import { Box, Text, Tooltip } from "@chakra-ui/react";
import { FiInfo } from 'react-icons/fi';

const FormattedConcreteDriver = ({ concreteCostDriver }) => {
  let number = concreteCostDriver.cost;
  const [coefficient, exponent] = number.toExponential(2).split('e'); // Split into coefficient and exponent
  const formattedNumber = `${coefficient} × 10`;

  return (
    <Box>
     
      <Text as="span">{concreteCostDriver.name}</Text>
      {concreteCostDriver.targetUnit?.name && (
        <Text as="span" color="gray.500" ml={1}>
          ({concreteCostDriver.targetUnit.name})
        </Text>
      )}
      {concreteCostDriver.description && (
        <Tooltip label={concreteCostDriver.description} placement="top" hasArrow>
          <Box as="span" ml={2} display="inline-block">
            <FiInfo />
          </Box>
        </Tooltip>
      )}
      {number !== 0 && (
        <>
          <Text as="span" ml={2}>: {formattedNumber}</Text>
          <Text as="sup" fontWeight={"bold"}>{parseInt(exponent, 10)}</Text>
        </>
      )}
    </Box>
  );
};

export default FormattedConcreteDriver;