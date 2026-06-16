export function elementCardTemplate(element, activeProperty, percentage) {

    const physicochemicalProperties = ["electronegativity", "radius", "mass", "melting", "boiling"];

    if (physicochemicalProperties.includes(activeProperty)) {
        // if data is not available, set bar width to 0
        const barWidth = element[activeProperty] === "Not available" ? 0 : percentage;
        // object with property units for creating a more accurate label
        const propertyUnits = {
            electronegativity: "",
            radius: " pm",
            mass: " u",
            melting: " K",
            boiling: " K"
        };

        // if there's data cast it to a Float (with 2 decimals), if not save "Not available"
        const displayValue = element[activeProperty] !== "Not available"
            ? parseFloat(element[activeProperty]).toFixed(2)
            : element[activeProperty];
        // Again, check for valid data. If so, take the number value and concatanates to the corresponding unity or use an empty string.
        // Otherwise, stepback to displayValue ("Not available")
        const finalLabel = element[activeProperty] !== "Not available"
            ? `${displayValue}${propertyUnits[activeProperty] || ""}`
            : displayValue;

        // Card for specific properties information (Those containing bars)
        return `
                <div class="element-card minimal-mode clickable-card" data-number="${element.number}" data-element-name="${element.name}">
                    <div class="minimal-row">
                        <h2 class="element-symbol">${element.symbol}</h2>
                        
                        <div class="bar-container">
                            <div class="bar" style="width: ${barWidth}%;"></div>
                            <div class="bar-text-overlay">
                                <span class="prop-value">${finalLabel}</span>
                            </div>                
                        </div>               
                    </div>

                    <div class="card-footer">
                        <span class="element-group">${element.category || element.groupBlock}</span>
                        <button class="compare-btn primary-bg-btn" data-id="${element.number}" aria-label="Compare ${element.name}">+ Compare</button>
                    </div>
                </div>
            `;
    }

    // Card for general information (Sort by: General information or Name)
    return `
            <div class="element-card clickable-card" data-number="${element.number}" data-element-name="${element.name}">
                <div class="card-header">
                    <span class="atomic-number">${element.number}</span>
                    <span class="atomic-mass">${typeof element.mass === 'number' ? element.mass.toFixed(2) : element.mass}</span>
                </div>
                <h2 class="element-symbol">${element.symbol}</h2>
                <p class="element-name">${element.name}</p>
                <span class="element-group">${element.category || element.groupBlock}</span>
                <div class="card-bottom">
                    <span class="element-state">${element.state}</span>
                </div>
                <button class="compare-btn primary-bg-btn" data-id="${element.number}" aria-label="Compare ${element.name}">+ Compare</button>
            </div>
        `;
}