/* global Flickity */
import { templates, select } from '../settings.js';

class Home {
  constructor(element) {
    const thisHome = this;
    thisHome.element = element;

    thisHome.render();
    thisHome.initWidgets();
    thisHome.initActions(); // <-- dodano!
  }

  render() {
    const thisHome = this;

    const generateHTML = templates.homePage();

    thisHome.dom = {};
    thisHome.dom.wrapper = thisHome.element;

    thisHome.dom.wrapper.innerHTML = generateHTML;

    thisHome.dom.carousel = thisHome.dom.wrapper.querySelector(select.home.carousel);

    // Złapanie przycisków
    thisHome.dom.orderBtn = thisHome.dom.wrapper.querySelector('.order-online');
    thisHome.dom.bookBtn = thisHome.dom.wrapper.querySelector('.book-table');
  }

  initWidgets() {
    const thisHome = this;

    thisHome.carousel = new Flickity(thisHome.dom.carousel, {
      contain: true,
      pageDots: true,
      wrapAround: true,
      autoPlay: true,
      prevNextButtons: false,
    });
  }

  initActions() {
    const thisHome = this;

    // kliknięcie w "Order Online"
    thisHome.dom.orderBtn.addEventListener('click', () => {
      window.location.hash = '#/order';
    });

    // kliknięcie w "Book Table"
    thisHome.dom.bookBtn.addEventListener('click', () => {
      window.location.hash = '#/booking';
    });
  }
}

export default Home;
