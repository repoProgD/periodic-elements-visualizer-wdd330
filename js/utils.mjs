export function renderListWithTemplate(templateFn, parentElement, list, position = "afterbegin", clear = false) {
  if (clear) {
    parentElement.innerHTML = "";
  }

  const htmlStrings = list.map(templateFn);

  parentElement.insertAdjacentHTML(position, htmlStrings.join(""));
}

export function renderWithTemplate(template, parentElement, data, callback) {
    
    parentElement.innerHTML = template;

    if (callback) {
        callback(data);
    }
   
}

export async function loadTemplate(path) {
    const response = await fetch(path);
    const template = await response.text();
    return template;
}

export async function loadHeaderFooter() { 
    const headerTemplate = await loadTemplate("../partials/header.html");   
    const headerElement = document.querySelector("#dynamic-header");

    const footerTemplate = await loadTemplate("../partials/footer.html");
    const footerElement = document.querySelector("#dynamic-footer");

    renderWithTemplate(headerTemplate, headerElement);
    renderWithTemplate(footerTemplate, footerElement);
}
