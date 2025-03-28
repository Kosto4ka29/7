/* global Handlebars, utils, dataSource */ // eslint-disable-line no-unused-vars

'use strict';

const select = {
  templateOf: {
    menuProduct: "#template-menu-product",
  },
  containerOf: {
    menu: '#product-list',
    cart: '#cart',
  },
  all: {
    menuProducts: '#product-list > .product',
    menuProductsActive: '#product-list > .product.active',
    formInputs: 'input, select',
  },
  menuProduct: {
    clickable: '.product__header',
    form: '.product__order',
    priceElem: '.product__total-price .price',
    imageWrapper: '.product__images',
    amountWidget: '.widget-amount',
    cartButton: '[href="#add-to-cart"]',
  },
  widgets: {
    amount: {
      input: 'input[name="amount"]',
      linkDecrease: 'a[href="#less"]',
      linkIncrease: 'a[href="#more"]',
    },
  },
};

const classNames = {
  menuProduct: {
    wrapperActive: 'active',
    imageVisible: 'active',
  },
};

const settings = {
  amountWidget: {
    defaultValue: 1,
    defaultMin: 0,
    defaultMax: 10,
  }
};

const templates = {
  menuProduct: Handlebars.compile(document.querySelector(select.templateOf.menuProduct).innerHTML),
};

class Product {
  constructor(id, data) {
    const thisProduct = this;

    // Przypisanie argumentów do instancji
    thisProduct.id = id;
    thisProduct.data = data;

    console.log('new Product:', thisProduct);

    // Wywołanie metody renderInMenu po stworzeniu instancji
    thisProduct.renderInMenu();
    thisProduct.initAccordion();
  }

  renderInMenu() {
    const thisProduct = this;

    // Generowanie HTML
    const generatedHTML = templates.menuProduct(thisProduct.data);

    // Tworzenie elementu DOM
    thisProduct.element = utils.createDOMFromHTML(generatedHTML);

    // Znalezienie kontenera menu
    const menuContainer = document.querySelector(select.containerOf.menu);

    // Dodanie stworzonego elementu na stronę
    menuContainer.appendChild(thisProduct.element);
  }

  initAccordion() {
    const thisProduct = this;
  
    /* znajdź wyzwalacz klikalny */
    const clickableTrigger = thisProduct.element.querySelector(select.menuProduct.clickable);
  
    /* START: add event listener to clickable trigger on event click */
    clickableTrigger.addEventListener('click', function(event) {
      /* prevent default action for event */
      event.preventDefault();
  
      /* find active product (product that has active class) */
      const activeProduct = document.querySelector(select.all.menuProducts + '.' + classNames.menuProduct.wrapperActive);
  
      /* if there is active product and it's not thisProduct.element, remove class active from it */
      if (activeProduct && activeProduct !== thisProduct.element) {
        activeProduct.classList.remove(classNames.menuProduct.wrapperActive);
      }
  
      /* toggle active class on thisProduct.element */
      thisProduct.element.classList.toggle(classNames.menuProduct.wrapperActive);
    }); 

  
  
    

  }
}




const app = {

  initMenu: function () {
    const thisApp = this;
    
    console.log('thisApp.data:', thisApp.data); // Sprawdzenie czy dane są wczytane poprawnie
    
    for (let productId in thisApp.data.products) {
      new Product(productId, thisApp.data.products[productId]); // Tworzenie instancji produktu
    }
  },

  initData: function () {
    const thisApp = this;

    thisApp.data = dataSource;
    console.log('thisApp.data:', thisApp.data);
  },

  init: function () {
    const thisApp = this;
    console.log('*** App starting ***');
    console.log('thisApp:', thisApp);
    console.log('classNames:', classNames);
    console.log('settings:', settings);
    console.log('templates:', templates);

    thisApp.initData();
    thisApp.initMenu();
  },
};

// Uruchomienie aplikacji
app.init();
