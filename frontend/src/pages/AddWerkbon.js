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
  const [medewerkers, setMedewerkers] = useState([]);
  const [defaultValues, setDefaultValues] = useState(null);

  useEffect(() => {
    async function fetchUser() {
      try {
        const user = await getCurrentUser();
        const session = await fetchAuthSession();
        const payload = session.tokens?.idToken?.payload;

        const fullName = `${payload.given_name} ${payload.family_name}`;
        setMedewerkers([fullName]);
        setDefaultValues({ medewerker: fullName }); // standaard selectie
      } catch (error) {
        console.error("Fout bij ophalen gebruiker:", error);
      }
    }

    fetchUser();
  }, []);

  const handleSubmit = async (item) => {
    console.log(item)
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
      alert("Werkbon toegevoegd!");
    } catch (err) {
      console.error("Fout bij toevoegen:", err);
    }
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow max-w-3xl mx-auto">
      <h2 className="text-xl font-semibold text-jordygroen mb-4">Nieuwe werkbon</h2>
      <WerkbonForm
        onSubmit={handleSubmit}
        klanten={EXAMPLE_KLANTEN}
        medewerkers={medewerkers}
        productOpties={EXAMPLE_PRODUCTS}
        serviceOpties={EXAMPLE_SERVICES}
        submitLabel="Voeg werkbon toe"
        defaultValues={defaultValues}
      />
    </div>
  );
}

export default PageAdd;
