const authConfig = {
  Auth: {
    Cognito: {
      userPoolId: "us-west-1_RPZ4m83Ha",
      userPoolClientId: "2ut412jfflc23jr4vonpgcoqsf",
      loginWith: {
        oauth: {
          domain: "vandersman-werkbon-app.auth.us-west-1.amazoncognito.com",
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