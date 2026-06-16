/* This module is in charge of: 
creating an array to store the selected elements
couting the number of elements in that array
setting a maximun of elements that can be compared
preventing the user to keep adding elements to the array once it has reached the maximun
Creating an HTML table where will inject the elements data
*/
import { setLocalStorage } from "./utils.mjs";

export default class ElementCompare { 
    constructor(compareElement) { 
        this.compareElement = compareElement;
        this.compareList = [];
    }

    toggleElement(element) { 
        const index = this.compareList.findIndex(ele => ele.number === element.number);

        if (index !== -1) {
            this.compareList.splice(index, 1);
        
        }
        
        else { 
            if (this.compareList.length >= 2) { 
                alert("Only two elements can be compared at the same time.");
                return
            }

            this.compareList.push(element);
        }
        // Store the state of the compareList array everytime it changes
        setLocalStorage("compare_list", this.compareList);

        this.render();
    }

    loadStoredElements(storedList) { 
        this.compareList = storedList;
        this.render();
    }

    render() { 
        if (this.compareList.length === 0) { 
            this.compareElement.style.display = "none";
            this.compareElement.innerHTML = "";
            return;
        }

        this.compareElement.style.display = "block";

        this.compareElement.innerHTML = ElementCompare.buildTableTemplate(this.compareList);

        document.getElementById("clear-compare-btn").addEventListener("click", () => {
            this.compareList = [];

            setLocalStorage("compare_list", this.compareList);
            
            this.render();
        });
    }

    static buildTableTemplate(list) { 
        return `
            <div class="compare-card">
                <h2>Elements Comparison</h2>
                <table class="compare-table">
                    <thead>
                        <tr>
                            <th></th>
                            ${list.map(el => `<th>${el.name}</th>`).join("")}
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td><strong>Atomic Number</strong></td>
                            ${list.map(el => `<td>${el.number}</td>`).join("")}
                        </tr>
                        <tr>
                            <td><strong>Atomic Mass</strong></td>
                            ${list.map(el => `<td>${typeof el.mass === 'number' ? el.mass.toFixed(2) : el.mass} u</td>`).join("")}
                        </tr>
                        <tr>
                            <td><strong>Atomic Radius</strong></td>
                            ${list.map(el => `<td>${typeof el.radius === 'number' ? el.radius.toFixed(2) : el.radius}</td>`).join("")}
                        </tr>
                        <tr>
                            <td><strong>Electronegativity</strong></td>
                            ${list.map(el => `<td>${el.electronegativity}</td>`).join("")}
                        </tr>

                        <tr>
                            <td><strong>Melting Point</strong></td>
                            ${list.map(el => `<td>${typeof el.melting === 'number' ? el.melting.toFixed(2) : el.melting} K</td>`).join("")}
                        </tr>

                        <tr>
                            <td><strong>Boiling Point</strong></td>
                            ${list.map(el => `<td>${typeof el.boiling === 'number' ? el.boiling.toFixed(2) : el.boiling} K</td>`).join("")}
                        </tr>
                        
                        <tr>
                            <td><strong>Standard State</strong></td>
                            ${list.map(el => `<td>${el.state || 'N/A'}</td>`).join("")}
                        </tr>
                    </tbody>
                </table>
                <button id="clear-compare-btn" class="clear-btn primary-bg-btn">Reset Comparison</button>
            </div>
        `;
    }
    
}

