async function convertToJson(res) {
    const jsonResponse = await res.json(); // Read answer of the server as JSON

    if (res.ok) {
        return jsonResponse;
    } else {
        // If the response is not ok, throw a custom error with the JSON response as the msg
        throw {
            name: "servicesError",
            message: jsonResponse
        };;
    }
}


export default class ExternalServices {
    constructor() {
        this.pugChemURL = "https://pubchem.ncbi.nlm.nih.gov/rest/pug/periodictable/JSON";
        this.wikiURL = "https://en.wikipedia.org/w/api.php?action=query&format=json&origin=*&prop=extracts&exintro=&explaintext=&titles=";

    }
    // Retrieve data from PUGREST(pubchem) and WIKIMEDIA(wikipedia)
    // PubChem
    async getPeriodicTableData() {
        const response = await fetch(this.pugChemURL);
        const data = await convertToJson(response);
        return this.processPugData(data);
    }
   

    // Data processor. Extracts data from the JSON and organizes it into a more friendly format.
    processPugData(data) {
        // extract the columns and rows from the json
        const columns = data.Table.Columns.Column;
        const rows = data.Table.Row;

        // organize the data into a JS object with the column names as keys and the corresponding data as values
        const indices = {
            number: columns.indexOf("AtomicNumber"),
            symbol: columns.indexOf("Symbol"),
            name: columns.indexOf("Name"),
            radius: columns.indexOf("AtomicRadius"),
            mass: columns.indexOf("AtomicMass"),
            electronegativity: columns.indexOf("Electronegativity"),
            melting: columns.indexOf("MeltingPoint"),
            boiling: columns.indexOf("BoilingPoint"),
            groupBlock: columns.indexOf("GroupBlock"),
            period: columns.indexOf("Period"),
            state: columns.indexOf("StandardState"),
        };

        // map throuth the rows, get the data we need for the interface, and return it as a curated object.
        const curatedData = rows.map(row => {
            const cells = row.Cell;

            return {
                number: parseInt(cells[indices.number], 10),
                symbol: cells[indices.symbol],
                name: cells[indices.name],
                radius: parseFloat(cells[indices.radius]) ? parseFloat(cells[indices.radius]) : "Not available",
                mass: parseFloat(cells[indices.mass]) ? parseFloat(cells[indices.mass]) : "Not available",
                electronegativity: parseFloat(cells[indices.electronegativity]) ? parseFloat(cells[indices.electronegativity]) : "Not available",
                melting: parseFloat(cells[indices.melting]) ? parseFloat(cells[indices.melting]) : "Not available",
                boiling: parseFloat(cells[indices.boiling]) ? parseFloat(cells[indices.boiling]) : "Not available",
                config: cells[indices.config],
                groupBlock: cells[indices.groupBlock],
                period: parseInt(cells[indices.period], 10),
                state: cells[indices.state]
            }
        })

        return curatedData;
    }

    // Wikipedia Data processor.
    async getElementSummary(elementName) {
        const options = {
            headers: {
                'User-Agent': 'Chem-Visualizer (dledesma@byupathway.edu) WDD330-Project'
            }
        };
        const response = await fetch(`${this.wikiURL}${elementName}`, options);
        const data = await convertToJson(response);
        return this.processWikiData(data);
    }

    processWikiData(data) { 
        try { 
            const page = Object.values(data.query.pages)[0];

            let imageUrl = null;
            if (page.thumbnail) { 
                imageUrl = page.thumbnail.source;
            }
            else if (page.original) { 
                imageUrl = page.original.source;
            }

            return {
                extract: page.extract || "No summary available.",
                image: imageUrl
            };
        }
        catch (error) {
            console.error("Error processing Wikipedia data:", error);
            return {
                extract: "An error occured",
                image: null
            }
        }
    }
}