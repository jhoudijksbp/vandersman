import React, { useEffect, useState } from "react";

function WerkbonForm({
  initialData = {},
  onSubmit,
  klanten = [],
  medewerkers = [],
  productOpties = [],
  serviceOpties = [],
  submitLabel = "Opslaan werkbon"
}) {
  const [formRows, setFormRows] = useState([]);
  const [medewerker, setMedewerker] = useState(initialData.medewerker || "");
  const [klant, setKlant] = useState(initialData.klant || "");

  useEffect(() => {
    if (initialData.services || initialData.products) {
      const serviceRows = (initialData.services || []).map((s, i) => ({
        id: `s-${i}`,
        type: "Service",
        name: s.name,
        hours: s.hours,
        description: s.description
      }));
      const productRows = (initialData.products || []).map((p, i) => ({
        id: `p-${i}`,
        type: "Product",
        name: p.name,
        price: p.price,
        description: p.description
      }));
      setFormRows([...serviceRows, ...productRows]);
    }
  }, [initialData]);

  const addFormRow = (type) => {
    setFormRows((prev) => [
      ...prev,
      {
        id: Date.now().toString(),
        type,
        name: "",
        hours: "",
        price: "",
        description: "",
      },
    ]);
  };

  const updateRow = (id, field, value) => {
    setFormRows((prev) =>
      prev.map((row) => (row.id === id ? { ...row, [field]: value } : row))
    );
  };

  const removeRow = (id) => {
    setFormRows((prev) => prev.filter((row) => row.id !== id));
  };

  const handleSubmit = () => {
    const services = formRows
      .filter((row) => row.type === "Service")
      .map((row) => ({
        name: row.name,
        hours: parseFloat(row.hours),
        description: row.description,
      }));

    const products = formRows
      .filter((row) => row.type === "Product")
      .map((row) => ({
        name: row.name,
        price: parseFloat(row.price),
        description: row.description,
      }));

    const item = {
      ...initialData,
      klant,
      medewerker,
      services,
      products,
    };

    onSubmit(item);
  };

  return (
    <div className="space-y-6 mt-6">
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1">
          <label className="block text-sm font-medium text-gray-700">Klant</label>
          <select
            value={klant}
            onChange={(e) => setKlant(e.target.value)}
            className="mt-1 block w-full rounded-md border border-gray-300 p-2 focus:border-jordygroen focus:ring-jordygroen"
          >
            <option value="">Selecteer...</option>
            {klanten.map((k) => (
              <option key={k} value={k}>{k}</option>
            ))}
          </select>
        </div>
        <div className="flex-1">
          <label className="block text-sm font-medium text-gray-700">Medewerker</label>
          <select
            value={medewerker}
            onChange={(e) => setMedewerker(e.target.value)}
            className="mt-1 block w-full rounded-md border border-gray-300 p-2 focus:border-jordygroen focus:ring-jordygroen"
          >
            <option value="">Selecteer...</option>
            {medewerkers.map((m) => (
              <option key={m} value={m}>{m}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="flex gap-4">
        <button type="button" onClick={() => addFormRow("Service")} className="bg-jordygroen text-white px-3 py-2 rounded hover:bg-opacity-90">
          + Voeg dienst toe
        </button>
        <button type="button" onClick={() => addFormRow("Product")} className="bg-jordygroen text-white px-3 py-2 rounded hover:bg-opacity-90">
          + Voeg product toe
        </button>
      </div>

      <div className="overflow-auto">
        <table className="min-w-full table-auto border border-gray-300 text-sm">
          <thead className="bg-gray-100">
            <tr>
              <th className="border px-3 py-2">Type</th>
              <th className="border px-3 py-2">Naam</th>
              <th className="border px-3 py-2">Uren</th>
              <th className="border px-3 py-2">Prijs</th>
              <th className="border px-3 py-2">Beschrijving</th>
              <th className="border px-3 py-2">Actie</th>
            </tr>
          </thead>
          <tbody>
            {formRows.map((row) => (
              <tr key={row.id} className="hover:bg-gray-50">
                <td className="border px-3 py-2">{row.type}</td>
                <td className="border px-3 py-2">
                  <select
                    value={row.name}
                    onChange={(e) => updateRow(row.id, "name", e.target.value)}
                    className="w-full border rounded p-1"
                  >
                    <option value="">Selecteer...</option>
                    {(row.type === "Service" ? serviceOpties : productOpties).map((opt) => (
                      <option key={opt} value={opt}>{opt}</option>
                    ))}
                  </select>
                </td>
                <td className="border px-3 py-2">
                  {row.type === "Service" ? (
                    <input
                      type="number"
                      value={row.hours}
                      onChange={(e) => updateRow(row.id, "hours", e.target.value)}
                      className="w-full border rounded p-1"
                    />
                  ) : (
                    "-"
                  )}
                </td>
                <td className="border px-3 py-2">
                  {row.type === "Product" ? (
                    <input
                      type="number"
                      value={row.price}
                      onChange={(e) => updateRow(row.id, "price", e.target.value)}
                      className="w-full border rounded p-1"
                    />
                  ) : (
                    "-"
                  )}
                </td>
                <td className="border px-3 py-2">
                  <input
                    type="text"
                    value={row.description}
                    onChange={(e) => updateRow(row.id, "description", e.target.value)}
                    className="w-full border rounded p-1"
                  />
                </td>
                <td className="border px-3 py-2 text-center">
                  <button
                    type="button"
                    onClick={() => removeRow(row.id)}
                    className="text-red-600 hover:underline"
                  >
                    Verwijder
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {formRows.length > 0 && (
        <div>
          <button
            onClick={handleSubmit}
            className="mt-4 bg-jordygroen text-white px-4 py-2 rounded hover:bg-opacity-90"
          >
            {submitLabel}
          </button>
        </div>
      )}
    </div>
  );
}

export default WerkbonForm;
