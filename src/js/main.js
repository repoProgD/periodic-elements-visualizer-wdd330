import ExternalServices from './ExternalServices.mjs';
import ElementList from './ElementList.mjs';
import { loadHeaderFooter, alertMessage } from "./utils.mjs";
import ElementCompare from "./ElementCompare.mjs";
import ElementDetails from "./ElementDetails.mjs";


async function main() {
    try {
        await loadHeaderFooter();

        const services = new ExternalServices();
        const catalogContainer = document.querySelector("#catalog-container");
        
        // TODO: if no catalogContainer -> error handling  --> Implemented on ElementList.ListenToClicks() method
        const compareContainer = document.querySelector("#compare-section");
        const compareAdmin = new ElementCompare(compareContainer);

        const modalAdmin = new ElementDetails("wiki-section");

        const elementList = new ElementList(services, catalogContainer, compareAdmin, modalAdmin);
        // render the list
        await elementList.init();

        const range = elementList.getRange(elementList.elements, "electronegativity");

    } catch (error) {
        alertMessage("Sorry, the catalog is not available at the moment. Please, try again later.")
    }


}

main();