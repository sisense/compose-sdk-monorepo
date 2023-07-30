This library, which is a part of Sisense Compose SDK,
provides a set of command line utilities.
One of which is to generate TypeScript representation of a Sisense data model.

## Installation

Install the package as a dev dependency in your project.

With npm:

```sh
npm i @sisense/sdk-cli --save-dev
```

With Yarn:

```sh
yarn add @sisense/sdk-cli --dev
```

## Usage

Run the following command to create a `my-data-source.ts` file that contains a TypeScript representation of your data model.
Substitute `<username>`, `<instance url>`, `<data source name>` with the values for your instance.

With npm:

```sh
npx sdk-cli get-data-model --username "<username>" --output my-data-source.ts --dataSource "<data source name>" --url <instance url>
```

With Yarn:

```sh
yarn run sdk-cli get-data-model --username "<username>" --output my-data-source.ts --dataSource "<data source name>" --url <instance url>
```

You will be prompted for the password.

The resulting file is created in the current directory.

Instead of `--username "<username>"`, you can also use `--token <token>` to authenticate with [an API token](https://sisense.dev/guides/rest/using-rest-api.html).
Substitute `<token>`, `<instance url>`, `<data source name>` with the values for your instance.

With npm:

```sh
npx sdk-cli get-data-model --token <token> --output my-data-source.ts --dataSource "<data source name>" --url <instance url>
```

With Yarn:

```sh
yarn run sdk-cli get-data-model --token <token> --output my-data-source.ts --dataSource "<data source name>" --url <instance url>
```

Or use `--wat <wat>` to authenticate with a [Web Access Token (WAT)](https://docs.sisense.com/main/SisenseLinux/using-web-access-token.htm).
Substitute `<token>`, `<instance url>`, `<data source name>` with the values for your instance.

With npm:

```sh
npx sdk-cli get-data-model --wat <wat> --output my-data-source.ts --dataSource "<data source name>" --url <instance url>
```

With Yarn:

```sh
yarn run sdk-cli get-data-model --wat <wat> --output my-data-source.ts --dataSource "<data source name>" --url <instance url>
```
