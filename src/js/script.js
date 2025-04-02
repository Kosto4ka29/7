/* global dataSource */
/* global utils */


'use strict';

// Definiowanie selektorów
const select = {
  containerOf: {
    menu: '#product-list', // kontener dla listy produktów
  },
  menuProduct: {
    imageWrapper: '.product__images',

  },
};



// Kompilacja szablonu Handlebars
const templates = {
  menuProduct: Handlebars.compile(document.querySelector('#template-menu-product').innerHTML),
};

// Klasa dla produktu
class Product {
  constructor(id, data) {
    const thisProduct = this;

    // Przypisanie właściwości
    thisProduct.id = id;
    thisProduct.data = data;
    thisProduct.price = data.price; // Cena początkowa
    thisProduct.basePrice = data.price; // Cena bazowa
    thisProduct.optionsPrice = 0; // Cena dodatkowa (z opcji)

    // Wywołanie renderInMenu po stworzeniu instancji produktu
    thisProduct.renderInMenu();
    thisProduct.getElements();
    thisProduct.initAccordion();
    thisProduct.initOptions(); // Inicjalizacja opcji (checkbox, radio)
    thisProduct.updatePrice(); // Inicjalizacja ceny
  }

  getElements(){
    const thisProduct = this;

    thisProduct.imageWrapper = thisProduct.element.querySelector(select.menuProduct.imageWrapper);
  }

  initAccordion() {
    const thisProduct = this;
  
    const clickableTrigger = thisProduct.element.querySelector('.product__header');
  
    clickableTrigger.addEventListener('click', function () {
      const isActive = thisProduct.element.classList.contains('active');
  
      // Zwiń wszystkie produkty
      const allProducts = document.querySelectorAll('.product');
      for (let product of allProducts) {
        product.classList.remove('active');
      }
  
      // Jeśli wcześniej nie był aktywny — otwórz go znowu
      if (!isActive) {
        thisProduct.element.classList.add('active');
      }
    });
  }

  // Renderowanie produktu w menu
  renderInMenu() {
    const thisProduct = this;
  
    const generatedHTML = templates.menuProduct(thisProduct.data);
    console.log('HTML wygenerowany przez Handlebars:', generatedHTML);
  
    thisProduct.element = utils.createDOMFromHTML(generatedHTML);
    console.log('Element DOM:', thisProduct.element);
  
    const menuContainer = document.querySelector(select.containerOf.menu);
    menuContainer.appendChild(thisProduct.element);
  }
  

  // Inicjalizacja opcji dla produktów (checkbox, radio, select)
  initOptions() {
    const thisProduct = this;

    // Znalezienie wszystkich opcji (checkbox, radio, select) w produkcie
    const options = thisProduct.element.querySelectorAll('.product__params input');

    // Dodanie nasłuchiwania na zmiany w opcjach
    for (let option of options) {
      option.addEventListener('change', function() {
        thisProduct.updatePrice(); // Zaktualizuj cenę po zmianie opcji
      });
    }
  }

  updatePrice() {
    const thisProduct = this;
  
    const form = thisProduct.element.querySelector('.product__order');
    const formData = utils.serializeFormToObject(form);
  
    let newPrice = thisProduct.basePrice;
  
    // ⬇️ Tylko jeśli są opcje (np. checkboxy, radio)
    if (thisProduct.data.params) {
      for (let paramId in thisProduct.data.params) {
        const param = thisProduct.data.params[paramId];
  
        for (let optionId in param.options) {
          const option = param.options[optionId];
  
          const optionSelected = formData[paramId] && (
            (Array.isArray(formData[paramId]) && formData[paramId].includes(optionId)) ||
            formData[paramId] === optionId
          );
  
          if (optionSelected && !option.default) {
            newPrice += option.price;
          } else if (!optionSelected && option.default) {
            newPrice -= option.price;
          }
  
          if (thisProduct.imageWrapper) {
            const imageClass = `.${paramId}-${optionId}`;
            const image = thisProduct.imageWrapper.querySelector(imageClass);
  
            if (image) {
              if (optionSelected) {
                image.classList.add('active');
              } else {
                image.classList.remove('active');
              }
            }
          }
        }
      }
    }
  
    const amount = parseInt(formData.amount) || 1;
    newPrice *= amount;
  
    const priceElement = thisProduct.element.querySelector('.product__total-price .price');
    if (priceElement) {
      priceElement.textContent = newPrice.toFixed(2);
    }
  
    thisProduct.optionsPrice = newPrice - (thisProduct.basePrice * amount);
  }
}  

// Klasa dla aplikacji
const app = {
  data: {}, // Zmienna przechowująca dane o produktach

  // Funkcja inicjalizująca dane produktów
  initData: function () {
    const thisApp = this;

    // Załadowanie danych z dataSource
    thisApp.data = dataSource;
  },

  // Funkcja inicjalizująca menu
  initMenu: function () {
    const thisApp = this;

    // Iteracja po wszystkich produktach i tworzenie instancji klasy Product
    for (let productId in thisApp.data.products) {
      new Product(productId, thisApp.data.products[productId]);
    }
  },

  // Funkcja inicjalizująca aplikację
  init: function () {
    const thisApp = this;

    thisApp.initData(); // Inicjalizacja danych
    thisApp.initMenu(); // Inicjalizacja menu
  },
};


// Uruchomienie aplikacji
app.init();
