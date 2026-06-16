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

//retrieve data from localstorage
export function getLocalStorage(key) {
    return JSON.parse(localStorage.getItem(key));
}

// save data to local storage
export function setLocalStorage(key, data) {
    localStorage.setItem(key, JSON.stringify(data));
}


export function alertMessage(message, scroll = true) {
    const main = document.querySelector("main");
    if (!main) return;

    const alert = document.createElement("div");
    alert.classList.add("alert");

    alert.innerHTML = `<span>${message}</span><span class="alert-close" style="cursor: pointer; font-weight: bold; padding: 0 10px;">X</span>`;

    alert.addEventListener("click", function (e) {
        if (e.target.classList.contains("alert-close") || e.target.innerText === 'X') {
            main.removeChild(this);
        }
    });

    // Display at the top of the main
    main.prepend(alert);

    if (scroll) {
        window.scrollTo(0, 0);
    }
}