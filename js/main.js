import ExternalServices from './ExternalServices.mjs';
import ElementList from './ElementList.mjs';
import { loadHeaderFooter } from "./utils.mjs";


async function main() {
    try {
        console.log("Displaying header and footer...");
        await loadHeaderFooter();
        console.log("Starting Data Pipeline...");

        const services = new ExternalServices();
        const catalogContainer = document.querySelector("#catalog-container");
        
        // TODO: if no catalogContainer -> error handling
        // -------------------------------------------

        const elementList = new ElementList(services, catalogContainer);
        // render the list
        await elementList.init();

        console.log("Data Pipeline completed successfully.");

    } catch (error) {
        console.error("Something went wrong:", error);
        // TODO: Implement an error message for the user using utils.mjs alerts
    }
}

main();