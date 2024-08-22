import { BarChart } from '@mui/x-charts/BarChart';
import { createTheme, ThemeProvider } from "@mui/material";
import { Box } from '@chakra-ui/react';
import { mangoFusionPalette } from '@mui/x-charts';


const defaultChartSetting = {
    width: 1000,
    height: 800,
    margin: {
        left: 250,
        right: 80,
        top: 80,
        bottom: 80,
    },
    colors: mangoFusionPalette
};



const defaultTheme = createTheme(); // TODO: Needing to use this is a workaround, will throw "Uncaught TypeError: theme.palette is undefined" otherwise. Also see https://stackoverflow.com/questions/71104064/uncaught-typeerror-theme-palette-common-is-undefined

function Multibarchart({ chartData, chartSetting }) {
    console.log(chartData)
    return (
        <ThemeProvider theme={defaultTheme} style={{ "text-align": "center" }}>
            <Box>
                {chartData && <BarChart
                    height="100%"
                    width="100%"
                    {...chartData}
                    {...defaultChartSetting}
                    {...chartSetting}
                />}
            </Box>
        </ThemeProvider>
    );
}

export default Multibarchart;
