export default class ElementDetails {
    constructor(sectionId) {
        this.container = document.getElementById(sectionId);
    }

    showLoading(elementName) {
        if (!this.container) {
            return;
        }

        this.container.className = "wiki-section-active";
        this.container.innerHTML = `
            <div class="modal-loading">
                <p>Retrieving data for <strong>${elementName}</strong> from Wikipedia...</p>
            </div>
        `;
        
    }

    renderWikiContent(element, wikiData) { 
        if (!this.container) { 
            return;
        } 

        this.container.innerHTML = `
            <button class="close-section-btn" id="close-section-btn">&times;</button>
            <div class="modal-header-content">
                <h2>${element.name} (${element.symbol})</h2>
            </div>
            <hr class="modal-divider">
            <div class="modal-text-extract">
                <p>${wikiData.extract}</p>
            </div>
        `;

        this.container.querySelector("#close-section-btn").addEventListener("click", () => this.close());

    }

    close() { 
        if (this.container) { 
            this.container.className = "wiki-section-hidden";
            this.container.innerHTML = "";
        }
    }
    
}