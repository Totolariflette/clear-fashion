const fsLibrary  = require('fs') 
const dedicatedbrand = require('./sites/dedicatedbrand');
const loom = require('./sites/loom');
const toJsonFile = require('./sources/toJsonFile');
const mudjeans = require('./sources/mudjeans');
// const adresseparis = require('./sources/adresseparis');
const eshops = ['https://www.dedicatedbrand.com/','https://www.loom.fr/','https://mudjeans.eu/','https://adresse.paris/'];
const {MongoClient} = require('mongodb');
//A MODIFIER
const MONGODB_URI = "mongodb+srv://AFR2512:Bellecreole44@clearfashion.mbe0y.mongodb.net/myFirstDatabase?retryWrites=true&w=majority";
const MONGODB_DB_NAME = 'clearfashion';


async function sandbox () {
  try {
    dedicated_products = await dedicated_scrapping(eshops[0]);
    loom_products = await loom_scrapping(eshops[1]);
    mudjeans_products = await mudjeans_scrapping(eshops[2]);
    //adresseparis_products = await adresseparis_scrapping(eshops[2])
    all_products = dedicated_products.concat(loom_products,mudjeans_products);

    

    //console.log(allproducts);

    const client = await MongoClient.connect(MONGODB_URI, {'useNewUrlParser': true});
    const db = client.db(MONGODB_DB_NAME)
    const collection = db.collection('products');
    const result = await collection.insertMany(all_products);
    console.log(result);

    //await adresseparis_scrapping(eshops[2]);



    console.log('All scrapping done');
    process.exit(0);
  }
  catch(error){
    console.error(error)
  }
}

async function dedicated_scrapping(eshop) {
  try {

    let brand = 'DEDICATED';
    console.log(`🕵️‍♀️  browsing ${eshop} source`);
    
    //Scrapping home page
    let dedicated_products = await dedicatedbrand.scrape(eshop);
    console.log(dedicated_products);

    console.log('Dedicated srapping done');
    return dedicated_products
    
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
}

async function loom_scrapping(eshop) {
  try {

    let brand = 'LOOM';
    console.log(`🕵️‍♀️  browsing ${eshop} source`);
    
    //Scrapping home page
    let loom_products = await loom.scrape(eshop);
    console.log(loom_products);

    console.log('Loom srapping done');
    return loom_products
    
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
}

async function mudjeans_scrapping(eshop){
  try  {
    console.log(`🕵️‍♀️  browsing ${eshop} source`);

    //Scrapping home page
    let mudjeans_product = await mudjeans.scrape_products(eshop);
    console.log(mudjeans_product);

    //Scrapping all menu links on home page
    let links_duplicated = await mudjeans.scrape_links(eshop);
    let links = [];

    //Removing duplicates links
    links_duplicated.forEach((link) => {
      if(!links.includes(link)){
        links.push(link);
      }
    })

    //Scrapping on all the links
    for(let i = 0; i < links.length; i++){
      actual_link = eshop + links[i];
      console.log(actual_link);
      products = await mudjeans.scrape_products(actual_link);
      // toJsonFile.productToJsonFile(products, brand);
      mudjeans_product = mudjeans_product.concat(products);
    }
    console.log('Mudjeans scrapping done');
    return mudjeans_product
        
  } catch (e) {
    console.error(e);
    process.exit(1);
  }  
}

async function adresseparis_scrapping(eshop){
  try  {
    console.log(`🕵️‍♀️  browsing ${eshop} source`);

      //Scrapping home page

      let products = await adresseparis.scrape_products(eshop);
      console.log(products);
      
         //Scrapping all menu links on home page
      let links_duplicated = await adresseparis.scrape_links(eshop);
      let links = [];

      //Removing duplicates links
      links_duplicated.forEach((link) => {
        if(!links.includes(link)){
          links.push(link);
        }
      })

    //Scrapping on all the links
    for(let i = 0; i < links.length; i++){
      actual_link = links[i];
      console.log(actual_link);
      products = await adresseparis.scrape_products(actual_link);
    }
      console.log('Adresse Paris scrapping done');    
    } catch (e) {
      console.error(e);
      process.exit(1);
    } 
}


const [,, eshop] = process.argv;
sandbox(eshop);