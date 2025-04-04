/* global dataSource */
/* global utils */


'use strict';

const select = {
  templateOf: {
    menuProduct: '#template-menu-product',
    cartProduct: '#template-cart-product', // CODE ADDED
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
      input: 'input.amount', // CODE CHANGED
      linkDecrease: 'a[href="#less"]',
      linkIncrease: 'a[href="#more"]',
    },
  },
  // CODE ADDED START
  cart: {
    productList: '.cart__order-summary',
    toggleTrigger: '.cart__summary',
    totalNumber: `.cart__total-number`,
    totalPrice: '.cart__total-price strong, .cart__order-total .cart__order-price-sum strong',
    subtotalPrice: '.cart__order-subtotal .cart__order-price-sum strong',
    deliveryFee: '.cart__order-delivery .cart__order-price-sum strong',
    form: '.cart__order',
    formSubmit: '.cart__order [type="submit"]',
    phone: '[name="phone"]',
    address: '[name="address"]',
  },
  cartProduct: {
    amountWidget: '.widget-amount',
    price: '.cart__product-price',
    edit: '[href="#edit"]',
    remove: '[href="#remove"]',
  },
  // CODE ADDED END
};

const classNames = {
  menuProduct: {
    wrapperActive: 'active',
    imageVisible: 'active',
  },
  // CODE ADDED START
  cart: {
    wrapperActive: 'active',
  },
  // CODE ADDED END
};

const settings = {
  amountWidget: {
    defaultValue: 1,
    defaultMin: 1,
    defaultMax: 9,
  }, // CODE CHANGED
  // CODE ADDED START
  cart: {
    defaultDeliveryFee: 20,
  },
  // CODE ADDED END
};

const templates = {
  menuProduct: Handlebars.compile(document.querySelector(select.templateOf.menuProduct).innerHTML),
  // CODE ADDED START
  cartProduct: Handlebars.compile(document.querySelector(select.templateOf.cartProduct).innerHTML),
  // CODE ADDED END
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
    thisProduct.initOptions();
    thisProduct.initAmountWidget();
    thisProduct.initOrderForm();
    thisProduct.updatePrice(); // Inicjalizacja ceny
  }

  getElements(){
    const thisProduct = this;
  
    thisProduct.imageWrapper = thisProduct.element.querySelector(select.menuProduct.imageWrapper);
    thisProduct.amountWidgetElem = thisProduct.element.querySelector(select.menuProduct.amountWidget);
  
    if (!thisProduct.amountWidgetElem) {
      console.warn('⚠️ Nie znaleziono widgetu amount dla produktu:', thisProduct.id);
    }
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
  
    const amount = parseInt(formData.amount);
  if (isNaN(amount) || amount < 0) return;

    newPrice *= amount;
  
    const priceElement = thisProduct.element.querySelector('.product__total-price .price');
    if (priceElement) {
      thisProduct.priceSingle = newPrice / amount;
      priceElement.textContent = newPrice.toFixed(2);
    }
  
    thisProduct.optionsPrice = newPrice - (thisProduct.basePrice * amount);
  }
  initAmountWidget() {
    const thisProduct = this;
  
    if (thisProduct.amountWidgetElem) {
      thisProduct.amountWidget = new AmountWidget(thisProduct.amountWidgetElem);
  
      thisProduct.amountWidgetElem.addEventListener('updated', () => {
        thisProduct.updatePrice(); // przelicza cenę po zmianie ilości
      });
    }
  }
  addToCart(){
  const productSummary = this.prepareCartProduct();
app.cart.add(productSummary);

}
  initOrderForm() {
    const thisProduct = this;
  
    thisProduct.form = thisProduct.element.querySelector(select.menuProduct.form);
    thisProduct.cartButton = thisProduct.element.querySelector(select.menuProduct.cartButton);
  
    thisProduct.cartButton.addEventListener('click', function (event) {
      event.preventDefault();
      thisProduct.updatePrice();     // przelicz cenę
      thisProduct.addToCart();        // dodaj do koszyka
    });
  }

  prepareCartProduct(){
    const thisProduct = this;

  const productSummary = {
    id: thisProduct.id,
    name: thisProduct.data.name,
    amount: thisProduct.amountWidget ? thisProduct.amountWidget.getValue() : 1,
    priceSingle: thisProduct.priceSingle,
    price: thisProduct.priceSingle * thisProduct.amountWidget.getValue(),
    params: thisProduct.prepareCartProductParams(),
  };

  return productSummary;
  }

  prepareCartProductParams() {
    const thisProduct = this;
    const formData = utils.serializeFormToObject(thisProduct.form);
    const params = {};
  
    for (let paramId in thisProduct.data.params) {
      const param = thisProduct.data.params[paramId];
      const options = {};
  
      for (let optionId in param.options) {
        const option = param.options[optionId];
        const optionSelected = formData[paramId] && (
          (Array.isArray(formData[paramId]) && formData[paramId].includes(optionId)) ||
          formData[paramId] === optionId
        );
  
        if (optionSelected) {
          options[optionId] = option.label;
        }
      }
  
      if (Object.keys(options).length) {
        params[paramId] = {
          label: param.label,
          options: options,
        };
      }
    }
  
    return params;
  }
  
  
  
}

