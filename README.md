# Tomorrow Agency Shopify 2.0 theme

## Table of contents

- [Setup](#setup)
- [Branching](#branching)
- [Creating new components](#components)
- [CI/CD](#ci)

## <a name="setup"></a>Setup

1. Install the shopify cli: https://shopify.dev/themes/tools/cli/installation
1. Create a staff account for yourself in the development store to login via the cli. Having a partner account will not give the correct permissions [https://github.com/Shopify/shopify-cli/issues/1309](https://github.com/Shopify/shopify-cli/issues/1309) you can use the same email as the partner account.
1. Update the `config` within your `package.json` to reflect the dev and prod environments for your shop.
1. `yarn install`
1. In one terminal window, run `yarn watch`
1. In another terminal window, run `yarn dev` or `yarn dev:prod`
   1. Optionally, run the dev ignore or dev sync scripts, instead, to prevent the JSON templates in your dev theme from being overwritten
1. Ensure you've added the Storefront API key for your shop to your theme settings (`config/settings_data.json`).

## Linting

We're using Prettier for code formatting, ESLint for Javascript best practices, Stylelint for CSS, and Shopify's Theme Check for Liquid.

### Prettier

Prettier contains rules for consistency in code formatting.

### ESLint

You can run `yarn lint:js` to run the JS linter. These errors must be fixed before you will be able to commit your work.

### Theme Check

You can run `yarn lint:liquid` to run Shopify's Theme Check. This should also run when you save a file. It will make suggestions around liquid code formatting and best practices.

### Stylelint

The .stylelintrc extends the stylelint-config-idiomatic-order package to unify and standardize the order of your style definitions. A good tip is to update your stylelint settings in vscode to **autofix** these linting errors on save.

In vscode: Code > preferences > extensions > stylelint > extension settings > edit in settings.json

Make sure the settings below match the values in your settings config.
NOTE: stylelint.config needs to be set to null

```json
    "stylelint.config": null,
    "editor.codeActionsOnSave": {
        "source.fixAll.stylelint": true
    },
```

### Husky

Husky is running a pre-commit JS lint. The commit will fail if your code has JS errors, and you will have to fix those up and try the commit again.

## Private packages

Packages from the component library are private. To authenticate, you must create an `.npmrc` file, and include the following, replacing `PERSONAL_ACCESS_TOKEN` with a [personal access token](https://github.com/settings/tokens) from GitHub.

```
@tomorrow-agency:registry=https://npm.pkg.github.com
//npm.pkg.github.com/:_authToken=PERSONAL_ACCESS_TOKEN
always-auth=true
```

## <a name="branching"></a>Branching

Follow standard branching practices outlined in [Confluence](https://tomorrowagency.atlassian.net/wiki/spaces/SHOP/pages/2082635829/Branch+Strategy)

## <a name="components"></a>Creating new components

Each component lives within the components directory, and should include everything it needs to be functional (aside from globally shared utilities). If you're just getting started, see the "example" component to see a setup in action.

### Section files

Section files must be prepended with `section.` to be copied into the correct directory. A section named `section.example.liquid` will be renamed to `example.liquid` and moved to the `sections` dir.

The parent element for the component can use any element type, but must have an attribute called `data-section`. This attribute must match the component directory name (e.g., `data-section="example"`). The component does not need to include a script tag for data, but if it does exist, it will be automatically scraped and passed into the component JS. The `application/json` element must have the attribute `data-section-data`, would take the following format and would be nested within the parent element:

```html
<script type="application/json" data-section-data>
  {
    "pieceOfData": "I am data"
  }
</script>
```

### Snippet files

Snippet files must be prepended with `snippet.` to be copied into the correct directory. A snippet named `snippet.example.liquid` will be renamed to `example.liquid` and moved to the `snippet` dir. If you're creating a snippet that will be used in various different components, please add it to the `utils` directory instead of your components directory.

### JS

Main JS file entry points must be named `index.js`. They are dynamically loaded based on the name `data-section` attribute of their component section. When the JS is loaded, some key pieces of data are automatically passed through for use. `element` represents the parent element (with the `data-section` attribute), and `data` is all of the scraped data (if it exists), along with access to our Layout helper for media query work (accessed via `data.layout`). Architecture within each component is very flexible, but let's try to keep it as functional as possible. Here is an example of JS for a component:

```js
export default (element, data) => {
  const init = () => {
    console.log(element, data);
  };

  init();
};
```

### Styles

This theme's styling uses a Tokenized Design System, which leverages [TailwindCSS](https://tailwindcss.com/docs/container) under the hood. Changes to the token library can be made in the `tailwind-token-library.js` file.

When styling, you should use specific values from the token library and not write one-offs. 

If you need to create some sort of custom stylesheet, you can still do this, and import it within the JS file `import './example.css'`.

## <a name="ci"></a>CI/CD

We're using Github Actions to make deploys. It runs when pushing changes to the `develop` branch or any `release/**` branch, and deploys to a theme matching the branch name. For example, if you have branch `release/1.0.0` and merge branch `feature/PROJ-01/add-cool-feature`, the Github action will deploy to the theme titled `release/1.0.0`.
