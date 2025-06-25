import { useEffect, useState } from "react";

function WerkbonForm({
  onSubmit,
  klanten,
  medewerkers,
  productOpties,
  serviceOpties,
  submitLabel,
  defaultValues,
}) {
  const [formData, setFormData] = useState({
    klant: "",
    medewerker: "",
    product: "",
    service: "",
    omschrijving: "",
  });

  // Zorg dat defaultValues correct geladen worden als ze binnenkomen
  useEffect(() => {
    if (defaultValues) {
      setFormData((prev) => ({
        ...prev,
        ...defaultValues,
      }));
    }
  }, [defaultValues]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Klant */}
      <div>
        <label className="block mb-1">Klant</label>
        <select
          name="klant"
          value={formData.klant}
          onChange={handleChange}
          className="w-full border p-2"
        >
          <option value="">Selecteer klant</option>
          {klanten.map((k) => (
            <option key={k} value={k}>
              {k}
            </option>
          ))}
        </select>
      </div>

      {/* Medewerker */}
      <div>
        <label className="block mb-1">Medewerker</label>
        <select
          name="medewerker"
          value={formData.medewerker}
          onChange={handleChange}
          className="w-full border p-2"
        >
          <option value="">Selecteer medewerker</option>
          {medewerkers.map((m) => (
            <option key={m} value={m}>
              {m}
            </option>
          ))}
        </select>
      </div>

      {/* Andere velden (product, service, omschrijving) kun je op dezelfde manier invullen */}

      <button type="submit" className="bg-jordygroen text-white py-2 px-4 rounded">
        {submitLabel}
      </button>
    </form>
  );
}

export default WerkbonForm;
