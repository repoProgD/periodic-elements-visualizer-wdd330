export default class ElementList {
    constructor(dataSource, ListElement) {
        this.dataSource = dataSource;      // ExternalServices instance
        this.ListElement = ListElement;   // HTML container
        this.elements = [];               // Array that will hold the retrieved data
    }

    async init() {
        this.elements = await this.dataSource.getPeriodicTableData();
        this.renderList(this.elements);
        this.listenAndSort();
    }

    renderList(elementList) {
        // clear the list container before rendering the data
        this.ListElement.innerHTML = "";

        elementList.forEach(element => {
            const card = this.elementCardTemplate(element);
            this.ListElement.insertAdjacentHTML('beforeend', card);
        });
    }

    // Event listener for the dropdown menu
    listenAndSort() {
        const selectElement = document.querySelector("#property-select");

        selectElement.addEventListener("change", (event) => {
            const selectedProperty = event.target.value;

            console.log(`Sorting elements by: ${selectedProperty}`);

            const sortedElements = this.sortByProperty(this.elements, selectedProperty);
            this.renderList(sortedElements);
        });
    }

    sortByProperty(elementsArray, property) {
        return [...elementsArray].sort((a, b) => {     // [...elementsArray] creates a new array of references to avoid mutating the original data (similar to an array of pointers in C)
            let valA = a[property];
            let valB = b[property];

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

    elementCardTemplate(element) {
        return `
            <div class="element-card" data-number="${element.number}">
                <div class="card-header">
                    <p> --------------------------------</p>
                    <span class="atomic-number">${element.number}</span>
                    <span class="atomic-mass">${element.mass}</span>
                </div>
                <h2 class="element-symbol">${element.symbol}</h2>
                <p class="element-name">${element.name}</p>
                <div class="card-bottom">
                    <p class="element-name">${element.electronegativity}</p>
                    <span class="element-state">${element.state}</span>
                    <p> --------------------------------</p>
                </div>
            </div>
        `;
    }


}