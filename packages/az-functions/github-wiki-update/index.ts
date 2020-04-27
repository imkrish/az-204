import { AzureFunction, Context, HttpRequest } from '@azure/functions';
import * as Crypto from 'crypto';

const httpTrigger: AzureFunction = async function (
  context: Context,
  req: HttpRequest
): Promise<void> {
  const { body } = req;
  const { repository, pages } = body;

  const hmac = Crypto.createHmac('sha1', 'abcd');
  const signature = hmac.update(JSON.stringify(req.body)).digest('hex');
  const shaSignature = `sha1=${signature}`;
  context.log('shaSignature', shaSignature);

  const gitHubSignature = req.headers['x-hub-signature'];
  context.log('gitHubSignature', gitHubSignature);

  context.log(
    'shaSignature.localeCompare',
    shaSignature.localeCompare(gitHubSignature)
  );

  if (shaSignature.localeCompare(gitHubSignature) === -1) {
    context.res = {
      status: 401,
      body: "Signatures don't match",
    };
    return;
  }

  if (!pages[0].title) {
    context.res = {
      status: 400,
      body: 'Invalid payload for Wiki event',
    };
    return;
  }

  context.res = {
    body: `Repo: ${repository.name}, Page is ${pages[0].title}, Action is ${pages[0].action}, Event Type: ${req.headers['x-github-event']}`,
  };
};

export default httpTrigger;
