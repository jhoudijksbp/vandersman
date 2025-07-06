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
        product_id: p.id,
        quantity: p.quantity ?? 1,
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
        quantity: 1,
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

    if (!datumOpdracht) newErrors.push("Datum opdracht is verplicht.");
    if (!klant) newErrors.push("Klant is verplicht.");
    if (formRows.length === 0) newErrors.push("Voeg minimaal één product of dienst toe.");

    formRows.forEach((row, index) => {
      const rijLabel = `Rij ${index + 1}`;

      if (!row.name) newErrors.push(`${rijLabel}: naam is verplicht.`);

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

        if (!row.quantity || isNaN(row.quantity) || parseInt(row.quantity) <= 0) {
          newErrors.push(`${rijLabel}: aantal moet groter zijn dan 0.`);
        } else if (!/^\d+$/.test(row.quantity)) {
          newErrors.push(`${rijLabel}: aantal moet een geheel getal zijn.`);
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
        quantity: parseInt(row.quantity),
      }));

    const item = {
      ...initialData,
      datumOpdracht,
      klant_id: klant?.id,
      klant_naam: klant?.name,
      medewerker,
      services,
      products,
      dummy: "werkbon",
    };

    onSubmit(item);
  };

  const klantOptions = klanten.map((k) => ({
    value: k.id,
    label: k.name,
  }));

  const productOptions = productOpties.map((p) => ({
    label: p.name,
    value: p.id,
    price: p.price,
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

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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

        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700">Medewerker</label>
          <input
            type="text"
            value={medewerker}
            readOnly
            className="mt-1 block w-full rounded-md border border-gray-300 p-2 bg-gray-100 text-gray-700"
          />
        </div>
      </div>

      <div className="flex gap-4 flex-wrap">
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
        <table className="w-full table-auto border border-gray-300 text-sm">
          <thead className="bg-gray-100">
            <tr>
              <th className="border px-3 py-2">Type</th>
              <th className="border px-3 py-2">Naam</th>
              <th className="border px-3 py-2">Uren</th>
              <th className="border px-3 py-2">Prijs</th>
              <th className="border px-3 py-2">Aantal</th>
              <th className="border px-3 py-2">Beschrijving</th>
              <th className="border px-3 py-2">Actie</th>
            </tr>
          </thead>
          <tbody>
            {formRows.map((row) => (
              <tr key={row.id} className="hover:bg-gray-50">
                <td className="border px-3 py-2">{row.type}</td>
                <td className="border px-3 py-2">
                  {row.type === "Service" ? (
                    <Select
                      classNamePrefix="react-select"
                      options={serviceOpties.map((s) => ({ label: s, value: s }))}
                      value={row.name ? { label: row.name, value: row.name } : null}
                      onChange={(selected) => {
                        updateRow(row.id, "name", selected?.value || "");
                      }}
                      placeholder="Selecteer dienst..."
                      isClearable
                      menuPortalTarget={document.body}
                      menuPosition="fixed"
                      styles={{ menuPortal: (base) => ({ ...base, zIndex: 9999 }) }}
                    />
                  ) : (
                    <Select
                      classNamePrefix="react-select"
                      options={productOptions}
                      value={productOptions.find((opt) => opt.value === row.product_id) || null}
                      onChange={(selected) => {
                        updateRow(row.id, "name", selected?.label || "");
                        updateRow(row.id, "price", selected?.price || "");
                        updateRow(row.id, "product_id", selected?.value || "");
                      }}
                      placeholder="Selecteer product..."
                      isClearable
                      menuPortalTarget={document.body}
                      menuPosition="fixed"
                      styles={{ menuPortal: (base) => ({ ...base, zIndex: 9999 }) }}
                    />
                  )}
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
                  {row.type === "Product" ? (
                    <input
                      type="number"
                      min="1"
                      value={row.quantity}
                      onChange={(e) => updateRow(row.id, "quantity", e.target.value)}
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
