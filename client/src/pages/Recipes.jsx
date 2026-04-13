import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getItems } from "../api/items.js";
import { getRecipes, createRecipe, getRecipe, deleteRecipe } from "../api/recipes.js";
import { useAutoFade } from "../hooks/useAutoFade.js";

const C = { cardBg: "#fff9f0", border: "#f5e6c8", coral: "#ff6b6b", brown: "#3d2b1f", tan: "#b8956a", muted: "#8b7355" };
const inputStyle = { padding: "9px 13px", border: `2px solid #f5e6c8`, borderRadius: "12px", fontSize: "14px", background: "#fff", color: "#3d2b1f", outline: "none", fontFamily: "Georgia, serif", width: "100%" };
const Label = ({ children }) => <label style={{ fontSize: "11px", fontWeight: "700", color: "#8b7355", textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: "6px", display: "block", fontFamily: "system-ui, sans-serif" }}>{children}</label>;

// ← ADDED: was missing, caused crash in shopping list
const badgeStyle = (sufficient) => ({
  fontSize: "11px",
  padding: "3px 10px",
  borderRadius: "20px",
  fontFamily: "system-ui, sans-serif",
  fontWeight: "600",
  background: sufficient ? "#f0fdf4" : "#fff0f0",
  color: sufficient ? "#166534" : "#b91c1c",
  border: `1px solid ${sufficient ? "#b3f0c9" : "#ffb3b3"}`,
});

