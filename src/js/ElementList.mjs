import { renderListWithTemplate } from "./utils.mjs";
import { elementCardTemplate } from "./Card.mjs";

export default class ElementList {
    constructor(dataSource, ListElement, compareAdmin) {
        this.dataSource = dataSource;      // ExternalServices instance
        this.ListElement = ListElement;   // HTML container
        this.compareAdmin = compareAdmin;
        this.elements = [];               // Array that will hold the retrieved data
    }

    async init() {
        this.elements = await this.dataSource.getPeriodicTableData();
        //this.summary = await this.dataSource.getElementSummary();
        this.renderList(this.elements, "number");  // number as initial property
        this.listenAndSort();
        this.listenToClicks();
        this.listenToCompare();
    }


    renderList(elementList, activeProperty = "number") {
        // Get min and max values for the active property
        const range = this.getRange(elementList, activeProperty);
        
        // Map the elements and get an HTML string for each one of them
        const htmlStrings = elementList.map(element => {
            let percentage = 0;
            const value = element[activeProperty];

            // If the value si valid, calculate the percentage for the bar
            if (value !== "Not available" && typeof value === "number" && !Number.isNaN(value)) {
                const normalized = this.normalizePropertyValues(value, range.min, range.max);
                percentage = normalized * 100;
            }

            // Return the template containing its particular HTML string
            return elementCardTemplate(element, activeProperty, percentage);
        });

        // Clean the container
        this.ListElement.innerHTML = "";
        // Insert the new HTML strings
        this.ListElement.insertAdjacentHTML("beforeend", htmlStrings.join(""));
    }


    // Event listener for the dropdown menu
    listenAndSort() {
        const selectElement = document.querySelector("#property-select");

        selectElement.addEventListener("change", (event) => {
            const selectedProperty = event.target.value;

            const sortedElements = this.sortByProperty(this.elements, selectedProperty);
            this.renderList(sortedElements, selectedProperty);
            
        });
    }

    // Listener for clicking on the cards
    listenToClicks() {

        // point to the catalog in the HTML
        const catalogContainer = document.querySelector("#catalog-container");

        if (!catalogContainer) {
            console.error("ERROR: #catalog-container not found.");
            return;
        }

        catalogContainer.addEventListener("click", async (event) => {

            // prevent triggering the listen event if click is on the compare button 
            if (event.target.closest(".compare-btn")) { 
                return;
            }

            const card = event.target.closest(".clickable-card");
            if (!card) {
                return;
            }

            const elementName = card.dataset.elementName;

            document.getElementById("test-text").textContent = `Loading text of ${elementName}...`;
            document.getElementById("test-image-place").textContent = "Loading Image...";

            try {
                const wikiData = await this.dataSource.getElementSummary(elementName);

                document.getElementById("test-text").textContent = wikiData.extract;

                if (wikiData.image) {
                    document.getElementById("test-image-place").innerHTML = `<img src="${wikiData.image}" style="max-width: 200px; height: auto;" />`;
                } else {
                    document.getElementById("test-image-place").textContent = "This element has not an image on Wikipedia.";
                }
            } catch (error) {
                console.error("Error retrieving data from Wikipedia:", error);
            }
        });
    }

    listenToCompare() { 
        this.ListElement.addEventListener("click", (event) => {
            const compareBtn = event.target.closest(".compare-btn");
            if (!compareBtn) {
                return
            };

            const card = compareBtn.closest(".clickable-card");
            const atomicNumber = parseInt(card.dataset.number);

            const selectedElement = this.elements.find(ele => ele.number === atomicNumber);

            if (selectedElement && this.compareAdmin) {
                this.compareAdmin.toggleElement(selectedElement);
            }
        });
    }

    sortByProperty(elementsArray, property) {
        return [...elementsArray].sort((a, b) => {     // [...elementsArray] creates a new array of references to avoid mutating the original data (similar to an array of pointers in C)
            
            let valA = a[property];
            let valB = b[property];
            
            if (valA === "Not available" && valB === "Not available") return 0;
            
            // Send special cases ("Not available") to the the end of the list.
            if (valA === "Not available") return 1;
            if (valB === "Not available") return -1;

            // Use localeCompare for string properties
            if (typeof valA === "string") {            // validate data type
                return valA.localeCompare(valB);
            }

            // For numeric properties, sort in ascending order using direct subtraction
            return valA - valB;
        });
    }

    getRange(elements, property) { 
        // TODO
        let min = elements[0][property]; // NOT COMPLETELY ROBUST ---> Should find another way of doing it
        let max = elements[0][property]; // NOT COMPLETELY ROBUST ----> Should find another way of doing it

        elements.forEach(element => {
            const value = element[property];

            if (value === "Not available" || Number.isNaN(value)) { 
                return;
            }

            if (value < min) { 
                min = value;
            }

            if (value > max) { 
                max = value;
            }
  
        });

        return { min, max };
    }

    normalizePropertyValues(value, min, max) { 
        if (max === min) { 
            return 0
        }
        
        return (value - min) / (max - min);
    }
        


}