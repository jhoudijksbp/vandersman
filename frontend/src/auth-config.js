const authConfig = {
  Auth: {
    Cognito: {
      userPoolId: "us-west-1_MONtCFw7A",
      userPoolClientId: "398dfmu4qjrp1enfj45v2suvcm",
      loginWith: {
        oauth: {
          domain: "jvds-werkbon-app.auth.us-west-1.amazoncognito.com",
          scopes: ["email", "openid", "profile"],
          redirectSignIn: ["http://localhost:3000/"],
          redirectSignOut: ["http://localhost:3000/"],
          responseType: "code"
        }
      }
    }
  }
};

export default authConfig;