export default function Recipes() {
  const [items, setItems]                 = useState([]);
  const [recipes, setRecipes]             = useState([]);
  const [selectedRecipe, setSelected]     = useState(null);
  const [recipeName, setRecipeName]       = useState("");
  const [ingredients, setIngredients]     = useState([{ itemId: "", quantity: "" }]);
  const [error, setError]                 = useState(null);
  const [success, setSuccess]             = useState(null);
  const [loading, setLoading]             = useState(false);
  const [listLoading, setListLoading]     = useState(false);
  const [editingRecipe, setEditingRecipe] = useState(null);
  const navigate = useNavigate();

  useAutoFade(success, setSuccess);
  useAutoFade(error, setError, 6000);

  useEffect(() => {
    getItems().then((r) => setItems(r.data)).catch(() => {});
    fetchRecipes();
  }, []);

  const fetchRecipes = async () => {
    try { const r = await getRecipes(); setRecipes(r.data); }
    catch { setError("Failed to load recipes."); }
  };

  const handleIngredientChange = (index, field, value) => {
    const updated = [...ingredients];
    updated[index][field] = value;
    setIngredients(updated);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null); setSuccess(null);
    if (!recipeName.trim()) return setError("Recipe name is required.");
    const valid = ingredients.filter((i) => i.itemId && i.quantity > 0);
    if (valid.length === 0) return setError("Add at least one ingredient with a quantity.");
    setLoading(true);
    try {
      if (editingRecipe) {
        await deleteRecipe(editingRecipe.id);
        await createRecipe({
          name: recipeName,
          items: valid.map((i) => ({ itemId: i.itemId, quantity: parseFloat(i.quantity) })),
        });
        setSuccess(`"${recipeName}" updated! 🌿`);
        setEditingRecipe(null);
      } else {
        await createRecipe({
          name: recipeName,
          items: valid.map((i) => ({ itemId: i.itemId, quantity: parseFloat(i.quantity) })),
        });
        setSuccess(`"${recipeName}" saved! 🍳`);
      }
      setRecipeName("");
      setIngredients([{ itemId: "", quantity: "" }]);
      fetchRecipes();
    } catch (err) {
      setError(err.response?.data?.error || "Failed to save recipe.");
    } finally { setLoading(false); }
  };

  const handleViewList = async (recipe) => {
    setListLoading(true); setSelected(null); setError(null);
    try { const r = await getRecipe(recipe.id); setSelected(r.data); }
    catch { setError("Failed to load shopping list."); }
    finally { setListLoading(false); }
  };

  const handleEditRecipe = (recipe) => {
    setEditingRecipe(recipe);
    setRecipeName(recipe.name);
    const existingIngredients = recipe.Items?.map((item) => ({
      itemId: item.id,
      quantity: item.RecipeItem?.quantity ?? "",
    })) ?? [{ itemId: "", quantity: "" }];
    setIngredients(existingIngredients);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleCancelEdit = () => {
    setEditingRecipe(null);
    setRecipeName("");
    setIngredients([{ itemId: "", quantity: "" }]);
  };

  const handleDelete = async (recipe) => {
    if (!window.confirm(`Delete "${recipe.name}"?`)) return;
    try {
      await deleteRecipe(recipe.id);
      setSuccess(`"${recipe.name}" deleted.`);
      if (selectedRecipe?.id === recipe.id) setSelected(null);
      fetchRecipes();
    } catch { setError("Failed to delete recipe."); }
  };

  return (
    <div style={{ fontFamily: "Georgia, serif" }}>
      <h1 style={{ fontSize: "clamp(20px, 4vw, 24px)", fontWeight: "700", color: C.brown, marginBottom: "6px" }}>
        Recipes 🍳
      </h1>
      <p style={{ fontSize: "13px", color: C.tan, fontStyle: "italic", marginBottom: "24px" }}>
        Save recipes and instantly see what you need to buy to make them.
      </p>

      {error   && <div style={alertStyle("error")}>{error}</div>}
      {success && <div style={alertStyle("success")}>{success}</div>}

      {/* ── Create / Edit recipe form ───────────────────────── */}
      {/* ← FIXED: this div is now properly closed at the end of the form */}
      <div style={{ background: C.cardBg, border: `2px solid ${C.border}`, borderRadius: "24px", padding: "22px", marginBottom: "20px" }}>
        <p style={{ fontSize: "14px", fontWeight: "700", color: C.brown, marginBottom: "16px" }}>
          {editingRecipe ? `✏️ Editing "${editingRecipe.name}"` : "✨ Create a recipe"}
        </p>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: "14px" }}>
            <Label>Recipe name *</Label>
            <input
              style={inputStyle}
              value={recipeName}
              onChange={(e) => setRecipeName(e.target.value)}
              placeholder="e.g. Jollof Rice"
            />
          </div>

          <Label>Ingredients *</Label>
          <div style={{ display: "flex", flexDirection: "column", gap: "8px", marginBottom: "12px" }}>
            {ingredients.map((ing, index) => (
              <div key={index} style={{ display: "flex", gap: "8px", alignItems: "center", flexWrap: "wrap" }}>
                <select
                  style={{ ...inputStyle, flex: 2, minWidth: "140px" }}
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
                <input
                  style={{ ...inputStyle, flex: 1, minWidth: "80px" }}
                  type="number"
                  min="0"
                  step="any"
                  value={ing.quantity}
                  onChange={(e) => handleIngredientChange(index, "quantity", e.target.value)}
                  placeholder="Qty"
                />
                {/* Only show remove button if there's more than one ingredient row */}
                {ingredients.length > 1 && (
                  <button
                    type="button"
                    onClick={() => setIngredients(ingredients.filter((_, i) => i !== index))}
                    style={{ background: "#fff0f0", color: "#b91c1c", border: "1.5px solid #ffb3b3", borderRadius: "10px", padding: "8px 12px", cursor: "pointer", fontFamily: "Georgia, serif", flexShrink: 0 }}
                  >
                    ✕
                  </button>
                )}
              </div>
            ))}
          </div>

          {/* ← FIXED: only ONE submit button now */}
          <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
            <button
              type="button"
              onClick={() => setIngredients([...ingredients, { itemId: "", quantity: "" }])}
              style={{ background: "#fdf6e3", color: C.brown, border: `2px solid ${C.border}`, borderRadius: "20px", padding: "7px 16px", fontSize: "13px", cursor: "pointer", fontFamily: "Georgia, serif" }}
            >
              + Add ingredient
            </button>
            <button
              type="submit"
              style={{ background: C.coral, color: "#fff", border: "none", borderRadius: "20px", padding: "9px 22px", fontSize: "14px", fontWeight: "700", cursor: "pointer", fontFamily: "Georgia, serif" }}
              disabled={loading}
            >
              {loading ? "Saving... 🌿" : editingRecipe ? "Save changes 🌿" : "Save recipe 🍳"}
            </button>
            {editingRecipe && (
              <button
                type="button"
                onClick={handleCancelEdit}
                style={{ background: "transparent", color: C.tan, border: `1.5px solid ${C.border}`, borderRadius: "20px", padding: "9px 18px", fontSize: "13px", cursor: "pointer", fontFamily: "Georgia, serif" }}
              >
                Cancel
              </button>
            )}
          </div>
        </form>
      </div> {/* ← FIXED: form card closes HERE, not inside the form */}

      {/* ── Saved recipes list ──────────────────────────────── */}
      <div style={{ background: C.cardBg, border: `2px solid ${C.border}`, borderRadius: "24px", padding: "22px", marginBottom: "20px" }}>
        <p style={{ fontSize: "14px", fontWeight: "700", color: C.brown, marginBottom: "16px" }}>
          📖 Saved recipes ({recipes.length})
        </p>
        {recipes.length === 0 ? (
          <p style={{ color: C.tan, fontStyle: "italic", fontSize: "13px" }}>
            No recipes yet. Create your first one above!
          </p>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            {recipes.map((recipe) => (
              <div
                key={recipe.id}
                style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 16px", background: "#fdf6e3", border: `2px solid ${C.border}`, borderRadius: "16px", flexWrap: "wrap", gap: "10px" }}
              >
                <div>
                  <p style={{ fontWeight: "700", fontSize: "14px", color: C.brown, margin: 0 }}>{recipe.name}</p>
                  <p style={{ fontSize: "11px", color: C.tan, fontStyle: "italic", margin: "3px 0 0" }}>
                    {recipe.Items?.length ?? 0} ingredient{recipe.Items?.length !== 1 ? "s" : ""}
                  </p>
                </div>
                <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                  <button
                    onClick={() => handleEditRecipe(recipe)}
                    style={{ background: "#fffdf0", color: "#b8860b", border: "1.5px solid #f0e8b3", borderRadius: "20px", padding: "6px 14px", fontSize: "12px", fontWeight: "600", cursor: "pointer", fontFamily: "Georgia, serif" }}
                  >
                    ✏️ Edit
                  </button>
                  <button
                    onClick={() => handleViewList(recipe)}
                    style={{ background: "#f0f4ff", color: "#3b6fc4", border: "1.5px solid #b3c9f0", borderRadius: "20px", padding: "6px 14px", fontSize: "12px", fontWeight: "600", cursor: "pointer", fontFamily: "Georgia, serif" }}
                  >
                    🛒 Shopping list
                  </button>
                  <button
                    onClick={() => handleDelete(recipe)}
                    style={{ background: "#fff0f0", color: "#b91c1c", border: "1.5px solid #ffb3b3", borderRadius: "20px", padding: "6px 14px", fontSize: "12px", fontWeight: "600", cursor: "pointer", fontFamily: "Georgia, serif" }}
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── Shopping list ────────────────────────────────────── */}
      {listLoading && (
        <p style={{ color: C.tan, fontStyle: "italic", textAlign: "center", padding: "20px" }}>
          Loading shopping list... 🌿
        </p>
      )}

      {selectedRecipe && (
        <div style={{ background: C.cardBg, border: `2px solid ${C.border}`, borderRadius: "24px", padding: "22px" }}>
          <p style={{ fontSize: "14px", fontWeight: "700", color: C.brown, marginBottom: "6px" }}>
            🛒 Shopping list — {selectedRecipe.name}
          </p>
          <p style={{ fontSize: "12px", color: C.tan, fontStyle: "italic", marginBottom: "16px" }}>
            Green = you have enough · Red = tap "Buy now" to log a purchase
          </p>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", minWidth: "400px" }}>
              <thead>
                <tr>
                  {["Ingredient", "Needed", "In stock", "Status"].map((h) => (
                    <th key={h} style={{ textAlign: "left", padding: "8px 12px", fontSize: "11px", fontWeight: "700", color: C.muted, textTransform: "uppercase", letterSpacing: "0.06em", borderBottom: `2px dashed ${C.border}`, fontFamily: "system-ui, sans-serif" }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {selectedRecipe.ingredients.map((ing) => (
                  <tr key={ing.itemId}>
                    <td style={tdStyle}>{ing.name}</td>
                    <td style={tdStyle}>{ing.needed} {ing.unit ?? ""}</td>
                    <td style={tdStyle}>{ing.inStock} {ing.unit ?? ""}</td>
                    <td style={tdStyle}>
                      {ing.sufficient ? (
                        // ← Has enough — show green badge
                        <span style={badgeStyle(true)}>✅ Have enough</span>
                      ) : (
                        // ← Needs more — button navigates to purchases with item pre-selected
                        <button
                          onClick={() => navigate(`/purchases?item=${ing.itemId}`)}
                          style={{ background: "#fff0f0", color: "#b91c1c", border: "1.5px solid #ffb3b3", borderRadius: "20px", padding: "4px 12px", fontSize: "11px", fontWeight: "600", cursor: "pointer", fontFamily: "Georgia, serif" }}
                        >
                          Buy now → ({ing.toBuy} {ing.unit ?? ""} needed)
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <p style={{ marginTop: "16px", fontSize: "14px", fontWeight: "600", color: C.brown, fontFamily: "system-ui, sans-serif" }}>
            {selectedRecipe.ingredients.every((i) => i.sufficient)
              ? "✅ You have everything you need to make this!"
              : `⚠️ You're missing ${selectedRecipe.ingredients.filter((i) => !i.sufficient).length} ingredient(s). Tap "Buy now" to log a purchase.`}
          </p>
        </div>
      )}
    </div>
  );
}

const tdStyle = {
  padding: "11px 12px",
  fontSize: "13px",
  color: "#3d2b1f",
  borderBottom: "1.5px dotted #f5e6c8",
  fontFamily: "system-ui, sans-serif",
};

const alertStyle = (type) => ({
  background: type === "error" ? "#fff0f0" : "#f0fdf4",
  border: `1.5px solid ${type === "error" ? "#ffb3b3" : "#b3f0c9"}`,
  borderRadius: "14px",
  padding: "11px 16px",
  fontSize: "13px",
  color: type === "error" ? "#b91c1c" : "#166534",
  marginBottom: "16px",
  fontFamily: "system-ui, sans-serif",
});