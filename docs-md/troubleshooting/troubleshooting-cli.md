# CLI Troubleshooting

This troubleshooting guide provides possible answers to common issues that may arise when using the Compose SDK CLI tool.

**Question:**

I run the CLI command, `get-data-model`, to generate the TS/JS representation of my data model, and I get an `syntax error near unexpected token` error.

**Answer:**
You may be using the wrong format for your arguments.

* For *Windows Powershell* use double quotes for your string type arguments.
* For Linux/MAC use double quotes for string-type arguments that contain white spaces.

**Question:**

I have generated the TS/JS representation of my data model and can't seem to find it.

**Answer:**

1. Check the file path specified for argument `--output`. If a relative path is used, for example, `--output src/sample-ecommerce.ts`, trace the path from the current directory you have run the CLI command in.
2. If the file is not in the specified directory, check your permissions on the directory and make sure you have write access.
3. Check your authentication to your Sisense instance. See, the [Authorization](setup-infrastructure-troubleshooting.md#authorization) section in the Setup and Infrastructure troubleshooting guide for more information.
4. Verify that your Sisense instance URL is correct.
5. Verify that your Sisense instance URL is accessible. If it is not, check your security, firewall, or VPN settings.

**Question:**

I provided a token, but I still see the `Enter password for username` message.

**Answer:**

Do not provide the `--username` flag together with the `--token` flag.
