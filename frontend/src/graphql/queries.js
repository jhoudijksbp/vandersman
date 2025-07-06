export const listItems = /* GraphQL */ `
  query ListItems($from: AWSDateTime!, $to: AWSDateTime!) {
    listItems(from: $from, to: $to) {
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
        quantity
      }
      services {
        name
        hours
        description
      }
    }
  }
`;

export const listItemsByKlant = /* GraphQL */ `
  query ListItemsByKlant($klant_id: ID!) {
    listItemsByKlant(klant_id: $klant_id) {
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
        quantity
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
      dummy
      products {
        id
        name
        price
        description
        quantity
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
      dummy
      products {
        id
        name
        price
        description
        quantity
      }
      services {
        name
        hours
        description
      }
    }
  }
`;

export const triggerDataJobs = /* GraphQL */ `
  mutation TriggerDataJobs {
    triggerGetCognitoJob {
      message
      status
    }
    triggerRomsplompDataJob {
      message
      status
    }
  }
`;