class AmountWidget {
  constructor(element) {
    const thisWidget = this;

    thisWidget.getElements(element);
    thisWidget.initActions();
    const inputValue = thisWidget.input.value;

    if (inputValue !== '') {
  thisWidget.setValue(inputValue);
      } else {
  thisWidget.setValue(settings.amountWidget.defaultValue);
    }

  }

  getElements(element) {
    const thisWidget = this;

    thisWidget.element = element;
    thisWidget.input = thisWidget.element.querySelector(select.widgets.amount.input);
    thisWidget.linkDecrease = thisWidget.element.querySelector(select.widgets.amount.linkDecrease);
    thisWidget.linkIncrease = thisWidget.element.querySelector(select.widgets.amount.linkIncrease);
  }

  setValue(value) {
    const thisWidget = this;
  
    const newValue = parseInt(value);
  
    const isValid =
      !isNaN(newValue) &&
      newValue >= settings.amountWidget.defaultMin &&
      newValue <= settings.amountWidget.defaultMax;
  
    if (isValid && newValue !== thisWidget.value) {
      thisWidget.value = newValue;
      thisWidget.input.value = thisWidget.value;
      thisWidget.announce();
    } else {
      // Przywróć poprzednią wartość, jeśli wpisano coś nieprawidłowego
      thisWidget.input.value = thisWidget.value;
    }
  }
  

  // ⬇⬇⬇ TO DODAJ ⬇⬇⬇
  initActions() {
    const thisWidget = this;
  
    thisWidget.input.addEventListener('change', () => {
      thisWidget.setValue(thisWidget.input.value);
    });
  
    thisWidget.linkDecrease.addEventListener('click', (event) => {
      event.preventDefault();
      thisWidget.setValue(thisWidget.value - 1);
    });
  
    thisWidget.linkIncrease.addEventListener('click', (event) => {
      event.preventDefault();
      thisWidget.setValue(thisWidget.value + 1);
    });
  }

  

  announce() {
    const thisWidget = this;
  
    const event = new CustomEvent('updated', {
      bubbles: true
    });
  
    thisWidget.element.dispatchEvent(event);
  }
  getValue(){
    const thisWidget = this;
    return thisWidget.value;
  }
}

class Cart{
  constructor(element){
    const thisCart = this;

    thisCart.products = [];

    thisCart.getElements(element);
    thisCart.initActions();

    console.log('new Cart', thisCart);
  }

  getElements(element){
    const thisCart = this;

    thisCart.dom = {};

    thisCart.dom.wrapper = element;
    thisCart.dom.productList = thisCart.dom.wrapper.querySelector(select.cart.productList);
    thisCart.dom.totalPrice = thisCart.dom.wrapper.querySelectorAll(select.cart.totalPrice);
    thisCart.dom.subtotalPrice = thisCart.dom.wrapper.querySelector('.cart__order-subtotal strong');
    thisCart.dom.totalNumber = thisCart.dom.wrapper.querySelector('.cart__total-number');
    thisCart.dom.deliveryFee = thisCart.dom.wrapper.querySelectorAll('.cart__order-price-sum')[1];
    thisCart.dom.form = thisCart.dom.wrapper.querySelector('.cart__order');
    thisCart.dom.phone = thisCart.dom.form.querySelector('input[name="phone"]');
    thisCart.dom.address = thisCart.dom.form.querySelector('input[name="address"]');
    thisCart.dom.toggleTrigger = thisCart.dom.wrapper.querySelector(select.cart.toggleTrigger);

  }
  initActions() {
    const thisCart = this;
  
    thisCart.dom.toggleTrigger.addEventListener('click', function (event) {
      event.preventDefault();
      thisCart.dom.wrapper.classList.toggle(classNames.cart.wrapperActive);
    });
  
    // 🔥 NOWY NASŁUCHIWACZ
    thisCart.dom.productList.addEventListener('updated', function () {
      thisCart.update();
    });

    thisCart.dom.productList.addEventListener('remove', function (event) {
      thisCart.remove(event.detail.cartProduct);
    });
  }
  

