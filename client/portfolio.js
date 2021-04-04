// Invoking strict mode https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Strict_mode#invoking_strict_mode
'use strict';



// current products on the page
let currentProducts = [];
let currentPagination = {};

// inititiqte selectors
const selectShow = document.querySelector('#show-select');
const selectPage = document.querySelector('#page-select');
const selectBrands = document.querySelector('#brand-select');
const sectionProducts = document.querySelector('#products');
const spanNbProducts = document.querySelector('#nbProducts');
const selectSort = document.querySelector('#sort-select');
const NbProducts = document.querySelector('#nbProducts');
const last = document.querySelector('#last_realeased');
const goodprice = document.querySelector('#goodprice');
const recent = document.querySelector('#recent');
const spanP50 = document.querySelector('#p50');
const spanP90 = document.querySelector('#p90');
const spanP95 = document.querySelector('#p95');
/**
 * Set global value
 * @param {Array} result - products to display
 * @param {Object} meta - pagination meta info
 */
const setCurrentProducts = ({result, meta}) => {
  currentProducts = result;
  currentPagination = meta;
};

/**
 * Fetch products from api
 * @param  {Number}  [page=1] - current page to fetch
 * @param  {Number}  [size=12] - size of the page
 * @return {Object}
 */
const fetchProducts = async (page = 0, size=12) => {
  try {
    const response = await fetch(`https://server-five-khaki.vercel.app/products/search?page=${page}&size=${size}`);
    const body = await response.json();
    console.log(response)

    if (body.success !== true) {
      console.error(body);
      return {currentProducts, currentPagination};
    }

    return body.data;
  } catch (error) {
    console.error(error);
    return {currentProducts, currentPagination};
  }
};

/**
 * Render list of products
 * @param  {Array} products
 */
const renderProducts = products => {
  const fragment = document.createDocumentFragment();
  const div = document.createElement('div');
  const template = products
    .map(product => {
      return `
      <div class="product" id=${product.uuid}>
        <span>${product.brand}</span>
        <a href="${product.link}">${product.name}</a>
        <span>${product.price}</span>
      </div>
    `;
    })
    .join('');

  div.innerHTML = template;
  fragment.appendChild(div);
  sectionProducts.innerHTML = '<h2>Products</h2>';
  sectionProducts.appendChild(fragment);
};

//Feature 2
const renderBrands = currentProducts => {
  try {
    let brands = [''];
    let brands_html = "";
    brands_html += `<option value="All">All</option>`
    for(let i = 0; i<currentProducts.length; i++){
      if(brands.indexOf(currentProducts[i].brand) == -1){
        brands.push(currentProducts[i].brand);
        brands_html += `<option value="${currentProducts[i].brand}">${currentProducts[i].brand}</option>`
      }
    }
    selectBrands.innerHTML = brands_html;
  }
  catch (error) {
    console.error(error);
  }
}

function filterBrands(currentProducts, filterBrand){
  if(filterBrand != 'All'){
    let filteredProducts = [];
    for(let i = 0; i < currentProducts.length; i++){
      if(currentProducts[i].brand == filterBrand){
        filteredProducts.push(currentProducts[i]);
      }
    }
    renderProducts(filteredProducts);
  }else {
    renderProducts(currentProducts);
  }
}

/**
 * Render page selector
 * @param  {Object} pagination
 */
const renderPagination = pagination => {
  const {currentPage, pageCount} = pagination;
  console.log(pageCount,currentPage)
  const options = Array.from(
    {'length': pageCount},
    (value, index) => `<option value="${index+1}">${index+1}</option>`
  ).join('');

  selectPage.innerHTML = options;
  selectPage.selectedIndex = currentPage;
};

/**
 * Render page selector
 * @param  {Object} pagination
 */
const renderIndicators = pagination => {
  const {count} = pagination;
  spanNbProducts.innerHTML = count;
  spanP50.innerHTML = percentile(currentProducts,0.5);
  spanP90.innerHTML = percentile(currentProducts,0.9);
  spanP95.innerHTML = percentile(currentProducts,0.95);
};

const render = (products, pagination) => {
  renderProducts(products);
  renderPagination(pagination);
  renderIndicators(pagination);
  renderBrands(currentProducts);
};

/**
 * Declaration of all Listeners
 */

/**
 * Select the number of products to display
 * @type {[type]}
 */
selectShow.addEventListener('change', event => {
  fetchProducts(currentPagination.currentPage, parseInt(event.target.value))
    .then(setCurrentProducts)
    .then(() => render(currentProducts, currentPagination));
});

//Feature 1
selectPage.addEventListener('change', event => {
  fetchProducts(parseInt(event.target.value)-1, currentPagination.pageSize)
    .then(setCurrentProducts)
    .then(() => render(currentProducts, currentPagination));
});

//Feature 2

selectBrands.addEventListener('change', event => {
    filterBrands(currentProducts,event.target.value);
});


selectSort.addEventListener('change', event => {
    renderProducts(SortChoice(currentProducts, event.target.value));
});



document.addEventListener('DOMContentLoaded', () =>
  fetchProducts()
    .then(setCurrentProducts)
    .then(() => render(currentProducts, currentPagination))
);


goodprice.addEventListener('change', (event) => {
  if (goodprice.checked) {
    renderProducts(filterprice(currentProducts));
  }
  else {
    renderProducts(currentProducts);
  }
})

recent.addEventListener('change', event =>{
  recent.checked ? renderProducts(filterrelease(currentProducts)) : renderProducts(currentProducts)
})
// Feature
// Feature 3,4,5 and 6

function SortChoice(products,Sort){
  switch(Sort){
    case "price-asc":
      return sortby_price(products,true);
    case "price-desc":
      return sortby_price(products,false);
    case "date-asc":
      return sortby_date(products,true);
    case "date-desc":
      return sortby_date(products,false);
    default :
      return products;
  }

}

function sortby_price(list,desc){
  console.log("prices")
  if(desc){
    return list.sort(function (a, b) {
      return a.price - b.price;
    });
  }
  else{
    return list.sort(function (a, b) {
      return b.price - a.price;
    });
  }

}

function sortby_date(list,desc){
  console.log("dates")
  return list.sort(function (a, b) {
    var date1 = new Date(a.released);
    var date2 = new Date(b.released);
    if(desc){
      return  date1-date2;
    }
    else{
      return  date2-date1;

    }

  });
}

const filterprice=(products) => {
  return products.filter(product => product.price < 50)
}

const filterrelease=(products) => {
  return products.filter(product => Date.parse(product.released) > Date.now()-1000*3600*24*300)
}

function percentile(products,n){
  var sorted = sortby_price(products,true);
  var pos = Math.round(((sorted.length) - 1) * n);
  return sorted[pos].price;
}