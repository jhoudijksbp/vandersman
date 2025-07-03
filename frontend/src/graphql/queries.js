export const listItems = /* GraphQL */ `
  query ListItems {
    listItems {
      id
      klant_id
      klant_naam
      medewerker
      datum
      datumOpdracht
      products {
        id
        name
        price
        description
      }
      services {
        name
        hours
        description
      }
    }
  }
`;

export const addItem = /* GraphQL */ `
  mutation AddItem($input: NewItemInput!) {
    addItem(input: $input) {
      id
      klant_id
      klant_naam
      medewerker
      datum
      datumOpdracht
      products {
        id
        name
        price
        description
      }
      services {
        name
        hours
        description
      }
    }
  }
`;

export const updateItem = /* GraphQL */ `
  mutation UpdateItem($input: UpdateItemInput!) {
    updateItem(input: $input) {
      id
      klant_id
      klant_naam
      medewerker
      datum
      datumOpdracht
      products {
        id
        name
        price
        description
      }
      services {
        name
        hours
        description
      }
    }
  }
`;
