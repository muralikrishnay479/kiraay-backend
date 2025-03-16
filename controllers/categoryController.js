const asyncHandler = require('express-async-handler');
const categoriesModel = require('../models/categoriesModel');

const getCategories = asyncHandler(async (req, res) => {
  const categories = await categoriesModel.find().sort({ name: 1 });
  res.json(categories);
});

const createCategory = asyncHandler(async (req, res) => {
  const { name, description, image } = req.body;
  if (!name) {
    res.status(400);
    throw new Error('Category name is mandatory');
  }

  const categoryExists = await categoriesModel.findOne({ name });
  if (categoryExists) {
    res.status(400);
    throw new Error('Category already exists');
  }

  const category = await categoriesModel.create({
    name,
    description,
    image // Optional; defaults if not provided
  });

  res.status(201).json(category);
});

const updateCategory = asyncHandler(async (req, res) => {
  const { name, description, image } = req.body;
  const category = await categoriesModel.findById(req.params.id);
  if (!category) {
    res.status(404);
    throw new Error('Category not found');
  }

  if (name && name !== category.name) {
    const categoryExists = await categoriesModel.findOne({ name });
    if (categoryExists) {
      res.status(400);
      throw new Error('Category name already in use');
    }
  }

  const updatedCategory = await categoriesModel.findByIdAndUpdate(
    req.params.id,
    { name, description, image, updatedAt: Date.now() },
    { new: true, runValidators: true }
  );

  res.json(updatedCategory);
});

const deleteCategory = asyncHandler(async (req, res) => {
  const category = await categoriesModel.findById(req.params.id);
  if (!category) {
    res.status(404);
    throw new Error('Category not found');
  }

  await categoriesModel.deleteOne({ _id: req.params.id });
  res.json({ message: 'Category deleted' });
});

module.exports = { getCategories, createCategory, updateCategory, deleteCategory };