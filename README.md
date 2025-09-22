# SimuBridge-OLCA <br><sub>![CI](https://github.com/INSM-TUM/SimuBridge--Main/actions/workflows/CI.yml/badge.svg)</sub>

## :information_source: About
This repository is a supplementary branch to the main [SimuBridge](https://github.com/INSM-TUM/SimuBridge) project. It contains the source code for the web application that is the heart piece of the project. Please refer to the [SimuBridge project root repository](https://github.com/INSM-TUM/SimuBridge) for overall project documentation.

This project focuses on **sustainability related information on SimuBridge**. The extensions made allows users to assign probabilistic distributions to cost driver concretizations. The platform facilitates a deeper understanding of the environmental implications of different operational choices, providing valuable insights for sustainable decision-making. 
To this end, it communicates with the sustainability database software [openLCA](https://www.openlca.org/) and the business process simulation engine [Scylla](https://github.com/bptlab/scylla) using a tailored [plugin](https://github.com/INSM-TUM/Scylla-Plugin--SOPA).

Have a look at the [demo](./demo) folder for a little demonstration how the extension works.

## Quick Start
The fastest way to setup the system is to use the provided `docker-compose` file provided with this repository - no git checkout needed. As a prerequisite, Docker needs to be installed
To do so, first download  the <a href="./docker-compose.yml" download> docker-compose.yml</a>.
Then run the following command in the folder where you downloaded the compose file:
``` posh
docker-compose -f docker-compose.yml up
```
This will set-up SimuBridge as well as Scylla (including the necessary plugins) and the Simod simulation model discovery tool.


#### OpenLCA & Example Data Setup
To install openLCA, go to https://www.openlca.org/download/ and download and run the respective installer.
Download the demo data we provide at `./demo/LCA/demo_dataset.zolca` and import into openLCA via `File > Import > File > demo_dataset.zolca`. Open the demo database by double-clicking on it. Start the IPC server of openLCA by clicking `Tools > Developer tools > IPC Server`, entering port `8081` and clicking `run`. Open SimuBridge in the browser at `http://localhost:3000` and select the `OpenLCA Integration` menu entry. Click `Fetch Impact Methods`, select an impact method such as `ReCiPe 2016 Endpoint (H)` and click `Calculate`. Proceed to configure the simulation scenario and environmental cost variants. The `demo` folder of this repository provides three sample process models and event logs you can use to test out the main functionalities of the SOPA-SimuBridge integration.


## 📦️ Added & Extended UI Pages
This extension adds and extends multiple pages to the basic SimuBridge UI.

### OpenLCA Integration (modified)
![Image](https://github.com/INSM-TUM-Teaching/SImuBridge-OLCA/assets/92756562/ea167f10-663d-4ea9-8df3-7ece260c61c7)
This step only fetches the impact method and normalization set. The cost computation is taken out in this step. 


### LCA Variant Configuration (added)
![Image](https://github.com/INSM-TUM-Teaching/SImuBridge-OLCA/assets/92756562/c4c45554-4587-4fc5-8bcc-b1eb9a0ce834)
- **Parameter Configuration**: Configure distribution parameters for each concrete driver:
- **Information Tooltips**: Access detailed descriptions of concrete cost drivers via info icons


## 📊 Supported Distribution Types
The system supports various statistical distributions for parameterizing concrete cost drivers:

- **Constant**: Fixed value distribution with configurable target unit (e.g., kg*km, t*km)
- **Normal**: Gaussian distribution with mean and variance parameters
- **Exponential**: Exponential distribution with mean parameter
- **Uniform**: Uniform distribution with lower and upper bounds
- **Triangular**: Triangular distribution with lower, peak, and upper bounds
- **Erlang**: Erlang distribution with order and mean parameters
- **Binomial**: Binomial distribution with probability and amount parameters
- **Arbitrary Finite Probability Distribution**: Custom probability distributions

Each distribution type includes appropriate parameter validation and supports different target units for environmental impact calculations.