  update() {
    const thisCart = this;
  
    let totalNumber = 0;
    let subtotalPrice = 0;
  
    for (let product of thisCart.products) {
      totalNumber += product.amount;
      subtotalPrice += product.price;
    }
  
    const deliveryFee = 0;
    const totalPrice = subtotalPrice + deliveryFee;
  
    thisCart.dom.totalNumber.innerHTML = totalNumber;
    for (let elem of thisCart.dom.totalPrice) {
      elem.innerHTML = totalPrice;
    }
    
    thisCart.dom.subtotalPrice.innerHTML = subtotalPrice;
    thisCart.dom.deliveryFee.innerHTML = deliveryFee;
  }
  
  add(menuProduct) {
    const thisCart = this;
  
    const generatedHTML = templates.cartProduct(menuProduct);
    const generatedDOM = utils.createDOMFromHTML(generatedHTML);
  
    thisCart.dom.productList.appendChild(generatedDOM);
  
    const cartProduct = new CartProduct(menuProduct, generatedDOM);
    thisCart.products.push(cartProduct);
  
    thisCart.update();
  }

  remove(cartProduct) {
    const thisCart = this;
  
    // Usuń element z DOM
    cartProduct.dom.wrapper.remove();
  
    // Usuń z tablicy produktów
    const index = thisCart.products.indexOf(cartProduct);
    if (index !== -1) {
      thisCart.products.splice(index, 1);
    }
  
    // Zaktualizuj koszyk
    thisCart.update();
  }
  
  
  
  
}

class CartProduct {
  constructor(menuProduct, element) {
    const thisCartProduct = this;

    thisCartProduct.id = menuProduct.id;
    thisCartProduct.name = menuProduct.name;
    thisCartProduct.amount = menuProduct.amount;
    thisCartProduct.priceSingle = menuProduct.priceSingle;
    thisCartProduct.price = menuProduct.price;
    thisCartProduct.params = menuProduct.params;
    

    thisCartProduct.dom = {};
    thisCartProduct.dom.wrapper = element;
    thisCartProduct.dom.amountWidget = thisCartProduct.dom.wrapper.querySelector(select.cartProduct.amountWidget);
    thisCartProduct.dom.price = thisCartProduct.dom.wrapper.querySelector(select.cartProduct.price);
    thisCartProduct.dom.edit = thisCartProduct.dom.wrapper.querySelector(select.cartProduct.edit);
    thisCartProduct.dom.remove = thisCartProduct.dom.wrapper.querySelector(select.cartProduct.remove);
    
    thisCartProduct.dom.remove.addEventListener('click', function(event) {
      event.preventDefault();
      thisCartProduct.remove();
    });
    
    thisCartProduct.initAmountWidget();
  }

  initAmountWidget() {
    const thisCartProduct = this;

    thisCartProduct.amountWidget = new AmountWidget(thisCartProduct.dom.amountWidget);

    thisCartProduct.dom.amountWidget.addEventListener('updated', function () {
      thisCartProduct.amount = thisCartProduct.amountWidget.getValue();
      thisCartProduct.price = thisCartProduct.priceSingle * thisCartProduct.amount;
      thisCartProduct.dom.price.innerHTML = thisCartProduct.price;
    });
  }

  remove(){
    const thisCartProduct = this;

    const event = new CustomEvent('remove', {
      bubbles: true,
      detail: {
        cartProduct: thisCartProduct,
      }
  });

  thisCartProduct.dom.wrapper.dispatchEvent(event);
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

  initCart(){
    const thisApp = this;

    const cartElem = document.querySelector('.cart');
    thisApp.cart = new Cart(cartElem);
  },

  // Funkcja inicjalizująca aplikację
  init: function () {
    const thisApp = this;

    thisApp.initData(); // Inicjalizacja danych
    thisApp.initMenu();
    thisApp.initCart(); // Inicjalizacja menu
  },
};



// Uruchomienie aplikacji
app.init();
