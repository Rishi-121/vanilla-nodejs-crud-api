const http = require("http");
const fs = require("fs");
let products = require("./products");

// Helper methods

const writeDataToFile = (fileName, content) => {
  fs.writeFileSync(fileName, JSON.stringify(content), "UTF-8", (err) => {
    console.log(err);
  });
};

const findById = (id) => {
  return new Promise((resolve, reject) => {
    const product = products.find((product) => product.id === id);
    resolve(product);
  });
};

// CRUD methods

// @desc  Gets All Products
const getProducts = (req, res) => {
  try {
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify(products));
  } catch (err) {
    console.log(err);
  }
};

// @desc  Gets Single Product
const getProduct = async (req, res, id) => {
  try {
    const product = await findById(id);
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify(product));
  } catch (err) {
    console.log(err);
  }
};

// @desc  Create a Product
const createProduct = (req, res) => {
  try {
    let body = "";
    req.on("data", (chunk) => (body += chunk.toString()));
    req.on("end", async () => {
      const { id } = JSON.parse(body);
      const isProductExists = await findById(id);
      if (isProductExists) {
        res.writeHead(409, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ message: "Product already exists" }));
      } else {
        const newProduct = { ...JSON.parse(body) };
        products.push(newProduct);
        writeDataToFile("./products.json", products);
        res.writeHead(201, { "Content-Type": "application/json" });
        res.end(JSON.stringify(newProduct));
      }
    });
  } catch (err) {
    console.log(err);
  }
};

// @desc  Update a Product
const updateProduct = async (req, res, id) => {
  try {
    const product = await findById(id);
    if (!product) {
      res.writeHead(404, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ message: "Product not found" }));
    } else {
      let body = "";
      req.on("data", (chunk) => (body += chunk.toString()));
      req.on("end", () => {
        const { name, description, price } = JSON.parse(body);
        const productData = {
          name: name || product.name,
          description: description || product.description,
          price: price || product.price,
        };
        const index = products.findIndex((product) => product.id === id);
        products[index] = { id, ...productData };
        writeDataToFile("./products.json", products);
        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify(products[index]));
      });
    }
  } catch (err) {
    console.log(err);
  }
};

// @desc  Delete Product
const deleteProduct = async (req, res, id) => {
  try {
    const product = await findById(id);
    if (!product) {
      res.writeHead(404, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ message: "Product not found" }));
    } else {
      products = products.filter((product) => product.id !== id);
      writeDataToFile("./products.json", products);
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ message: "Product deleted successfully" }));
    }
  } catch (err) {
    console.log(err);
  }
};

const server = http.createServer((req, res) => {
  if (req.url === "/api/products/" && req.method === "GET") {
    getProducts(req, res);
  } else if (req.url.match(/\/api\/products\/[0-9]+/) && req.method === "GET") {
    const id = +req.url.split("/")[3];
    getProduct(req, res, id);
  } else if (req.url === "/api/products/" && req.method === "POST") {
    createProduct(req, res);
  } else if (req.url.match(/\/api\/products\/[0-9]+/) && req.method === "PUT") {
    const id = +req.url.split("/")[3];
    updateProduct(req, res, id);
  } else if (
    req.url.match(/\/api\/products\/[0-9]+/) &&
    req.method === "DELETE"
  ) {
    const id = +req.url.split("/")[3];
    deleteProduct(req, res, id);
  } else {
    res.writeHead(404, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ message: `Not Found - ${req.url}` }));
  }
});

const PORT = process.env.PORT || 8000;
server.listen(PORT, console.log(`Server is running on port ${PORT}`));

//  {
//     "id": 5,
//     "name": "Logitech G-Series Gaming Mouse",
//     "description": "Get a better handle on your games with this Logitech LIGHTSYNC gaming mouse. The six programmable buttons allow customization for a smooth playing experience",
//     "price": 49.99
//   }