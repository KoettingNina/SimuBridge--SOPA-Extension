import { Box, Text } from "@chakra-ui/react";

const FormattedConcreteDriver = ({ concreteCostDriver }) => {
  let number = concreteCostDriver.cost;
  const [coefficient, exponent] = number.toExponential(2).split('e'); // Split into coefficient and exponent
  const formattedNumber = `${coefficient} × 10`;

  return (
    <Box>
      <Text as="span">{concreteCostDriver.name}: </Text>
      <Text as="span">{formattedNumber}</Text>
      <Text as="sup" fontWeight={"bold"}>{parseInt(exponent, 10)}</Text>
    </Box>
  );
};

export default FormattedConcreteDriver;