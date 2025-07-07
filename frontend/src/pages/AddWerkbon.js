import { useNavigate } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import { fetchAuthSession } from "aws-amplify/auth";
import { generateClient } from "aws-amplify/api";
import { addItem } from "../graphql/queries";
import WerkbonForm from "../components/WerkbonForm";
import { loadJsonFromS3 } from "../utils/s3Loader";

const client = generateClient({ authMode: "userPool" });

function PageAdd({ refreshToken }) {
  const navigate = useNavigate();
  const [defaultValues, setDefaultValues] = useState(null);
  const [klanten, setKlanten] = useState([]);
  const [producten, setProducten] = useState([]);
  const [medewerkers, setMedewerkers] = useState([]);
  const hasMounted = useRef(false);

  useEffect(() => {
    const fetchInitialData = async (skipCache = false) => {
      try {
        const session = await fetchAuthSession();
        const payload = session.tokens?.idToken?.payload;
        const fullName = `${payload.given_name} ${payload.family_name}`;

        const [productenData, klantenData, medewerkersData] = await Promise.all([
          loadJsonFromS3("rompslomp_products.json", skipCache),
          loadJsonFromS3("rompslomp_contacts.json", skipCache),
          loadJsonFromS3("cognito_medewerkers.json", skipCache),
        ]);

        setDefaultValues({
          medewerker: fullName,
          datumOpdracht: new Date().toISOString().split("T")[0],
        });

        setProducten((productenData || []).map((p) => ({
          id: p.id,
          name: p.desc,
          price: p.price_with_vat,
          quantity: 1,
        })));

        setKlanten((klantenData || []).map((k) => ({
          id: k.id,
          name: k.name,
        })));

        setMedewerkers((medewerkersData || []).map((m) => m.medewerker));
      } catch (error) {
        console.error("Fout bij initialisatie:", error);
      }
    };

    if (!hasMounted.current) {
      hasMounted.current = true;
      fetchInitialData(false); // eerste keer, géén cache skip
    } else {
      fetchInitialData(true); // bij refreshToken change → skip cache
    }
  }, [refreshToken]);

  const handleSubmit = async (item) => {
    const newItem = {
      id: Date.now().toString(),
      datum: new Date().toISOString(),
      datumOpdracht: item.datumOpdracht,
      klant_id: item.klant_id,
      klant_naam: item.klant_naam,
      medewerker: item.medewerker,
      services: item.services,
      products: item.products,
      dummy: "werkbon",
    };

    try {
      await client.graphql({
        query: addItem,
        variables: { input: newItem },
      });
      navigate("/edit", {
        state: { successMessage: "Werkbon succesvol toegevoegd!" },
      });
    } catch (err) {
      console.error("Fout bij toevoegen:", err);
      navigate("/edit", {
        state: { errorMessage: "Fout bij toevoegen van werkbon." },
      });
    }
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow max-w-screen-xl mx-auto">
      <h2 className="text-xl font-semibold text-jordygroen mb-4">Nieuwe werkbon</h2>
      {defaultValues && (
        <WerkbonForm
          onSubmit={handleSubmit}
          klanten={klanten}
          medewerkers={[]} // nog niet uit JSON
          productOpties={producten}
          serviceOpties={medewerkers}
          submitLabel="Voeg werkbon toe"
          initialData={defaultValues}
        />
      )}
    </div>
  );
}

export default PageAdd;
