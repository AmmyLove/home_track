// src/pages/Recipes.jsx

import { useState, useEffect } from "react";
import { getItems } from "../api/items.js";
import { getRecipes, createRecipe, getRecipe, deleteRecipe } from "../api/recipes.js";

export default function Recipes() {
  const [items, setItems] = useState([]);         // all available items (for the ingredient picker)
  const [recipes, setRecipes] = useState([]);     // all saved recipes
  const [selectedRecipe, setSelectedRecipe] = useState(null); // the recipe whose shopping list is shown

  // Form state for creating a new recipe
  const [recipeName, setRecipeName] = useState("");
  const [ingredients, setIngredients] = useState([
    { itemId: "", quantity: "" }, // start with one empty ingredient row
  ]);

  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [loading, setLoading] = useState(false);
  const [listLoading, setListLoading] = useState(false);

  // Load items and recipes when the page opens
  useEffect(() => {
    getItems().then((res) => setItems(res.data)).catch(() => setError("Failed to load items."));
    fetchRecipes();
  }, []);

  const fetchRecipes = async () => {
    try {
      const res = await getRecipes();
      setRecipes(res.data);
    } catch (err) {
      setError("Failed to load recipes.");
    }
  };

  // ── Ingredient row handlers ──────────────────────────────────────

  // Update a specific ingredient row (by index) when user changes a field
  const handleIngredientChange = (index, field, value) => {
    const updated = [...ingredients]; // copy the array
    updated[index][field] = value;    // update only the changed field
    setIngredients(updated);
  };

  // Add a new blank ingredient row
  const addIngredientRow = () => {
    setIngredients([...ingredients, { itemId: "", quantity: "" }]);
  };

  // Remove an ingredient row by index
  const removeIngredientRow = (index) => {
    setIngredients(ingredients.filter((_, i) => i !== index));
  };

  // ── Form submit ──────────────────────────────────────────────────

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!recipeName.trim()) return setError("Recipe name is required.");

    // Validate that every ingredient row has both an item and a quantity
    const validIngredients = ingredients.filter((i) => i.itemId && i.quantity > 0);
    if (validIngredients.length === 0) {
      return setError("Add at least one ingredient with a quantity.");
    }

    setLoading(true);
    try {
      await createRecipe({
        name: recipeName,
        items: validIngredients.map((i) => ({
          itemId: i.itemId,
          quantity: parseFloat(i.quantity),
        })),
      });

      setSuccess(`"${recipeName}" saved!`);
      setRecipeName("");
      setIngredients([{ itemId: "", quantity: "" }]); // reset to one blank row
      setSelectedRecipe(null);
      fetchRecipes();
    } catch (err) {
      setError(err.response?.data?.error || "Failed to create recipe.");
    } finally {
      setLoading(false);
    }
  };

  // ── Shopping list ────────────────────────────────────────────────

  // Fetch a recipe's shopping list and show it
  const handleViewList = async (recipe) => {
    setListLoading(true);
    setSelectedRecipe(null);
    setError(null);
    try {
      const res = await getRecipe(recipe.id);
      setSelectedRecipe(res.data);
    } catch (err) {
      setError("Failed to load shopping list.");
    } finally {
      setListLoading(false);
    }
  };

  // ── Delete ───────────────────────────────────────────────────────

  const handleDelete = async (recipe) => {
    const confirmed = window.confirm(`Delete "${recipe.name}"?`);
    if (!confirmed) return;

    try {
      await deleteRecipe(recipe.id);
      setSuccess(`"${recipe.name}" deleted.`);
      // If the deleted recipe's list is currently shown, clear it
      if (selectedRecipe?.id === recipe.id) setSelectedRecipe(null);
      fetchRecipes();
    } catch (err) {
      setError("Failed to delete recipe.");
    }
  };

  // ── Render ───────────────────────────────────────────────────────

  return (
    <div>
      <h1 style={styles.heading}>Recipes</h1>

      {error && <p style={styles.error}>{error}</p>}
      {success && <p style={styles.success}>{success}</p>}

      {/* ── Create recipe form ──────────────────────────────────── */}
      <div style={styles.card}>
        <h2 style={styles.subheading}>Create a Recipe</h2>
        <form onSubmit={handleSubmit} style={styles.form}>

          {/* Recipe name */}
          <div style={styles.field}>
            <label style={styles.label}>Recipe name *</label>
            <input
              style={styles.input}
              value={recipeName}
              onChange={(e) => setRecipeName(e.target.value)}
              placeholder="e.g. Jollof Rice"
            />
          </div>

          {/* Ingredient rows */}
          <label style={styles.label}>Ingredients *</label>
          {ingredients.map((ing, index) => (
            <div key={index} style={styles.ingredientRow}>

              {/* Item picker */}
              <select
                style={{ ...styles.input, flex: 2 }}
                value={ing.itemId}
                onChange={(e) => handleIngredientChange(index, "itemId", e.target.value)}
              >
                <option value="">Select ingredient</option>
                {items.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.name} {item.unit ? `(${item.unit})` : ""}
                  </option>
                ))}
              </select>

              {/* Quantity input */}
              <input
                style={{ ...styles.input, flex: 1 }}
                type="number"
                min="0"
                step="any"
                value={ing.quantity}
                onChange={(e) => handleIngredientChange(index, "quantity", e.target.value)}
                placeholder="Qty"
              />

              {/* Remove row button — only show if there's more than one row */}
              {ingredients.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeIngredientRow(index)}
                  style={styles.removeBtn}
                >
                  ✕
                </button>
              )}
            </div>
          ))}

          {/* Add another ingredient */}
          <button type="button" onClick={addIngredientRow} style={styles.addRowBtn}>
            + Add ingredient
          </button>

          <button type="submit" style={styles.button} disabled={loading}>
            {loading ? "Saving..." : "Save Recipe"}
          </button>
        </form>
      </div>

      {/* ── Saved recipes list ──────────────────────────────────── */}
      <div style={styles.card}>
        <h2 style={styles.subheading}>Saved Recipes ({recipes.length})</h2>
        {recipes.length === 0 ? (
          <p style={styles.muted}>No recipes yet. Create one above.</p>
        ) : (
          <div style={styles.recipeList}>
            {recipes.map((recipe) => (
              <div key={recipe.id} style={styles.recipeRow}>
                <div>
                  <p style={styles.recipeName}>{recipe.name}</p>
                  {/* Show ingredient count */}
                  <p style={styles.recipeMeta}>
                    {recipe.Items?.length ?? 0} ingredient{recipe.Items?.length !== 1 ? "s" : ""}
                  </p>
                </div>
                <div style={styles.recipeActions}>
                  <button
                    onClick={() => handleViewList(recipe)}
                    style={styles.listBtn}
                  >
                    Shopping list
                  </button>
                  <button
                    onClick={() => handleDelete(recipe)}
                    style={styles.deleteBtn}
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── Shopping list panel ─────────────────────────────────── */}
      {/* Only shows when a recipe is selected */}
      {listLoading && <p style={styles.muted}>Loading shopping list...</p>}

      {selectedRecipe && (
        <div style={styles.card}>
          <h2 style={styles.subheading}>
            Shopping list — {selectedRecipe.name}
          </h2>
          <p style={styles.muted} >
            Green = you have enough. Red = you need to buy more.
          </p>

          <table style={styles.table}>
            <thead>
              <tr>
                {["Ingredient", "Needed", "In stock", "To buy", "Status"].map((h) => (
                  <th key={h} style={styles.th}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {selectedRecipe.ingredients.map((ing) => (
                <tr key={ing.itemId}>
                  <td style={styles.td}>{ing.name}</td>
                  <td style={styles.td}>{ing.needed} {ing.unit ?? ""}</td>
                  <td style={styles.td}>{ing.inStock} {ing.unit ?? ""}</td>
                  <td style={styles.td}>
                    {/* Only show "to buy" if you actually need more */}
                    {ing.sufficient ? "—" : `${ing.toBuy} ${ing.unit ?? ""}`}
                  </td>
                  <td style={styles.td}>
                    <span style={ing.sufficient ? styles.badgeOk : styles.badgeLow}>
                      {ing.sufficient ? "Have enough" : "Need to buy"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Summary line */}
          <p style={styles.summary}>
            {selectedRecipe.ingredients.every((i) => i.sufficient)
              ? "✅ You have everything you need to make this!"
              : `⚠️ You're missing ${selectedRecipe.ingredients.filter((i) => !i.sufficient).length} ingredient(s).`}
          </p>
        </div>
      )}
    </div>
  );
}

const styles = {
  heading: { fontSize: "24px", fontWeight: "700", marginBottom: "24px", color: "#111827" },
  subheading: { fontSize: "16px", fontWeight: "600", marginBottom: "16px", color: "#374151" },
  card: { background: "#fff", border: "1px solid #e5e7eb", borderRadius: "12px", padding: "24px", marginBottom: "24px" },
  form: { display: "flex", flexDirection: "column", gap: "16px" },
  field: { display: "flex", flexDirection: "column", gap: "6px" },
  label: { fontSize: "13px", fontWeight: "500", color: "#374151" },
  input: { padding: "8px 12px", border: "1px solid #d1d5db", borderRadius: "8px", fontSize: "14px", outline: "none" },
  ingredientRow: { display: "flex", gap: "8px", alignItems: "center" },
  removeBtn: { padding: "8px 10px", background: "#fef2f2", color: "#dc2626", border: "1px solid #fecaca", borderRadius: "6px", cursor: "pointer", fontSize: "13px" },
  addRowBtn: { alignSelf: "flex-start", padding: "8px 16px", background: "#f9fafb", color: "#374151", border: "1px solid #e5e7eb", borderRadius: "8px", fontSize: "13px", cursor: "pointer" },
  button: { alignSelf: "flex-start", padding: "10px 24px", background: "#4f46e5", color: "#fff", border: "none", borderRadius: "8px", fontSize: "14px", fontWeight: "600", cursor: "pointer" },
  recipeList: { display: "flex", flexDirection: "column", gap: "12px" },
  recipeRow: { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 16px", background: "#f9fafb", border: "1px solid #e5e7eb", borderRadius: "10px" },
  recipeName: { fontWeight: "600", fontSize: "15px", color: "#111827", margin: 0 },
  recipeMeta: { fontSize: "12px", color: "#9ca3af", margin: "4px 0 0" },
  recipeActions: { display: "flex", gap: "8px" },
  listBtn: { padding: "7px 14px", background: "#eff6ff", color: "#2563eb", border: "1px solid #bfdbfe", borderRadius: "6px", fontSize: "13px", fontWeight: "500", cursor: "pointer" },
  deleteBtn: { padding: "7px 14px", background: "#fef2f2", color: "#dc2626", border: "1px solid #fecaca", borderRadius: "6px", fontSize: "13px", fontWeight: "500", cursor: "pointer" },
  table: { width: "100%", borderCollapse: "collapse", marginTop: "12px" },
  th: { textAlign: "left", padding: "10px 12px", fontSize: "13px", fontWeight: "600", color: "#6b7280", borderBottom: "1px solid #e5e7eb" },
  td: { padding: "12px", fontSize: "14px", color: "#111827", borderBottom: "1px solid #f3f4f6" },
  badgeOk: { background: "#f0fdf4", color: "#16a34a", border: "1px solid #bbf7d0", padding: "3px 10px", borderRadius: "20px", fontSize: "12px", fontWeight: "500" },
  badgeLow: { background: "#fef2f2", color: "#dc2626", border: "1px solid #fecaca", padding: "3px 10px", borderRadius: "20px", fontSize: "12px", fontWeight: "500" },
  summary: { marginTop: "16px", fontSize: "14px", fontWeight: "500", color: "#374151" },
  error: { color: "#dc2626", fontSize: "14px", background: "#fef2f2", padding: "10px 14px", borderRadius: "8px", marginBottom: "12px" },
  success: { color: "#16a34a", fontSize: "14px", background: "#f0fdf4", padding: "10px 14px", borderRadius: "8px", marginBottom: "12px" },
  muted: { color: "#9ca3af", fontSize: "14px", marginBottom: "12px" },
};