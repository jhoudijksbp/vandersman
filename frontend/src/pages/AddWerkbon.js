import { generateClient } from "aws-amplify/api";
import { addItem } from "../graphql/queries";
import WerkbonForm from "../components/WerkbonForm";

const client = generateClient();

const EXAMPLE_PRODUCTS = ["Product A", "Product B"];
const EXAMPLE_SERVICES = ["Jip Amiabel", "Timo Siebelink"];
const EXAMPLE_MEDEWERKERS = ["Piet", "Klaas"];
const EXAMPLE_KLANTEN = ["Jan", "Marie"];

function PageAdd() {
  const handleSubmit = async (item) => {
    const newItem = {
      ...item,
      id: Date.now().toString(),
      datum: new Date().toISOString(),
    };
    try {
      await client.graphql({ query: addItem, variables: { input: newItem } });
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
        medewerkers={EXAMPLE_MEDEWERKERS}
        productOpties={EXAMPLE_PRODUCTS}
        serviceOpties={EXAMPLE_SERVICES}
        submitLabel="Voeg werkbon toe"
      />
    </div>
  );
}

export default PageAdd;
