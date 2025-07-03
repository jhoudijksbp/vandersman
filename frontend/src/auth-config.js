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
  },
  App: {
    identityPoolId: "us-west-1:76cef662-a08c-4f6c-b28b-4ae3d2f1db83",
    s3Region: "us-west-1",
    s3Bucket: "vandersman-rompslomp-data"
  }
};

export default authConfig;