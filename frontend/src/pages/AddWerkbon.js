import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { getCurrentUser, fetchAuthSession } from "aws-amplify/auth";
import { generateClient } from "aws-amplify/api";
import { addItem } from "../graphql/queries";
import WerkbonForm from "../components/WerkbonForm";

const client = generateClient({ authMode: "userPool" });

const EXAMPLE_PRODUCTS = ["Product A", "Product B"];
const EXAMPLE_SERVICES = ["Jip Amiabel", "Timo Siebelink"];
const EXAMPLE_KLANTEN = ["Jan", "Marie"];

function PageAdd() {
  const [defaultValues, setDefaultValues] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchUser() {
      try {
        const session = await fetchAuthSession();
        const payload = session.tokens?.idToken?.payload;
        const fullName = `${payload.given_name} ${payload.family_name}`;
        setDefaultValues({
          medewerker: fullName,
          datumOpdracht: new Date().toISOString().split("T")[0],
        });
      } catch (error) {
        console.error("Fout bij ophalen gebruiker:", error);
      }
    }

    fetchUser();
  }, []);

  const handleSubmit = async (item) => {
    const newItem = {
      ...item,
      id: Date.now().toString(),
      datum: new Date().toISOString(),
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
    <div className="bg-white p-4 rounded-lg shadow max-w-3xl mx-auto">
      <h2 className="text-xl font-semibold text-jordygroen mb-4">Nieuwe werkbon</h2>
      {defaultValues && (
        <WerkbonForm
          onSubmit={handleSubmit}
          klanten={EXAMPLE_KLANTEN}
          medewerkers={[]}
          productOpties={EXAMPLE_PRODUCTS}
          serviceOpties={EXAMPLE_SERVICES}
          submitLabel="Voeg werkbon toe"
          initialData={defaultValues}
        />
      )}
    </div>
  );
}

export default PageAdd;
