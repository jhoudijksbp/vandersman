import {
  S3Client,
  GetObjectCommand
} from "@aws-sdk/client-s3";
import { fromCognitoIdentityPool } from "@aws-sdk/credential-provider-cognito-identity";
import { fetchAuthSession, getCurrentUser } from "aws-amplify/auth";
import authConfig from "../auth-config";

const { identityPoolId, s3Region, s3Bucket } = authConfig.App;

async function getS3ClientWithAuthenticatedUser() {
  const user = await getCurrentUser();
  const session = await fetchAuthSession();

  const idToken = session.tokens?.idToken?.toString();
  const userPoolId = authConfig.Auth.Cognito.userPoolId;
  const providerUrl = `cognito-idp.${s3Region}.amazonaws.com/${userPoolId}`;

  const credentials = fromCognitoIdentityPool({
    identityPoolId,
    clientConfig: { region: s3Region },
    logins: {
      [providerUrl]: idToken
    }
  });

  return new S3Client({
    region: s3Region,
    credentials
  });
}

export async function loadJsonFromS3(key) {
  const client = await getS3ClientWithAuthenticatedUser();

  const command = new GetObjectCommand({
    Bucket: s3Bucket,
    Key: key
  });

  const response = await client.send(command);
  const jsonString = await response.Body.transformToString();
  return JSON.parse(jsonString);
}
