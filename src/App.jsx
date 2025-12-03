import { useEffect, useState } from "react";

// ⬇️ PONÉ ACÁ TU URL DE SHEETDB
const API_URL = "https://sheetdb.io/api/v1/o4iy8coei0doo";

function App() {
  const [recipes, setRecipes] = useState([]);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Load recipes from Google Sheet (via SheetDB)
  useEffect(() => {
    async function fetchRecipes() {
      try {
        setLoading(true);
        const res = await fetch(API_URL);
        if (!res.ok) {
          throw new Error("Failed to fetch recipes");
        }
        const data = await res.json();

        // Format data from the sheet
        const formatted = data.map((row) => ({
          id: row.id,
          name: row.name,
          ingredients: row.ingredients
            ? row.ingredients.split(",").map((i) => i.trim()).filter(Boolean)
            : [],
          method: row.method || "",
          glass: row.glass || "",
          garnish: row.garnish || "",
        }));

        setRecipes(formatted);
      } catch (err) {
        console.error(err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchRecipes();
  }, []);

const normalizedQuery = query.toLowerCase().trim();

const filteredRecipes = recipes.filter((recipe) => {
  if (!normalizedQuery) return true;

  const inName = recipe.name?.toLowerCase().includes(normalizedQuery);
  const inGlass = recipe.glass?.toLowerCase().includes(normalizedQuery);
  const inGarnish = recipe.garnish?.toLowerCase().includes(normalizedQuery);
  const inIngredients = recipe.ingredients?.some((ing) =>
    ing.toLowerCase().includes(normalizedQuery)
  );
  const inMethod = recipe.method?.toLowerCase().includes(normalizedQuery);

  return inName || inGlass || inGarnish || inIngredients || inMethod;
});


  return (
    <div className="min-h-screen bg-slate-900 text-slate-50">
      <div className="max-w-lg mx-auto px-4 pb-6">
        {/* Sticky header + search */}
        <header className="sticky top-0 z-10 bg-slate-900/95 backdrop-blur border-b border-slate-800 -mx-4 px-4 pt-4 pb-3 mb-3">
          <h1 className="text-2xl font-bold text-center mb-3">
            Cocktail Recipe Finder 🍸
          </h1>

          <input
            type="text"
            placeholder="Search by name, ingredient, glass..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full p-3 rounded-xl bg-slate-800 border border-slate-700 text-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400"
          />

          <p className="mt-2 text-xs text-slate-400 text-right">
            {loading
              ? "Loading recipes..."
              : error
              ? "Error loading recipes"
              : `${filteredRecipes.length} recipe${
                  filteredRecipes.length !== 1 ? "s" : ""
                } found`}
          </p>
        </header>

        <main className="space-y-3">
          {error && (
            <div className="rounded-xl border border-red-500/50 bg-red-500/10 p-4 text-sm text-red-200">
              {error}
            </div>
          )}

          {!error && loading && (
            <div className="rounded-xl border border-slate-700 bg-slate-800 p-4 text-sm text-slate-300">
              Loading recipes…
            </div>
          )}

          {!loading && !error && filteredRecipes.length === 0 && (
            <div className="rounded-xl border border-slate-700 bg-slate-800 p-4 text-center text-sm text-slate-300">
              No recipes found for <strong>{query}</strong>. Try another word.
            </div>
          )}

          {!loading &&
            !error &&
            filteredRecipes.map((recipe) => (
              <article
                key={recipe.id || recipe.name}
                className="bg-slate-800 rounded-xl border border-slate-700 p-3 shadow-md space-y-2"
              >
                <header>
                  <h2 className="text-lg font-semibold">{recipe.name}</h2>
                  <p className="text-xs text-slate-400">
                    Glass:{" "}
                    <span className="font-medium">
                      {recipe.glass || "—"}
                    </span>
                    {recipe.garnish && (
                      <>
                        {" "}
                        · Garnish:{" "}
                        <span className="font-medium">
                          {recipe.garnish}
                        </span>
                      </>
                    )}
                  </p>
                </header>

                {recipe.ingredients?.length > 0 && (
                  <section>
                    <h3 className="text-xs font-semibold text-slate-300 mb-1">
                      Ingredients
                    </h3>
                    <ul className="text-xs text-slate-200 list-disc list-inside space-y-0.5">
                      {recipe.ingredients.map((ing) => (
                        <li key={ing}>{ing}</li>
                      ))}
                    </ul>
                  </section>
                )}

                {recipe.method && (
                  <section>
                    <h3 className="text-xs font-semibold text-slate-300 mb-1">
                      Method
                    </h3>
                    <p className="text-xs text-slate-200 whitespace-pre-line">
                      {recipe.method}
                    </p>
                  </section>
                )}
              </article>
            ))}
        </main>
      </div>
    </div>
  );
}

export default App;
