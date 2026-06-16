import { getLocalStorage, renderListWithTemplate } from "./utils.mjs";
import { elementCardTemplate } from "./Card.mjs";
import { setLocalStorage } from "./utils.mjs";

export default class ElementList {
    constructor(dataSource, ListElement, compareAdmin, modalAdmin) {
        this.dataSource = dataSource;      // ExternalServices instance
        this.ListElement = ListElement;   // HTML container
        this.compareAdmin = compareAdmin;
        this.modalAdmin = modalAdmin;
        this.elements = [];               // Array that will hold the retrieved data
    }
    
    // Initialization + current state of the interface
    async init() {
        this.elements = await this.dataSource.getPeriodicTableData(); // retrieves data from ExternalServices

        const searchInput = document.querySelector("#search-input");
        const selectElement = document.querySelector("#property-select");
        const groupFilter = document.querySelector("#group-filter");

        // If there are data we load it. Otherwise, we use the defined default values for each input element..
        if (searchInput) searchInput.value = getLocalStorage("search_query") || "";
        if (selectElement) selectElement.value = getLocalStorage("filter_property") || "number";
        if (groupFilter) groupFilter.value = getLocalStorage("filter_group") || "all";

        this.listenAndSort();
        this.listenToClicks();
        this.listenToCompare();
        this.listenToSearch();
        this.listenToGroupFilter();

        if (this.compareAdmin) { 
            const storedCompareList = getLocalStorage("compare_list") || [];

            if (storedCompareList.length > 0) { 
                this.compareAdmin.loadStoredElements(storedCompareList);
            }
        }

        this.updateCatalog();
    }

    // Update the catalog with cards that match the selected criteria
    updateCatalog() { 
        const searchInput = document.querySelector("#search-input");
        const selectElement = document.querySelector("#property-select");
        const groupFilter = document.querySelector("#group-filter");

        const query = searchInput ? searchInput.value.toLowerCase().trim() : "";
        const currentProperty = selectElement ? selectElement.value : "number";
        const selectedGroup = groupFilter ? groupFilter.value.toLowerCase().trim() : "all";

        if (searchInput) setLocalStorage('search_query', searchInput.value);
        if (selectElement) setLocalStorage('filter_property', selectElement.value);
        if (groupFilter) setLocalStorage('filter_group', groupFilter.value);

        const filteredElements = this.elements.filter(element => {
            const nameMatch = element.name.toLowerCase().includes(query); // renders when matches part of the Name
            const symbolMatch = element.symbol.toLowerCase().includes(query); // renders when matches part of the Name
            const numberMatch = element.number.toString() === query;   // only renders if it matches the exact number
            const basicMatches = nameMatch || symbolMatch || numberMatch;

            const elementGroup = element.groupBlock ? element.groupBlock.toLowerCase().trim() : "";
            const groupMatches = (selectedGroup === "all") || (elementGroup === selectedGroup);

            return basicMatches && groupMatches;
        });

        const sortedAndFiltered = this.sortByProperty(filteredElements, currentProperty);

        this.renderList(sortedAndFiltered, currentProperty);
    }


    renderList(elementList, activeProperty = "number") {

        if (this.ListElement) { 
            this.ListElement.innerHTML = "";
        }

        if (!elementList || elementList.length === 0) {
            if (this.ListElement) {
                const noResultsMessage = document.createElement("p");
                noResultsMessage.className = "no-results";
                noResultsMessage.textContent = "No elements found matching your criteria.";

                this.ListElement.appendChild(noResultsMessage);
            }
            return;
        }

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
        if (!selectElement) { 
            return;
        }

        selectElement.addEventListener("change", () => {
            this.updateCatalog();  
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

            card.insertAdjacentElement("afterend", this.modalAdmin.container);

            const atomicNumber = parseInt(card.dataset.number, 10);
            const element = this.elements.find(ele => ele.number === atomicNumber);
            if (!element) { 
                return;
            }

            this.modalAdmin.showLoading(element.name);

            try {
                const wikiData = await this.dataSource.getElementSummary(element.name);

                this.modalAdmin.renderWikiContent(element, wikiData);
            }
            
            catch (error) {
                console.error("Error retrieving data from Wikipedia: ", error);
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

    listenToSearch() { 
        const searchinput = document.querySelector("#search-input");
        if (!searchinput) { 
            return;
        }

        searchinput.addEventListener("input", () => {
            this.updateCatalog();    
        });
    }

    listenToGroupFilter() { 
        const groupFilter = document.querySelector("#group-filter");
        if (!groupFilter) return;

        groupFilter.addEventListener("change", () => {
            this.updateCatalog();
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

    // calculates min and max for a given property in order to create a range which will be used for rendering the cards' bars
    getRange(elements, property) { 

        let min = Infinity;
        let max = -Infinity;

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