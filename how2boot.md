# How2Boot

Instructions for running the application locally.

1. yarn chain

Starts local blockchain instance (may have to be online for this to work, for some reason).

2. yarn clean-graph-node

Cleans graph node of previous deployment data (it runs rm -rf data).

3. yarn run-graph-node

Starts a local docker node set up to host your local subgraph. If there is a problem here, try restarting docker.

4. yarn graph-create-local

Creates a local subgraph instance for deployment. This only needs to be run once - can be skipped upon subsequent local deployments.

5. yarn deploy-and-graph

Runs the deployment script in the /deploy folder, then deploys the subgraph onto the local graph node. Ends with terminal output of the graph explorer, with which you can run queries from your browser.

6. yarn start

Deploys the react application onto localhost:3000.

7. Remember to set your metamask to Localhost 8545!
