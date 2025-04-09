/*********************************************************************************
*  WEB322 – Assignment 05 
*  I declare that this assignment is my own work in accordance with Seneca Academic Policy.  
*  No part of this assignment has been copied manually or electronically from any other source 
*  (including 3rd party websites) or distributed to other students.
*
*  Name: Vansh 
*  Student ID: 165786237
*  Date: 22-03-2025
*  Cyclic Web App URL: https://web322-app-a4.vercel.app/about
*  GitHub Repository URL: https://github.com/vanssh4/web322_app_a4 
**********************************************************************************/

const express = require("express");
const storeService = require("./store-service");
const multer = require("multer");
const cloudinary = require("cloudinary").v2;
const streamifier = require("streamifier");
const app = express();
require('pg');
const PORT = process.env.PORT || 3000;

app.set("view engine", "ejs");

app.use(express.static("public"));
app.use(express.urlencoded({ extended: true }));

cloudinary.config({
    cloud_name: "dfst9j74g",
    api_key: "332178947425628",
    api_secret: "y7M6d7_J5Feh4jbgowjFyOT4pw8",
    secure: true
});

const upload = multer();

app.use((req, res, next) => {
    res.locals.active = req.path;
    next();
});

app.get("/", (req, res) => res.redirect("/about"));

app.get("/about", (req, res) => {
    res.render("about", { title: "About Us", active: "about" });
});

app.get("/shop", async (req, res) => {
    try {
        const items = await storeService.getPublishedItems();
        const categories = await storeService.getCategories();
        res.render("shop", { title: "Shop", active: "shop", items, categories });
    } catch (err) {
        res.render("shop", { title: "Shop", active: "shop", items: [], categories: [], message: "No items found" });
    }
});

app.get("/items", async (req, res) => {
    try {
        const items = await storeService.getAllItems();
        const categories = await storeService.getCategories();
        res.render("items", { title: "Items", active: "items", items, categories });
    } catch (err) {
        res.render("items", { title: "Items", active: "items", items: [], categories: [], message: "No items found" });
    }
});

app.get("/categories", async (req, res) => {
    try {
        const categories = await storeService.getCategories();
        res.render("categories", { title: "Categories", active: "categories", categories });
    } catch (err) {
        res.render("categories", { title: "Categories", active: "categories", categories: [] });
    }
});


app.get("/items/add", async (req, res) => {
    try {
        const categories = await storeService.getCategories();
        res.render("addItem", { title: "Add Item", active: "add", categories });
    } catch (err) {
        res.render("addItem", { title: "Add Item", active: "add", categories: [] });
    }
});

app.post("/items/add", upload.single("featureImage"), async (req, res) => {
    try {
        if (req.file) {
            let streamUpload = (req) => {
                return new Promise((resolve, reject) => {
                    let stream = cloudinary.uploader.upload_stream((error, result) => {
                        if (result) resolve(result);
                        else reject(error);
                    });
                    streamifier.createReadStream(req.file.buffer).pipe(stream);
                });
            };

            let uploaded = await streamUpload(req);
            req.body.featureImage = uploaded.url;
        } else {
            req.body.featureImage = "";
        }

        await storeService.addItem(req.body);
        res.redirect("/items");
    } catch (err) {
        console.error("Error adding item:", err);
        res.status(500).json({ error: "Unable to add item" });
    }
});

app.use((req, res) => {
    res.status(404).render("404", { title: "Page Not Found", active: "" });
});

storeService.initialize()
    .then(() => {
        app.listen(PORT, () => console.log(`🚀 Server is running at: http://localhost:${PORT}`));
    })
    .catch((err) => {
        console.error(` Failed to start server: ${err}`);
        process.exit(1);
    });
