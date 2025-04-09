
require('dotenv').config();
const Sequelize = require('sequelize');

const sequelize = new Sequelize(process.env.DB_URL, {
    dialect: 'postgres',
    protocol: 'postgres',
    dialectOptions: {
        ssl: { require: true, rejectUnauthorized: false }
    },
    query: { raw: true }
});

const Item = sequelize.define('Item', {
    body: Sequelize.TEXT,
    title: Sequelize.STRING,
    postDate: Sequelize.DATE,
    featureImage: Sequelize.STRING,
    published: Sequelize.BOOLEAN,
    price: Sequelize.DOUBLE
});

const Category = sequelize.define('Category', {
    category: Sequelize.STRING
});

Item.belongsTo(Category, { foreignKey: 'category' });

module.exports.initialize = function () {
    return new Promise((resolve, reject) => {
        sequelize.sync()
            .then(() => resolve())
            .catch(() => reject("unable to sync the database"));
    });
};

module.exports.getAllItems = function () {
    return new Promise((resolve, reject) => {
        Item.findAll()
            .then(data => resolve(data))
            .catch(() => reject("no results returned"));
    });
};

module.exports.getItemsByCategory = function (category) {
    return new Promise((resolve, reject) => {
        Item.findAll({
            where: { category: category }
        })
        .then(data => resolve(data))
        .catch(() => reject("no results returned"));
    });
};

module.exports.getItemsByMinDate = function (minDateStr) {
    return new Promise((resolve, reject) => {
        const { gte } = Sequelize.Op;
        Item.findAll({
            where: {
                postDate: { [gte]: new Date(minDateStr) }
            }
        })
        .then(data => resolve(data))
        .catch(() => reject("no results returned"));
    });
};

module.exports.getItemById = function (id) {
    return new Promise((resolve, reject) => {
        Item.findAll({
            where: { id: id }
        })
        .then(data => resolve(data[0]))
        .catch(() => reject("no results returned"));
    });
};

module.exports.addItem = function (itemData) {
    return new Promise((resolve, reject) => {
        itemData.published = itemData.published ? true : false;

        for (let prop in itemData) {
            if (itemData[prop] === "") itemData[prop] = null;
        }

        itemData.postDate = new Date();

        Item.create(itemData)
            .then(() => resolve())
            .catch(() => reject("unable to create post"));
    });
};

module.exports.getPublishedItems = function () {
    return new Promise((resolve, reject) => {
        Item.findAll({
            where: { published: true }
        })
        .then(data => resolve(data))
        .catch(() => reject("no results returned"));
    });
};

module.exports.getPublishedItemsByCategory = function (category) {
    return new Promise((resolve, reject) => {
        Item.findAll({
            where: {
                published: true,
                category: category
            }
        })
        .then(data => resolve(data))
        .catch(() => reject("no results returned"));
    });
};

module.exports.getCategories = function () {
    return new Promise((resolve, reject) => {
        Category.findAll()
            .then(data => resolve(data))
            .catch(() => reject("no results returned"));
    });
};

module.exports.addCategory = function (categoryData) {
    return new Promise((resolve, reject) => {
        for (let prop in categoryData) {
            if (categoryData[prop] === "") categoryData[prop] = null;
        }

        Category.create(categoryData)
            .then(() => resolve())
            .catch(() => reject("unable to create category"));
    });
};

module.exports.deleteCategoryById = function (id) {
    return new Promise((resolve, reject) => {
        Category.destroy({ where: { id: id } })
            .then(() => resolve())
            .catch(() => reject("unable to delete category"));
    });
};

module.exports.deletePostById = function (id) {
    return new Promise((resolve, reject) => {
        Item.destroy({ where: { id: id } })
            .then(() => resolve())
            .catch(() => reject("unable to delete post"));
    });
};
