import ExternalServices from './ExternalServices.mjs';
import ElementList from './ElementList.mjs';
import { loadHeaderFooter } from "./utils.mjs";
import ElementCompare from "./ElementCompare.mjs";


async function main() {
    try {
        await loadHeaderFooter();

        const services = new ExternalServices();
        const catalogContainer = document.querySelector("#catalog-container");
        
        // TODO: if no catalogContainer -> error handling
        const compareContainer = document.querySelector("#compare-section");
        const compareAdmin = new ElementCompare(compareContainer);

        const elementList = new ElementList(services, catalogContainer, compareAdmin);
        // render the list
        await elementList.init();

        const range = elementList.getRange(elementList.elements, "electronegativity");

    } catch (error) {
        console.error("Something went wrong:", error);
        // TODO: Implement an error message for the user using utils.mjs alerts
    }


}

main();