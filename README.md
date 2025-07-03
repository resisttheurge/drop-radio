<img src="favicon/dc-man-icon.png" alt="Drop Radio Logo">

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
npx nx affected -t lint test build e2e # lint, test, build, and run e2e tests affected by code changes
npx nx docs # generate the docsite
```

### You might need a few things

In order for you to succeed at the previous commands, you will need to install [`git`](https://git-scm.com/book/en/v2/Getting-Started-Installing-Git) and [Node.js](https://docs.npmjs.com/downloading-and-installing-node-js-and-npm) if you haven't already.
