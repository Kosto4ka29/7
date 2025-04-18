import {settings,select,classNames,templates} from '../settings.js';
import utils from '../utils.js';
import AmountWidget from '../components/AmountWidget.js';

class Product {
    constructor(id,data){
      const thisProduct=this; //every single product

      thisProduct.id=id;// np pizza
      thisProduct.data=data;//np price, name, params:

      thisProduct.renderInMenu(); //rendering products on the website
      thisProduct.getElements(); //get DOM elements
      thisProduct.initAccordion(); // folding and unfolding products

      thisProduct.initOrderForm();//setting up the order form
      //calculating price of the products

      thisProduct.initAmountWidget();
      thisProduct.processOrder();


      //console.log('new Product:', thisProduct);
    }

    renderInMenu(){
      const thisProduct=this;

      /* generate HTML based on template */
      const generateHTML =templates.menuProduct(thisProduct.data);

      /* create element using utils.createElementFromHTML */

      thisProduct.element = utils.createDOMFromHTML(generateHTML);

      /* find menu container */

      const menuContainer=document.querySelector(select.containerOf.menu);

      /* add element to menu */

      menuContainer.appendChild(thisProduct.element)
    }

    getElements(){
      const thisProduct = this;

      thisProduct.dom={};

      thisProduct.dom.accordionTrigger = thisProduct.element.querySelector(select.menuProduct.clickable);

      thisProduct.dom.form = thisProduct.element.querySelector(select.menuProduct.form);

      thisProduct.dom.formInputs = thisProduct.element.querySelectorAll(select.all.formInputs);

      thisProduct.dom.cartButton = thisProduct.element.querySelector(select.menuProduct.cartButton);

      thisProduct.dom.priceElem = thisProduct.element.querySelector(select.menuProduct.priceElem);

      thisProduct.dom.imageWrapper=thisProduct.element.querySelector(select.menuProduct.imageWrapper);

      thisProduct.dom.amountWidgetElem=thisProduct.element.querySelector(select.menuProduct.amountWidget);

      //console.log(thisProduct.amountWidgetElem);
    }



    initAccordion(){
      const thisProduct=this;

      /* START: add event listener to clickable trigger on event click */

      thisProduct.dom.accordionTrigger.addEventListener('click', function(event){
        //console.log('clicked');

        /* prevent default action for event */
        event.preventDefault();

        /* find active product (product that has active class) */
        const activeProduct=document.querySelector(select.all.menuProductsActive);

        //console.log(activeProduct);

        /* if there is active product and it's not thisProduct.element, remove class active from it */

        if (activeProduct && activeProduct !== thisProduct.element){
          activeProduct.classList.remove(classNames.menuProduct.wrapperActive);
        }

        /* toggle active class on thisProduct.element */
        thisProduct.element.classList.toggle(classNames.menuProduct.wrapperActive);

      });
    }

    initOrderForm(){
      const thisProduct = this;
      //console.log('Method:initOrderForm');

      thisProduct.dom.form.addEventListener('submit', function(event){
        event.preventDefault();
        thisProduct.processOrder();
      });

      for(let input of thisProduct.dom.formInputs){
        input.addEventListener('change', function(){
          thisProduct.processOrder();
        });
      }

      thisProduct.dom.cartButton.addEventListener('click', function(event){
        event.preventDefault();
        thisProduct.processOrder();
        thisProduct.addToCart();
      });
    }

    processOrder() {
      const thisProduct = this;
      //console.log('Method:processOrder');

      // covert form to object structure e.g. { sauce: ['tomato'], toppings: ['olives', 'redPeppers']}
      const formData = utils.serializeFormToObject(thisProduct.dom.form);
      //console.log('formData', formData);

      // set price to default price
      let price = thisProduct.data.price;

      // for every category (param)...
      for(let paramId in thisProduct.data.params) {
        // determine param value, e.g. paramId = 'toppings', param = { label: 'Toppings', type: 'checkboxes'... }
        const param = thisProduct.data.params[paramId];
        //console.log(paramId, param);

        // for every option in this category
        for(let optionId in param.options) {
          // determine option value, e.g. optionId = 'olives', option = { label: 'Olives', price: 2, default: true }
          const option = param.options[optionId];
          //console.log(optionId, option);

          //check if the option is selected in the form data

          const optionSelected=formData[paramId] && formData[paramId].includes(optionId);

          if (optionSelected){
            //if the option is selected and not default, add its price
            if(!option.default){
              price+=option.price;
            }
          } else {
            // if option is not selected but is default, subtracy its price
            if (option.default)
              price-=option.price;
          }

          const optionImage=thisProduct.dom.imageWrapper.querySelector(`.${paramId}-${optionId}`);

          if (optionImage){
            if (optionSelected){
              optionImage.classList.add(classNames.menuProduct.imageVisible);
            }
            else {
              optionImage.classList.remove(classNames.menuProduct.imageVisible);
            }
          }
        }
      }

      thisProduct.priceSingle = price;
      //multiply price by amount
      price*=thisProduct.amountWidget.value;

      // update calculated price in the HTML
      thisProduct.dom.priceElem.innerHTML = price;
    }

    initAmountWidget(){
      const thisProduct=this;

      thisProduct.amountWidget= new AmountWidget(thisProduct.dom.amountWidgetElem);

      thisProduct.dom.amountWidgetElem.addEventListener('updated', function(){
        thisProduct.processOrder();
      });

    }

    addToCart(){
      const thisProduct=this;

      //app.cart.add(cartProduct);

      const event= new CustomEvent('add-to-cart', {
        bubbles:true,
        detail: {
          product:thisProduct.prepareCartProduct(),
        },
      })
      thisProduct.element.dispatchEvent(event);

      thisProduct.resetToDefault();

    }

    resetToDefault() {
      const thisProduct=this;

      thisProduct.dom.form.reset();
      thisProduct.amountWidget.setValue(settings.amountWidget.defaultValue);

      thisProduct.processOrder();
    }

    prepareCartProduct(){
      const thisProduct=this;

      const productSummary={
        id:thisProduct.id,
        name:thisProduct.data.name,
        amount:thisProduct.amountWidget.value,
        priceSingle:thisProduct.priceSingle,
        price:thisProduct.priceSingle*thisProduct.amountWidget.value,
        params:thisProduct.prepareCartProductParams(),
      };
      return productSummary;

    }

    prepareCartProductParams() {
      const thisProduct = this;

      const formData = utils.serializeFormToObject(thisProduct.dom.form);
      const params = {};

      // for very category (param)
      for(let paramId in thisProduct.data.params) {
        const param = thisProduct.data.params[paramId];

        // create category param in params const eg. params = { ingredients: { name: 'Ingredients', options: {}}}
        params[paramId] = {
          label: param.label,
          options: {}
        }

        // for every option in this category
        for(let optionId in param.options) {
          const option = param.options[optionId];
          const optionSelected = formData[paramId] && formData[paramId].includes(optionId);

          if(optionSelected) {
            params[paramId].options[optionId] = option.label
          }
        }
      }
      return params;
    }
  }

  export default Product;