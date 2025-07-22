<img src="assets/favicon/dc-man-icon.png" alt="Drop Radio Logo">

# Drop Radio Embraces You

Drop Radio is a live, endless, variable-quality multi-stream of the complete recordings of [Drop Ceiling](mailto:dropceilingband@gmail.com).

## Would you like to help?

Drop Radio is an [NX](https://nx.dev) monorepo hosted on [GitHub](https://github.com/resisttheurge/drop-radio). For proper maintenance, first clone the repository locally and then install its dependencies with `npm`:

```shell
git clone https://github.com/resisttheurge/drop-radio.git
cd drop-radio
npm install
```

Now, you should be able to explore the project and its modules using `nx`'s [commandline tools](https://nx.dev/features):

```shell
npx nx graph # open live project dependency graph view
npx nx g @nx/node:library # interactively generate a new library module
npx nx affected -t lint test build e2e -c test # lint, test, build, and run e2e tests affected by code changes
npx nx docs # generate the docsite
```

## You might need a few things

To run those commands above, you will need to install [`git`](https://git-scm.com/book/en/v2/Getting-Started-Installing-Git) and [`node`](https://docs.npmjs.com/downloading-and-installing-node-js-and-npm) if you haven't already.

You might also need [`docker`](https://docs.docker.com/desktop/) and [`gcloud`](https://cloud.google.com/docs/authentication/set-up-adc-local-dev-environment) - they help us get this thing live outside of our personal computers. Some `nx` targets like

You should definitely use an IDE or complex text editor to browse and edit this repo. We use [VSCode](https://code.visualstudio.com/Download).
