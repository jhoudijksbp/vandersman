import React, { useEffect, useState } from "react";
import Select from "react-select";

function WerkbonForm({
  initialData = {},
  onSubmit,
  klanten = [],
  medewerkers = [],
  productOpties = [],
  serviceOpties = [],
  submitLabel = "Opslaan werkbon",
  signatureRef,
}) {
  const [formRows, setFormRows] = useState([]);
  const [medewerker] = useState(initialData.medewerker || "");
  const [klant, setKlant] = useState(initialData.klant || null);
  const [datumOpdracht, setDatumOpdracht] = useState(
    initialData.datumOpdracht || new Date().toISOString().split("T")[0]
  );
  const [errors, setErrors] = useState([]);

  useEffect(() => {
    if (initialData.services || initialData.products) {
      const serviceRows = (initialData.services || []).map((s, i) => ({
        id: `s-${i}`,
        type: "Service",
        name: s.name,
        hours: s.hours,
        description: s.description,
      }));
      const productRows = (initialData.products || []).map((p, i) => ({
        id: `p-${i}`,
        type: "Product",
        name: p.name,
        price: p.price,
        description: p.description,
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
        product_id: "",
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

  const validateForm = () => {
    const newErrors = [];

    if (!datumOpdracht) {
      newErrors.push("Datum opdracht is verplicht.");
    }

    if (!klant) {
      newErrors.push("Klant is verplicht.");
    }

    if (formRows.length === 0) {
      newErrors.push("Voeg minimaal één product of dienst toe.");
    }

    formRows.forEach((row, index) => {
      const rijLabel = `Rij ${index + 1}`;

      if (!row.name) {
        newErrors.push(`${rijLabel}: naam is verplicht.`);
      }

      if (row.type === "Service") {
        const clean = row.hours?.toString().replace(",", ".");
        const hours = parseFloat(clean);
        if (!row.hours || isNaN(hours) || hours <= 0) {
          newErrors.push(`${rijLabel}: uren moeten groter zijn dan 0.`);
        } else if (!/^\d+([.,]\d{1})?$/.test(row.hours)) {
          newErrors.push(`${rijLabel}: uren mogen maximaal 1 cijfer achter de komma hebben.`);
        }
      }

      if (row.type === "Product") {
        const clean = row.price?.toString().replace(",", ".");
        const price = parseFloat(clean);
        if (!row.price || isNaN(price) || price <= 0) {
          newErrors.push(`${rijLabel}: prijs moet een geldig getal groter dan 0 zijn.`);
        } else if (!/^\d+([.,]\d{1,2})?$/.test(row.price)) {
          newErrors.push(`${rijLabel}: prijs mag maximaal 2 cijfers achter de komma hebben.`);
        }
      }
    });

    setErrors(newErrors);
    return newErrors.length === 0;
  };

  const handleSubmit = () => {
    if (!validateForm()) return;

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
        id: row.product_id,
        name: row.name,
        price: parseFloat((row.price || "").toString().replace(",", ".")),
        description: row.description,
      }));

    const item = {
      ...initialData,
      datumOpdracht,
      klant_id: klant?.id,
      klant_naam: klant?.name,
      medewerker,
      services,
      products,
    };
    onSubmit(item);
  };

  const klantOptions = klanten.map((k) => ({
    value: k.id,
    label: k.name,
  }));

  return (
    <div className="space-y-6 mt-6">
      {errors.length > 0 && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          <ul className="list-disc list-inside">
            {errors.map((err, i) => (
              <li key={i}>{err}</li>
            ))}
          </ul>
        </div>
      )}

      <div className="flex flex-col gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Datum opdracht</label>
          <input
            type="date"
            value={datumOpdracht}
            onChange={(e) => setDatumOpdracht(e.target.value)}
            className="mt-1 block w-full rounded-md border border-gray-300 p-2 focus:border-jordygroen focus:ring-jordygroen"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Klant</label>
          <Select
            className="mt-1"
            options={klantOptions}
            value={klant ? { value: klant.id, label: klant.name } : null}
            onChange={(selected) => {
              const match = klanten.find((k) => k.id === selected?.value);
              setKlant(match || null);
            }}
            placeholder="Zoek klant..."
            isClearable
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Medewerker</label>
          <input
            type="text"
            value={medewerker}
            readOnly
            className="mt-1 block w-full rounded-md border border-gray-300 p-2 bg-gray-100 text-gray-700"
          />
        </div>
      </div>

      <div className="flex gap-4">
        <button
          type="button"
          onClick={() => addFormRow("Service")}
          className="bg-jordygroen text-white px-3 py-2 rounded hover:bg-opacity-90"
        >
          + Voeg dienst toe
        </button>
        <button
          type="button"
          onClick={() => addFormRow("Product")}
          className="bg-jordygroen text-white px-3 py-2 rounded hover:bg-opacity-90"
        >
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
                    onChange={(e) => {
                      const selectedValue = e.target.value;
                      if (row.type === "Product") {
                        const selected = productOpties.find(p => p.name === selectedValue);
                        updateRow(row.id, "name", selected?.name || "");
                        updateRow(row.id, "price", selected?.price || "");
                        updateRow(row.id, "product_id", selected?.id || "");
                      } else {
                        updateRow(row.id, "name", selectedValue);
                      }
                    }}
                    className="w-full border rounded p-1"
                  >
                    <option value="">Selecteer...</option>
                    {(row.type === "Service" ? serviceOpties : productOpties).map((opt) =>
                      typeof opt === "string" ? (
                        <option key={opt} value={opt}>
                          {opt}
                        </option>
                      ) : (
                        <option key={opt.id} value={opt.name}>
                          {opt.name}
                        </option>
                      )
                    )}
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
                      type="text"
                      value={row.price ?? ""}
                      onChange={(e) => updateRow(row.id, "price", e.target.value)}
                      className="w-full border rounded p-1"
                      placeholder="Bijv. 12,50"
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
