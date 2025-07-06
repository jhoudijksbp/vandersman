import React, { useEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import { Amplify } from "aws-amplify";
import { generateClient } from "aws-amplify/api";
import awsExports from "../aws-exports";
import { listItems, listItemsByKlant, updateItem } from "../graphql/queries";
import WerkbonForm from "../components/WerkbonForm";
import WerkbonPDFView from "../components/WerkbonPDFView";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { loadJsonFromS3 } from "../utils/s3Loader";
import Select from "react-select";

Amplify.configure(awsExports);
const client = generateClient({ authMode: "userPool" });

function PageEdit({ refreshToken }) {
  const location = useLocation();
  const pdfRef = useRef();

  const [successMessage, setSuccessMessage] = useState(location.state?.successMessage || null);
  const [errorMessage, setErrorMessage] = useState(location.state?.errorMessage || null);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingItem, setEditingItem] = useState(null);
  const [sortConfig, setSortConfig] = useState({ key: "datum", direction: "desc" });
  const [currentPage, setCurrentPage] = useState(1);
  const [klanten, setKlanten] = useState([]);
  const [producten, setProducten] = useState([]);
  const [medewerkers, setMedewerkers] = useState([]);
  const [klantId, setKlantId] = useState("");
  const itemsPerPage = 5;

  useEffect(() => {
    if (!klantId) fetchItems();
    fetchS3Data();
  }, [refreshToken]);

  useEffect(() => {
    fetchItems();
  }, [klantId]);

  useEffect(() => {
    if (successMessage || errorMessage) {
      const timer = setTimeout(() => {
        setSuccessMessage(null);
        setErrorMessage(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [successMessage, errorMessage]);

  const fetchS3Data = async () => {
    try {
      const [productData, klantData, medewerkerData] = await Promise.all([
        loadJsonFromS3("rompslomp_products.json"),
        loadJsonFromS3("rompslomp_contacts.json"),
        loadJsonFromS3("cognito_medewerkers.json"),
      ]);

      setMedewerkers((medewerkerData || []).map((m) => m.medewerker));
      setKlanten((klantData || []).map((k) => ({ id: k.id, name: k.name })));
      setProducten((productData || []).map((p) => ({
        id: p.id,
        name: p.desc,
        price: p.price_with_vat,
        quantity: 1,
      })));
    } catch (err) {
      console.error("Fout bij laden van S3-data:", err);
    }
  };

  const fetchItems = async () => {
    setLoading(true);
    try {
      let result;
      if (klantId) {
        result = await client.graphql({
          query: listItemsByKlant,
          variables: { klant_id: klantId },
        });
        setItems(result.data?.listItemsByKlant || []);
      } else {
        const today = new Date();
        const threeMonthsAgo = new Date();
        threeMonthsAgo.setMonth(today.getMonth() - 3);
        const from = threeMonthsAgo.toISOString();
        const to = today.toISOString();

        result = await client.graphql({
          query: listItems,
          variables: { from, to },
        });
        setItems(result.data?.listItems || []);
      }
    } catch (err) {
      console.error("Fout bij ophalen:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async (item) => {
    const updatedItem = {
      id: item.id,
      datum: new Date().toISOString(),
      datumOpdracht: item.datumOpdracht,
      klant_id: item.klant?.id,
      klant_naam: item.klant?.name,
      medewerker: item.medewerker,
      services: item.services.map((s) => ({
        name: s.name,
        hours: s.hours,
        description: s.description,
      })),
      products: item.products.map((p) => ({
        id: p.product_id,
        name: p.name,
        price: p.price,
        description: p.description,
        quantity: p.quantity,
      })),
      dummy: item.dummy || "werkbon",
    };

    try {
      await client.graphql({
        query: updateItem,
        variables: { input: updatedItem },
      });
      setSuccessMessage("Werkbon succesvol bijgewerkt!");
      setErrorMessage(null);
      setEditingItem(null);
      fetchItems();
    } catch (err) {
      console.error("Fout bij bijwerken:", err);
      setErrorMessage("Er is iets misgegaan bij het opslaan.");
      setSuccessMessage(null);
    }
  };

  const handleDownloadPDF = async () => {
    const input = pdfRef.current;
    if (!input) return;

    const canvas = await html2canvas(input);
    const imgData = canvas.toDataURL("image/png");

    const pdf = new jsPDF("p", "mm", "a4");
    const pageWidth = pdf.internal.pageSize.getWidth();
    const imgProps = pdf.getImageProperties(imgData);
    const pdfHeight = (imgProps.height * pageWidth) / imgProps.width;

    pdf.addImage(imgData, "PNG", 0, 0, pageWidth, pdfHeight);
    pdf.save("werkbon.pdf");
  };

  const sortedItems = [...items].sort((a, b) => {
    const { key, direction } = sortConfig;
    let aVal = a[key];
    let bVal = b[key];

    if (key === "datum" || key === "datumOpdracht") {
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

  const klantOpties = klanten.map((k) => ({
    value: k.id,
    label: k.name,
  }));

  const totalPages = Math.ceil(items.length / itemsPerPage);

  return (
    <div className="p-4 bg-white rounded-lg shadow max-w-6xl mx-auto">
      {successMessage && (
        <div className="mb-4 p-3 rounded bg-green-100 text-green-800 border border-green-300">
          ✅ {successMessage}
        </div>
      )}
      {errorMessage && (
        <div className="mb-4 p-3 rounded bg-red-100 text-red-800 border border-red-300">
          ❌ {errorMessage}
        </div>
      )}

      <h2 className="text-xl font-semibold text-jordygroen mb-4">Werkbonnen</h2>

      <div className="mb-4">
        <label className="block mb-1 text-sm font-medium">Filter op klant</label>
        <Select
          options={[{ value: "", label: "-- Toon alles --" }, ...klantOpties]}
          value={klantOpties.find((opt) => opt.value === klantId) || { value: "", label: "-- Toon alles --" }}
          onChange={(selected) => setKlantId(selected.value)}
          className="react-select-container"
          classNamePrefix="react-select"
        />
      </div>

      {loading ? (
        <p className="text-gray-500">Laden...</p>
      ) : (
        <>
          <div className="overflow-auto">
            <table className="min-w-full table-auto border border-gray-300 text-sm">
              <thead className="bg-gray-100">
                <tr>
                  <th className="border px-3 py-2 cursor-pointer" onClick={() => handleSort("datum")}>
                    Datum
                  </th>
                  <th className="border px-3 py-2 cursor-pointer" onClick={() => handleSort("datumOpdracht")}>
                    Opdracht datum
                  </th>
                  <th className="border px-3 py-2 cursor-pointer" onClick={() => handleSort("klant_naam")}>
                    Klant
                  </th>
                  <th className="border px-3 py-2 cursor-pointer" onClick={() => handleSort("medewerker")}>
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
                    <td className="border px-3 py-2">
                      {item.datumOpdracht
                        ? new Date(item.datumOpdracht).toLocaleDateString("nl-NL")
                        : "-"}
                    </td>
                    <td className="border px-3 py-2">{item.klant_naam}</td>
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
        <div className="mt-6 space-y-4">
          <div className="flex justify-end">
            <button
              onClick={handleDownloadPDF}
              className="bg-jordygroen text-white px-4 py-2 rounded shadow hover:bg-opacity-90"
            >
              📄 Download als PDF
            </button>
          </div>

          <WerkbonForm
            initialData={{
              ...editingItem,
              klant: {
                id: editingItem.klant_id,
                name: editingItem.klant_naam,
              },
              products: (editingItem.products || []).map((p) => ({
                name: p.name,
                price: p.price,
                description: p.description,
                product_id: p.id,
                quantity: p.quantity ?? 1,
              })),
            }}
            onSubmit={handleUpdate}
            klanten={klanten}
            medewerkers={medewerkers}
            productOpties={producten}
            serviceOpties={medewerkers}
            submitLabel="Werkbon opslaan"
          />

          <div className="absolute left-[-9999px] top-0">
            <div ref={pdfRef}>
              <WerkbonPDFView data={editingItem} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default PageEdit;
