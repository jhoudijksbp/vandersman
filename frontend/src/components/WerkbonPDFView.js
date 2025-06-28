import React from "react";

function WerkbonPDFView({ data }) {
  if (!data) return null;

  const { datumOpdracht, klant, medewerker, services = [], products = [] } = data;

  // Haal handtekening op uit sessionStorage
  const klantHandtekening = sessionStorage.getItem("klantHandtekening");

  return (
    <div className="p-6 space-y-6 text-sm text-black" style={{ width: "18cm", backgroundColor: "white" }}>
      <div className="space-y-2">
        <h2 className="text-xl font-bold text-jordygroen">Werkbon</h2>
        <div><strong>Datum opdracht:</strong> {datumOpdracht}</div>
        <div><strong>Klant:</strong> {klant}</div>
        <div><strong>Medewerker:</strong> {medewerker}</div>
      </div>

      <div>
        <h3 className="font-semibold mt-4 mb-2">Diensten</h3>
        {services.length > 0 ? (
          <table className="w-full border border-gray-300 text-sm">
            <thead className="bg-gray-100">
              <tr>
                <th className="border px-2 py-1 text-left">Naam</th>
                <th className="border px-2 py-1 text-left">Uren</th>
                <th className="border px-2 py-1 text-left">Beschrijving</th>
              </tr>
            </thead>
            <tbody>
              {services.map((s, i) => (
                <tr key={i}>
                  <td className="border px-2 py-1">{s.name}</td>
                  <td className="border px-2 py-1">{s.hours}</td>
                  <td className="border px-2 py-1">{s.description}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p>Geen diensten toegevoegd.</p>
        )}
      </div>

      <div>
        <h3 className="font-semibold mt-4 mb-2">Producten</h3>
        {products.length > 0 ? (
          <table className="w-full border border-gray-300 text-sm">
            <thead className="bg-gray-100">
              <tr>
                <th className="border px-2 py-1 text-left">Naam</th>
                <th className="border px-2 py-1 text-left">Prijs</th>
                <th className="border px-2 py-1 text-left">Beschrijving</th>
              </tr>
            </thead>
            <tbody>
              {products.map((p, i) => (
                <tr key={i}>
                  <td className="border px-2 py-1">{p.name}</td>
                  <td className="border px-2 py-1">€ {parseFloat(p.price).toFixed(2)}</td>
                  <td className="border px-2 py-1">{p.description}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p>Geen producten toegevoegd.</p>
        )}
      </div>

      <div className="mt-12 flex justify-between pt-8">
        <div className="text-center w-1/2">
          <div className="h-24 border-t border-black w-4/5 mx-auto"></div>
          <div className="mt-1 font-medium">Jordy van der Sman Hoveniers</div>
        </div>
        <div className="text-center w-1/2">
          {klantHandtekening && (
            <img
              src={klantHandtekening}
              alt="Handtekening klant"
              style={{ width: "200px", margin: "0 auto" }}
            />
          )}
          <div className="h-24 border-t border-black w-4/5 mx-auto mt-2"></div>
          <div className="mt-1 font-medium">{klant}</div>
        </div>
      </div>
    </div>
  );
}

export default WerkbonPDFView;
