Somehow the following command does not work:

```
yarn add "@customchart/multiplehistograms@https://api.observablehq.com/@customchart/multiplehistograms.tgz?v=3"


➤ YN0000: ┌ Resolution step
➤ YN0013: │ @customchart/multiplehistograms@https://api.observablehq.com/@customchart/multiplehistogra
➤ YN0001: │ Error: @customchart/multiplehistograms@https://api.observablehq.com/@customchart/multiplehistograms.tgz?[...]: Manifest not found
```

As a workaround, the tarball was downloaded to this folder
(e.g., `customchart/multiplehistograms`) and installed locally.

See more details on a related issue at https://talk.observablehq.com/t/package-integrity-and-yarn-lock-package-lock-json/2300/6
