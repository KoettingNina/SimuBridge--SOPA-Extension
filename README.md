# SimuBridge-OLCA <br><sub>![CI](https://github.com/INSM-TUM/SimuBridge--Main/actions/workflows/CI.yml/badge.svg)</sub>

## :information_source: About
This repository is a supplementary branch to the main [SimuBridge](https://github.com/INSM-TUM/SimuBridge) project. It contains the source code for the web application that is the heart piece of the project. Please refer to the [SimuBridge project root repository](https://github.com/INSM-TUM/SimuBridge) for overall project documentation.

This project focuses on **sustainability related information on SimuBridge**. The extensions made allows users to assign abstract environmental cost drivers to specific activities, and further refine these into concrete cost drivers for accurate impact assessment. The platform facilitates a deeper understanding of the environmental implications of different operational choices, providing valuable insights for sustainable decision-making. 
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
Download the demo data we provide at `./demo/LCA/demo_dataset.zolca` and import into openLCA via `File > Import > File > demo_dataset.zolca`. Open the demo database by double-clicking on it. Start the IPC server of openLCA by clicking `Tools > Developer tools > IPC Server`, entering port `8081` and clicking `run`. Open SimuBridge in the browser at `http://localhost:3000` and select the `OpenLCA Integration` menu entry. Click `Fetch Impact Methods`, select an impact method such as `ReCiPe 2016 Endpoint (H)` and click `Calculate`. Proceed to configure the simulation scenario and environmental cost variants. The `demo` folder of this repository provides three sample process models and event logs you can use to test out the main functionalities of the SOPA-SimuBridge integration, as well as a screencast.


## 📦️ Added & Extended UI Pages
This extension adds and extends multiple pages to the basic SimuBridge UI.

### OpenLCA Integration (added)
![Image](https://github.com/INSM-TUM-Teaching/SImuBridge-OLCA/assets/92756562/ea167f10-663d-4ea9-8df3-7ece260c61c7)
Configure LCA with host and port for a flexible data fetching. Note that the availability of LCA data and impact calculation methods is determined by the database loaded into openLCA.

### Model-based Parameters (extended)
![Image](https://github.com/INSM-TUM-Teaching/SImuBridge-OLCA/assets/92756562/8f63b277-1926-44e3-b5f0-0545cf485d22)
Assign abstract cost drivers to activities within your process model in model based parameters panel.

### LCA Variants (added)
![Image](https://github.com/INSM-TUM-Teaching/SImuBridge-OLCA/assets/92756562/c4c45554-4587-4fc5-8bcc-b1eb9a0ce834)
Use this panel to map abstract cost drivers to concrete cost drivers from dropdown menus.
Configure the frequency of cost variants to simulate the process instances and calculate the overall environmental impact.

### Output Visualization (added)
Shows a comparison of the environmental impact score of previously run scenarios.


##  Code Structure 
This repository adds the following components and logic classes to the base SimuBridge project:

```
Lca/  
├── Components/  
│   ├── BasicSpinner.jsx  
│   ├── FormattedConcreteDriver.jsx  
│   ├── LcaIntegration.jsx  
│   ├── LcaVariantsConfiguration.jsx  
│   ├── OlcaConnectionAlert.jsx  
│   └── VariantEditor.jsx  
└── Logic/  
    ├── LcaDataManager.js  
    ├── LcaIntegrationUtils.js  
    └── OpenLcaConnector.js
```
  
### Components
- `BasicSpinner.jsx`: Auxiliary React component for the loading spinner.
- `FormattedConcreteDriver.jsx`: Component to display formatted data of concrete cost drivers.
- `LcaIntegration.jsx`: Interface for configuring external LCA data integration.
- `LcaVariantsConfiguration.jsx`: Manages the mapping of abstract and concrete cost drivers for variants.
- `VariantEditor.jsx`: UI component for creating or editing variants.
- `OlcaConnectionAlert.jsx`: Notifies about the OpenLCA connection status.

### Logic
- `LcaDataManager.js`: Manages app data storage.
- `LcaIntegrationUtils.js`: Handles requests to external LCA systems.
- `OpenLcaConnector.js`: Specialized connector for OpenLCA software integration.



