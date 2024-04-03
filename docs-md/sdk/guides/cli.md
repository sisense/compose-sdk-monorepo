# CLI

Use the Compose SDK CLI to work with your Compose SDK project.

The CLI has the following commands:

- [`get-data-model`](#get-data-model): Creates a [TypeScript representation of a data model](./data-model.md)
- [`get-api-token`](#get-api-token): Gets an [API token for authentication](../authentication-security.md#api-token)

## get-data-model

The `get-data-model` command creates a [TypeScript representation of a data model](./data-model.md). Use either a username/password, API token, or WAT token to authenticate when running this command.

### Options

- `dataSource` - (`string`): The name of the data model to create a TypeScript representation of
- `output` - (`string` | `undefined`): The `*.ts` file to write the data model file to
- `password` - (`string` | `undefined`): Password when using username/password authentication (if omitted when using a username/password to authenticate, the CLI will prompt you to enter your password)
- `token` - (`string` | `undefined`): API token when using API token authentication
- `url` - (`string`): URL of the Sisense instance that contains your data model
- `username` - (`string` | `undefined`): Username when using username/password authentication
- `wat` -  (`string` | `undefined`): WAT token when using WAT authentication

### Example

This example command creates a data model file for the Sample ECommerce data model using username/password authentication. After running this command, the CLI will prompt you for your password. (Be sure to replace `<username>` and `<your_instance_url>` with your actual username and Sisense instance URL).

```sh
npx @sisense/sdk-cli@latest get-data-model --dataSource "Sample ECommerce" --url <your_instance_url> --output src/sample-ecommerce.ts --username <username>
```

## get-api-token

The `get-api-token` command gets an [API token for authentication](../authentication-security.md#api-token). Use a username/password to authenticate when running this command.

### Options

- `password` - (`string` | `undefined`): Password for authentication (if omitted, the CLI will prompt you to enter your password)
- `url` - (`string`): URL of the Sisense instance that your user exists in
- `username` - (`string`): Username for authentication

### Example

This example gets an API Token using username/password authentication. After running this command, the CLI will prompt you for your password. (Be sure to replace `<username>` and `<your_instance_url>` with your actual username and Sisense instance URL).

```sh
npx @sisense/sdk-cli@latest get-api-token --username <username> --url <your_instance_url>
```
