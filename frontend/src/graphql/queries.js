export const listItems = /* GraphQL */ `
  query ListItems {
    listItems {
      id
      klant
      medewerker
      datum
      products {
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
      klant
      medewerker
      products {
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
      klant
      medewerker
      datum
      products {
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

