# CLI Troubleshooting

This troubleshooting guide provides possible answers to common issues that may arise when using the Compose SDK CLI.

## Get Data Model Syntax

**Issue:**

When running the CLI command, `get-data-model` to generate the TS/JS representation of my data model there is a `syntax error near unexpected token` error.

**Solution:**

You may be using the wrong format for your arguments.

* For *Windows Powershell* use double quotes for your string type arguments.
* For Linux/MAC only use double quotes for string-type arguments that contain white spaces.

## Missing data model

**Issue:**

After generating a TS/JS representation of my data model, I can't locate the generated model.

**Solution:**

1. Check the file path specified for argument `--output`. If you are using a relative path, for example, `--output src/sample-ecommerce.ts`, trace the path from the current directory you are running the CLI command in.
2. If the file is not in the specified directory, check the directory's permissions and make sure you have write access.
3. Check the authentication to your Sisense instance. See, the [Authentication](troubleshooting-setup.md#authentication) section in the Setup and Infrastructure Troubleshooting Guide for more information.
4. Verify that your Sisense instance URL is correct.
5. Verify that your Sisense instance URL is accessible. If it isn't, check your security, firewall, or VPN settings.

## Password Prompt

**Issue:**

When using a token for authentication I still see the `Enter password for username` message.

**Solution:**

Don't provide the `--username` flag together with the `--token` flag.
