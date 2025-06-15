import React, { useEffect, useState } from "react";
import { Amplify } from "aws-amplify";
import { generateClient } from "aws-amplify/api";
import awsExports from "../aws-exports";
import { listItems, updateItem } from "../graphql/queries";
import WerkbonForm from "../components/WerkbonForm";

Amplify.configure(awsExports);
const client = generateClient();

const EXAMPLE_PRODUCTS = ["Product A", "Product B"];
const EXAMPLE_SERVICES = ["Jip Amiabel", "Timo Siebelink"];
const EXAMPLE_MEDEWERKERS = ["Piet", "Klaas"];
const EXAMPLE_KLANTEN = ["Jan", "Marie"];

function PageEdit() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingItem, setEditingItem] = useState(null);
  const [sortConfig, setSortConfig] = useState({ key: "datum", direction: "desc" });
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  useEffect(() => {
    fetchItems();
  }, []);

  const fetchItems = async () => {
    setLoading(true);
    try {
      const result = await client.graphql({ query: listItems });
      setItems(result.data.listItems || []);
    } catch (err) {
      console.error("Fout bij ophalen:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async (item) => {
    const updatedItem = {
      ...item,
      datum: new Date().toISOString(),
    };
    try {
      await client.graphql({ query: updateItem, variables: { input: updatedItem } });
      alert("Werkbon bijgewerkt!");
      setEditingItem(null);
      fetchItems();
    } catch (err) {
      console.error("Fout bij bijwerken:", err);
    }
  };

  const sortedItems = [...items].sort((a, b) => {
    const { key, direction } = sortConfig;
    let aVal = a[key];
    let bVal = b[key];

    if (key === "datum") {
      aVal = new Date(aVal);
      bVal = new Date(bVal);
    }

    if (aVal < bVal) return direction === "asc" ? -1 : 1;
    if (aVal > bVal) return direction === "asc" ? 1 : -1;
    return 0;
  });

  const paginatedItems = sortedItems.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleSort = (key) => {
    setSortConfig((prev) => {
      if (prev.key === key) {
        return { key, direction: prev.direction === "asc" ? "desc" : "asc" };
      }
      return { key, direction: "asc" };
    });
  };

  const totalPages = Math.ceil(items.length / itemsPerPage);

  return (
    <div className="p-4 bg-white rounded-lg shadow max-w-6xl mx-auto">
      <h2 className="text-xl font-semibold text-jordygroen mb-4">Werkbonnen</h2>

      {loading ? (
        <p className="text-gray-500">Laden...</p>
      ) : (
        <>
          <div className="overflow-auto">
            <table className="min-w-full table-auto border border-gray-300 text-sm">
              <thead className="bg-gray-100">
                <tr>
                  <th
                    className="border px-3 py-2 cursor-pointer"
                    onClick={() => handleSort("datum")}
                  >
                    Datum
                  </th>
                  <th
                    className="border px-3 py-2 cursor-pointer"
                    onClick={() => handleSort("klant")}
                  >
                    Klant
                  </th>
                  <th
                    className="border px-3 py-2 cursor-pointer"
                    onClick={() => handleSort("medewerker")}
                  >
                    Medewerker
                  </th>
                  <th className="border px-3 py-2">Acties</th>
                </tr>
              </thead>
              <tbody>
                {paginatedItems.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50">
                    <td className="border px-3 py-2">
                      {new Date(item.datum).toLocaleDateString("nl-NL", {
                        day: "2-digit",
                        month: "2-digit",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </td>
                    <td className="border px-3 py-2">{item.klant}</td>
                    <td className="border px-3 py-2">{item.medewerker}</td>
                    <td className="border px-3 py-2 text-center">
                      <button
                        onClick={() => setEditingItem(item)}
                        className="text-jordygroen hover:underline"
                      >
                        ✏️ Bewerken
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex justify-center mt-4 space-x-2">
            <button
              onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
              disabled={currentPage === 1}
              className="px-3 py-1 border rounded text-jordygroen border-jordygroen hover:bg-jordygroen/10 transition-colors duration-200 disabled:opacity-50"
            >
              Vorige
            </button>
            <span className="px-2 py-1 text-jordygroen">
              Pagina {currentPage} van {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="px-3 py-1 border rounded text-jordygroen border-jordygroen hover:bg-jordygroen/10 transition-colors duration-200 disabled:opacity-50"
            >
              Volgende
            </button>
          </div>
        </>
      )}

      {editingItem && (
        <div className="mt-6">
          <WerkbonForm
            initialData={editingItem}
            onSubmit={handleUpdate}
            klanten={EXAMPLE_KLANTEN}
            medewerkers={EXAMPLE_MEDEWERKERS}
            productOpties={EXAMPLE_PRODUCTS}
            serviceOpties={EXAMPLE_SERVICES}
            submitLabel="Werkbon opslaan"
          />
        </div>
      )}
    </div>
  );
}

export default PageEdit;
