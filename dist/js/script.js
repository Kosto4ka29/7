/* global dataSource */
/* global utils */


'use strict';

// Definiowanie selektorów
const select = {
  containerOf: {
    menu: '#product-list', // kontener dla listy produktów
  },
  menuProduct: {
    imageWrapper: '.product_images', // ← to musisz DODAĆ
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

  // Funkcja do obliczania ceny po uwzględnieniu opcji
  updatePrice() {
    const thisProduct = this;

    // Zresetowanie dodatkowej ceny
    let newPrice = thisProduct.basePrice;

    // Dodanie ceny opcji (checkbox, radio, select)
    const options = thisProduct.element.querySelectorAll('.product__params input');
    for (let option of options) {
      if (option.checked) {
        const price = parseFloat(option.dataset.price); // Pobranie ceny z atrybutu data-price
        newPrice += price; // Zwiększenie ceny o wartość opcji
      }
    }

    // Aktualizacja ceny na stronie
    const priceElement = thisProduct.element.querySelector('.product__total-price .price');
    priceElement.textContent = newPrice.toFixed(2); // Ustawienie nowej ceny na stronie
    thisProduct.optionsPrice = newPrice - thisProduct.basePrice; // Zapamiętanie dodatkowej ceny
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
