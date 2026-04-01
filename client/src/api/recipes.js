// src/api/recipes.js

import api from "./axiosInstance.js";

// Get all recipes
export const getRecipes = () => api.get("/api/recipes");

// Create a new recipe with ingredients
export const createRecipe = (data) => api.post("/api/recipes", data);

// Get one recipe by ID — includes its ingredient list + current stock
export const getRecipe = (id) => api.get(`/api/recipes/${id}`);

// Delete a recipe
export const deleteRecipe = (id) => api.delete(`/api/recipes/${id}`);